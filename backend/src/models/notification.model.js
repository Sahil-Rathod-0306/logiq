const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", required: true },
    type: { type: String, enum: ["INCIDENT_CREATED", "CRITICAL_INCIDENT", "INCIDENT_RESOLVED", "SECURITY_ALERT"], required: true },
    channel: { type: String, enum: ["EMAIL", "WEBHOOK", "TELEGRAM", "DISCORD"], required: true },
    recipient: { type: String, default: null }, subject: { type: String, required: true, maxlength: 200 }, message: { type: String, required: true, maxlength: 10000 }, payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["PENDING", "PROCESSING", "SENT", "FAILED", "RETRYING"], default: "PENDING" }, attempts: { type: Number, default: 0 }, maxAttempts: { type: Number, default: 3 }, lastAttemptAt: Date, sentAt: Date, failedAt: Date, error: { type: String, default: null, maxlength: 500 }
}, { timestamps: true });
notificationSchema.index({ incidentId: 1, channel: 1, type: 1 }, { unique: true });
notificationSchema.index({ status: 1, createdAt: -1 });
module.exports = mongoose.model("Notification", notificationSchema);
