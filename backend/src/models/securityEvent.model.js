const mongoose = require("mongoose");

const securityEventSchema = new mongoose.Schema({
    type: { type: String, required: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ip: { type: String, default: null },
    endpoint: { type: String, default: null },
    message: { type: String, required: true, maxlength: 500 },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "LOW" },
    timestamp: { type: Date, default: Date.now }
}, { versionKey: false });

securityEventSchema.index({ timestamp: -1 });
securityEventSchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.model("SecurityEvent", securityEventSchema);
