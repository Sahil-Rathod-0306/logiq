const jwt = require("jsonwebtoken");
const { recordSecurityEvent } = require("../utils/securityEvent");

const authenticate = async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token || !process.env.JWT_SECRET) {
        await recordSecurityEvent({ type: "UNAUTHORIZED_ACCESS", req, message: "Missing authentication token", severity: "MEDIUM" });
        return res.status(401).json({ success: false, message: "Authentication is required" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        await recordSecurityEvent({ type: "INVALID_JWT", req, message: "Invalid or expired authentication token", severity: "MEDIUM" });
        return res.status(401).json({ success: false, message: "Invalid or expired authentication token" });
    }
};

module.exports = { authenticate };
