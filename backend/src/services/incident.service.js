const mongoose = require("mongoose");
const Incident = require("../models/incident.model");
const IncidentHistory = require("../models/incidentHistory.model");
const User = require("../models/user.model");

const INCIDENT_THRESHOLD = Number(process.env.INCIDENT_THRESHOLD) || 60;
const getIncidentSeverity = (score) => score >= 90 ? "CRITICAL" : score >= 75 ? "HIGH" : score >= 60 ? "MEDIUM" : "LOW";
const detectIncidentType = (result, log) => {
    if (result.signals.repeatedFailure.detected) return { type: "BRUTE_FORCE", title: `Possible brute-force activity on ${log.endpoint || log.source}` };
    if (result.signals.latency.detected) return { type: "LATENCY_ANOMALY", title: `Latency anomaly in ${log.source}` };
    if (log.statusCode >= 500) return { type: "SERVER_ERROR", title: `Server error anomaly in ${log.source}` };
    if (result.signals.frequency.score > 0) return { type: "TRAFFIC_SPIKE", title: `Traffic spike in ${log.source}` };
    return { type: "SUSPICIOUS_ACTIVITY", title: `Suspicious activity in ${log.source}` };
};
const addHistory = (incidentId, action, previousValue, newValue, performedBy) => IncidentHistory.create({ incidentId, action, previousValue, newValue, performedBy });
const aiForIncident = (ai) => ai.status === "completed" ? { status: "COMPLETED", classification: ai.classification, riskLevel: ai.riskLevel, confidence: ai.confidence, explanation: ai.explanation, indicators: ai.indicators, recommendations: ai.recommendedActions } : { status: "UNAVAILABLE" };

const createOrUpdateIncident = async ({ log, logId, anomalyResult, repeatedFailure, latencyAnomaly, aiAnalysis, createdBy }) => {
    if (!anomalyResult.detected || anomalyResult.score < INCIDENT_THRESHOLD) return null;
    const { type, title } = detectIncidentType(anomalyResult, log);
    const duplicateFilter = { ip: log.ip || null, endpoint: log.endpoint || null, type, status: { $in: ["OPEN", "INVESTIGATING"] } };
    const evidence = { statusCode: log.statusCode, responseTime: log.responseTime, currentCount: anomalyResult.signals.frequency.currentCount, averageCount: anomalyResult.signals.frequency.averageCount, repeatedFailureCount: repeatedFailure.count, latencyZScore: latencyAnomaly.zScore };
    const existing = await Incident.findOne(duplicateFilter);
    if (existing) {
        existing.occurrenceCount += 1; existing.lastDetectedAt = new Date(); existing.latestAnomalyScore = anomalyResult.score; existing.anomalyReasons = anomalyResult.reasons; existing.evidence = evidence;
        if (logId) existing.relatedLogIds.addToSet(logId);
        await existing.save(); await addHistory(existing._id, "ANOMALY_RECORDED", null, { score: anomalyResult.score }, createdBy); existing.$locals.created = false; return existing;
    }
    const incident = await Incident.create({ title, description: anomalyResult.reasons.join("; ") || "Anomaly threshold reached", type, severity: getIncidentSeverity(anomalyResult.score), source: log.source, ip: log.ip || null, endpoint: log.endpoint || null, eventType: log.eventType, anomalyScore: anomalyResult.score, latestAnomalyScore: anomalyResult.score, anomalyReasons: anomalyResult.reasons, evidence, aiAnalysis: aiForIncident(aiAnalysis), relatedLogIds: logId ? [logId] : [], createdBy, detectedAt: new Date(), lastDetectedAt: new Date() });
    await addHistory(incident._id, "INCIDENT_CREATED", null, { score: incident.anomalyScore, type: incident.type }, createdBy); incident.$locals.created = true; return incident;
};

const createIncident = async (data, createdBy) => {
    const incident = await Incident.create({ ...data, createdBy, lastDetectedAt: data.detectedAt || new Date() });
    await addHistory(incident._id, "INCIDENT_CREATED_MANUALLY", null, { type: incident.type }, createdBy);
    return incident;
};

const getIncidentById = async (id) => mongoose.isValidObjectId(id) ? Incident.findById(id).populate("assignedTo createdBy resolvedBy", "name email role") : null;
const getIncidents = async ({ status, severity, type, source, ip, assignedTo, page = 1, limit = 20, sort = "detectedAt", order = "desc" }) => {
    const filter = {}; if (status) filter.status = status; if (severity) filter.severity = severity; if (type) filter.type = type; if (source) filter.source = source; if (ip) filter.ip = ip; if (assignedTo) filter.assignedTo = assignedTo;
    const direction = order === "asc" ? 1 : -1; const total = await Incident.countDocuments(filter); const data = await Incident.find(filter).sort({ [sort]: direction }).skip((page - 1) * limit).limit(limit).populate("assignedTo", "name email role"); return { total, data };
};
const updateIncidentStatus = async (incident, status, performedBy) => { const allowed = { OPEN: ["INVESTIGATING", "FALSE_POSITIVE"], INVESTIGATING: ["RESOLVED", "FALSE_POSITIVE"] }; if (!allowed[incident.status]?.includes(status)) throw Object.assign(new Error("Invalid incident status transition"), { status: 400 }); const previous = incident.status; incident.status = status; if (status === "INVESTIGATING") incident.acknowledgedAt = new Date(); await incident.save(); await addHistory(incident._id, "STATUS_CHANGED", previous, status, performedBy); return incident; };
const assignIncident = async (incident, assignedTo, performedBy) => { if (!mongoose.isValidObjectId(assignedTo) || !await User.exists({ _id: assignedTo })) throw Object.assign(new Error("Assigned user was not found"), { status: 400 }); const previous = incident.assignedTo; incident.assignedTo = assignedTo; await incident.save(); await addHistory(incident._id, "ASSIGNED", previous, assignedTo, performedBy); return incident; };
const resolveIncident = async (incident, resolution, performedBy) => { if (incident.status !== "INVESTIGATING" || typeof resolution !== "string" || !resolution.trim()) throw Object.assign(new Error("An investigating incident and a resolution are required"), { status: 400 }); incident.status = "RESOLVED"; incident.resolution = resolution.trim(); incident.resolvedAt = new Date(); incident.resolvedBy = performedBy; await incident.save(); await addHistory(incident._id, "RESOLVED", null, incident.resolution, performedBy); return incident; };
const markFalsePositive = async (incident, performedBy) => updateIncidentStatus(incident, "FALSE_POSITIVE", performedBy);
module.exports = { createIncident, createOrUpdateIncident, getIncidentSeverity, detectIncidentType, getIncidentById, getIncidents, updateIncidentStatus, assignIncident, resolveIncident, markFalsePositive };
