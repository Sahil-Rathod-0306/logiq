const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Date,
            required: [true, "Timestamp is required"]
        },

        source: {
            type: String,
            required: [true, "Source is required"],
            trim: true
        },

        ip: {
            type: String,
            default: null,
            trim: true
        },

        endpoint: {
            type: String,
            default: null,
            trim: true
        },

        eventType: {
            type: String,
            required: [true, "Event type is required"],
            trim: true
        },

        severity: {
            type: String,
            required: [true, "Severity is required"],
            enum: ["INFO", "WARNING", "ERROR", "CRITICAL", "LOW", "MEDIUM", "HIGH"]
        },

        statusCode: {
            type: Number
        },

        message: {
            type: String,
            trim: true
        },

        responseTime: {
            type: Number,
            min: 0
        },

        anomaly: {
            detected: {
                type: Boolean,
                default: false
            },

            score: {
                type: Number,
                default: 0
            },

            reasons: {
                type: [String],
                default: []
            },

            detectedAt: {
                type: Date
            }
        },

        aiAnalysis: {
            status: {
                type: String,
                enum: ["pending", "completed", "failed", "skipped"],
                default: "skipped"
            },
            classification: {
                type: String,
                enum: ["NORMAL", "AUTHENTICATION_ATTACK", "BRUTE_FORCE", "SCANNING", "HIGH_ERROR_RATE", "TRAFFIC_SPIKE", "LATENCY_ANOMALY", "SERVER_ERROR", "SUSPICIOUS_BEHAVIOR", "UNKNOWN", null],
                default: null
            },
            riskLevel: {
                type: String,
                enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL", null],
                default: null
            },
            confidence: {
                type: Number,
                min: 0,
                max: 1,
                default: null
            },
            summary: { type: String, default: null },
            explanation: { type: String, default: null },
            indicators: { type: [String], default: [] },
            recommendedActions: { type: [String], default: [] },
            analyzedAt: { type: Date, default: null },
            message: { type: String, default: null }
        }
    },
    {
        timestamps: true
    }
);

logSchema.index({ source: 1, timestamp: -1 });
logSchema.index({ ip: 1, endpoint: 1, statusCode: 1, timestamp: -1 });
logSchema.index({ "anomaly.detected": 1, timestamp: -1 });

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
