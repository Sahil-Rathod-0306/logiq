const net = require("net");
const Log = require("../models/log.model");
const { detectAnomaly } = require("../services/anomaly.service");
const { getSourceFrequency } = require("../services/frequency.service");
const { detectRepeatedFailures } = require("../services/repeatedFailure.service");
const { detectLatencyAnomaly } = require("../services/latency.service");
const { analyzeAnomaly } = require("../services/aiAnalysis.service");
const { recordSecurityEvent } = require("../utils/securityEvent");
const { createOrUpdateIncident } = require("../services/incident.service");
const { scheduleIncidentNotifications } = require("../services/notification.service");
const { parseLogFile } = require("../utils/logFileParser");

const SEVERITY_ALIASES = { low: "LOW", medium: "MEDIUM", high: "HIGH", critical: "CRITICAL", info: "INFO", warning: "WARNING", error: "ERROR" };

const createAiInput = (log, anomalyResult, repeatedFailure, latencyAnomaly) => ({
    log,
    score: anomalyResult.score,
    reasons: anomalyResult.reasons,
    signals: anomalyResult.signals,
    repeatedFailure,
    latency: latencyAnomaly
});

const createLog = async (req, res) => {
    try {
        const { timestamp, source, ip, endpoint, eventType, severity, statusCode, message, responseTime } = req.body;
        const parsedTimestamp = new Date(timestamp);
        const normalizedSeverity = typeof severity === "string" ? SEVERITY_ALIASES[severity.toLowerCase()] : null;

        if (!timestamp || Number.isNaN(parsedTimestamp.getTime())) return res.status(400).json({ success: false, message: "A valid timestamp is required" });
        if (typeof source !== "string" || !source.trim()) return res.status(400).json({ success: false, message: "Source is required" });
        if (typeof eventType !== "string" || !eventType.trim()) return res.status(400).json({ success: false, message: "Event type is required" });
        if (!normalizedSeverity) return res.status(400).json({ success: false, message: "Severity must be low, medium, high, critical, info, warning, or error" });
        if (statusCode !== undefined && (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599)) return res.status(400).json({ success: false, message: "statusCode must be an integer from 100 to 599" });
        if (responseTime !== undefined && (!Number.isFinite(responseTime) || responseTime < 0)) return res.status(400).json({ success: false, message: "responseTime must be a number greater than or equal to 0" });
        if (ip !== undefined && ip !== null && (!ip || net.isIP(ip) === 0)) return res.status(400).json({ success: false, message: "ip must be a valid IPv4 or IPv6 address" });
        if (endpoint !== undefined && endpoint !== null && typeof endpoint !== "string") return res.status(400).json({ success: false, message: "endpoint must be a string" });

        const { currentCount, averageCount } = await getSourceFrequency(source);
        const adjustedCurrentCount = currentCount + 1;
        const [repeatedFailure, latencyAnomaly] = await Promise.all([
            detectRepeatedFailures(ip, endpoint),
            detectLatencyAnomaly(source, responseTime)
        ]);
        const anomalyResult = detectAnomaly(
            { timestamp: parsedTimestamp, source, ip, endpoint, eventType, severity: normalizedSeverity, statusCode, message, responseTime },
            adjustedCurrentCount, averageCount, repeatedFailure, latencyAnomaly
        );

        const logData = {
            timestamp: parsedTimestamp, source, ip, endpoint, eventType,
            severity: normalizedSeverity, statusCode, message, responseTime
        };

        const aiAnalysis = anomalyResult.detected
            ? await analyzeAnomaly(createAiInput(logData, anomalyResult, repeatedFailure, latencyAnomaly))
            : { status: "skipped" };

        if (anomalyResult.detected) {
            await recordSecurityEvent({
                type: "ANOMALY_DETECTED",
                req,
                userId: req.user?.userId,
                message: `Anomaly score ${anomalyResult.score} detected for ${source}`,
                severity: anomalyResult.score >= 75 ? "CRITICAL" : "HIGH"
            });
        }
        if (aiAnalysis.status === "failed") {
            await recordSecurityEvent({ type: "AI_ANALYSIS_FAILED", req, userId: req.user?.userId, message: "AI analysis was unavailable", severity: "LOW" });
        }

        const log = await Log.create({
            ...logData,
            ip: ip || null,
            endpoint: endpoint || null,
            anomaly: {
                detected: anomalyResult.detected,
                score: anomalyResult.score,
                reasons: anomalyResult.reasons,
                detectedAt: anomalyResult.detected ? new Date() : null
            },
            aiAnalysis: {
                ...aiAnalysis,
                analyzedAt: aiAnalysis.status === "completed" ? new Date() : null
            }
        });

        let incident = null;
        try {
            incident = await createOrUpdateIncident({
                log: logData,
                logId: log._id,
                anomalyResult,
                repeatedFailure,
                latencyAnomaly,
                aiAnalysis,
                createdBy: req.user?.userId
            });
            if (incident?.$locals.created) {
                scheduleIncidentNotifications(incident).catch((error) => console.error("Notification scheduling failed:", error.message));
            }
        } catch (error) {
            console.error("Incident creation failed:", error.message);
            await recordSecurityEvent({ type: "INCIDENT_CREATION_FAILED", req, userId: req.user?.userId, message: "Automatic incident creation failed", severity: "MEDIUM" });
        }

        const responseData = log.toObject();
        if (incident) responseData.incident = { id: incident._id, status: incident.status, type: incident.type, severity: incident.severity };
        return res.status(201).json({ success: true, message: anomalyResult.detected ? "Log created and anomaly detected" : "Log created successfully", data: responseData });
    } catch (error) {
        console.error("Create log error:", error);
        return res.status(500).json({ success: false, message: "Failed to create log", error: process.env.NODE_ENV === "production" ? undefined : error.message });
    }
};

const getLogs = async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 });
        return res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        console.error("Get logs error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch logs", error: process.env.NODE_ENV === "production" ? undefined : error.message });
    }
};

const uploadLogs = async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "A CSV, JSON, LOG, or TXT file is required" });
    let records;
    try { records = parseLogFile(req.file); }
    catch (error) { return res.status(400).json({ success: false, message: error.message }); }

    const result = { totalRecords: records.length, processedRecords: 0, failedRecords: 0, anomaliesDetected: 0, incidentsCreated: 0, securityEventsCreated: 0, errors: [] };
    for (let index = 0; index < records.length; index += 1) {
        let statusCode = 500;
        let payload;
        const childResponse = {
            status(code) { statusCode = code; return this; },
            json(data) { payload = data; return this; }
        };
        try {
            await createLog({ ...req, body: records[index] }, childResponse);
            if (statusCode >= 200 && statusCode < 300) {
                result.processedRecords += 1;
                if (payload?.data?.anomaly?.detected) result.anomaliesDetected += 1;
                if (payload?.data?.incident?.id) result.incidentsCreated += 1;
            } else {
                result.failedRecords += 1;
                result.errors.push({ row: index + 1, message: payload?.message || "Record could not be processed" });
            }
        } catch (error) {
            result.failedRecords += 1;
            result.errors.push({ row: index + 1, message: "Record could not be processed" });
        }
    }
    return res.status(200).json({ success: true, message: "Log file processed successfully", data: result });
};

module.exports = { createLog, getLogs, uploadLogs };

