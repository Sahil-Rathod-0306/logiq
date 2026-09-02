const SENSITIVE_PATTERN = /(password|token|accessToken|refreshToken|authorization|cookie|apiKey|secret|privateKey)\s*[:=]\s*[^\s,;]+/gi;

const sanitizeText = (value) => String(value || "").replace(SENSITIVE_PATTERN, "$1=[REDACTED]");

const sanitizeForAI = (log) => ({
    timestamp: log.timestamp,
    source: log.source,
    ip: log.ip || null,
    endpoint: log.endpoint || null,
    eventType: log.eventType,
    severity: log.severity,
    statusCode: log.statusCode,
    responseTime: log.responseTime,
    message: sanitizeText(log.message)
});

module.exports = { sanitizeForAI, sanitizeText };
