const SecurityEvent = require("../models/securityEvent.model");

const getRequestIp = (req) => req.ip || req.socket.remoteAddress || null;

const recordSecurityEvent = async ({ type, req, userId = null, message, severity = "LOW" }) => {
    try {
        await SecurityEvent.create({ type, userId, ip: getRequestIp(req), endpoint: req.originalUrl, message, severity });
    } catch (error) {
        console.error("Security event logging failed:", error.message);
    }
};

module.exports = { getRequestIp, recordSecurityEvent };
