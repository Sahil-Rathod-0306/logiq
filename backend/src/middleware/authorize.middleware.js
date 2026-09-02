const { recordSecurityEvent } = require("../utils/securityEvent");

const authorize = (...roles) => async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        await recordSecurityEvent({ type: "FORBIDDEN_ACCESS", req, userId: req.user?.userId, message: "Insufficient role for requested resource", severity: "MEDIUM" });
        return res.status(403).json({ success: false, message: "You do not have permission to access this resource" });
    }
    return next();
};

module.exports = { authorize };
