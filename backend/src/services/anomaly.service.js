const calculateStatusScore = (statusCode) => {
    if (!Number.isInteger(statusCode)) return 0;
    if (statusCode >= 500) return 25;
    if (statusCode === 429) return 20;
    if (statusCode === 401 || statusCode === 403) return 15;
    if (statusCode === 400 || statusCode === 404) return 5;
    return 0;
};

const calculateSeverityScore = (severity) => {
    const scores = { LOW: 0, INFO: 0, MEDIUM: 10, WARNING: 10, HIGH: 20, ERROR: 20, CRITICAL: 25 };
    return scores[String(severity || "").toUpperCase()] || 0;
};

const calculateFrequencyScore = (currentCount, averageCount) => {
    if (!Number.isFinite(currentCount) || !Number.isFinite(averageCount) || averageCount <= 0) return 0;
    const ratio = currentCount / averageCount;
    if (ratio >= 5) return 20;
    if (ratio >= 3) return 10;
    return 0;
};

const detectAnomaly = (log, currentCount = 0, averageCount = 0, repeatedFailure = {}, latencyAnomaly = {}) => {
    const statusScore = calculateStatusScore(log.statusCode);
    const severityScore = calculateSeverityScore(log.severity);
    const frequencyScore = calculateFrequencyScore(currentCount, averageCount);
    const repeatedFailureScore = repeatedFailure.detected ? (repeatedFailure.score || 0) : 0;
    const latencyScore = latencyAnomaly.detected ? (latencyAnomaly.score || 0) : 0;
    const score = Math.max(0, Math.min(statusScore + severityScore + frequencyScore + repeatedFailureScore + latencyScore, 100));
    const reasons = [];

    if (statusScore) reasons.push(log.statusCode === 401 || log.statusCode === 403 ? "Authentication/authorization failure" : `HTTP status ${log.statusCode} indicates an error`);
    if (severityScore) reasons.push(`${String(log.severity).toLowerCase()} severity event`);
    if (frequencyScore) reasons.push(`Abnormally high request frequency: ${currentCount} requests/minute versus ${averageCount.toFixed(2)} historical average`);
    if (repeatedFailure.reason) reasons.push(repeatedFailure.reason);
    if (latencyAnomaly.reason) reasons.push(latencyAnomaly.reason);

    return {
        detected: score >= (Number(process.env.ANOMALY_THRESHOLD) || 50),
        score,
        reasons,
        signals: {
            status: { score: statusScore }, severity: { score: severityScore },
            frequency: { score: frequencyScore, currentCount, averageCount },
            repeatedFailure: { detected: Boolean(repeatedFailure.detected), score: repeatedFailureScore, count: repeatedFailure.count || 0 },
            latency: { detected: Boolean(latencyAnomaly.detected), score: latencyScore, zScore: latencyAnomaly.zScore || 0 }
        }
    };
};

module.exports = { calculateStatusScore, calculateSeverityScore, calculateFrequencyScore, detectAnomaly };
