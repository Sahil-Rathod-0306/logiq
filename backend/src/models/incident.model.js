const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 2000 },
    type: { type: String, enum: ["BRUTE_FORCE", "HIGH_ERROR_RATE", "TRAFFIC_SPIKE", "LATENCY_ANOMALY", "SERVER_ERROR", "SUSPICIOUS_ACTIVITY", "OTHER"], default: "OTHER" },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true },
    status: { type: String, enum: ["OPEN", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"], default: "OPEN" },
    source: { type: String, default: null }, ip: { type: String, default: null }, endpoint: { type: String, default: null }, eventType: { type: String, default: null },
    anomalyScore: { type: Number, required: true, min: 0, max: 100 }, latestAnomalyScore: { type: Number, min: 0, max: 100 }, anomalyReasons: { type: [String], default: [] },
    evidence: { statusCode: Number, responseTime: Number, currentCount: Number, averageCount: Number, repeatedFailureCount: Number, latencyZScore: Number },
    aiAnalysis: { status: { type: String, default: "UNAVAILABLE" }, classification: String, riskLevel: String, confidence: Number, explanation: String, indicators: { type: [String], default: [] }, recommendations: { type: [String], default: [] } },
    relatedLogIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Log" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    occurrenceCount: { type: Number, default: 1, min: 1 }, detectedAt: { type: Date, default: Date.now }, lastDetectedAt: { type: Date, default: Date.now }, acknowledgedAt: { type: Date, default: null }, resolvedAt: { type: Date, default: null }, resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, resolution: { type: String, default: null, maxlength: 2000 }
}, { timestamps: true });

incidentSchema.index({ status: 1, detectedAt: -1 });
incidentSchema.index({ ip: 1, endpoint: 1, type: 1, status: 1 });
incidentSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model("Incident", incidentSchema);
