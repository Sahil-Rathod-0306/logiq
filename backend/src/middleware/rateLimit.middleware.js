const rateLimit = require("express-rate-limit");
const { recordSecurityEvent } = require("../utils/securityEvent");

const createLimiter = (windowMs, limit, label) => rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: async (req, res) => {
        await recordSecurityEvent({ type: "RATE_LIMIT_TRIGGERED", req, message: `${label} rate limit triggered`, severity: "MEDIUM" });
        res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
    }
});

const generalLimiter = createLimiter(15 * 60 * 1000, 100, "General API");
const authLimiter = createLimiter(15 * 60 * 1000, 10, "Authentication");
const logLimiter = createLimiter(15 * 60 * 1000, 300, "Log ingestion");

module.exports = { generalLimiter, authLimiter, logLimiter };
