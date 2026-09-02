const Log = require("../models/log.model");

const FAILURE_WINDOW_MS = Number(process.env.REPEATED_FAILURE_WINDOW_MS) || 60 * 1000;

const getFailureScore = (count) => {
    if (count >= 10) return 30;
    if (count >= 5) return 20;
    if (count >= 3) return 10;
    return 0;
};

const detectRepeatedFailures = async (ip, endpoint) => {
    if (!ip || !endpoint) return { detected: false, count: 0, score: 0, reason: null };

    const count = await Log.countDocuments({
        ip,
        endpoint,
        statusCode: { $in: [401, 403] },
        timestamp: { $gte: new Date(Date.now() - FAILURE_WINDOW_MS), $lte: new Date() }
    });
    const score = getFailureScore(count);

    return {
        detected: score > 0,
        count,
        score,
        reason: score > 0 ? `${count} repeated authentication failures from ${ip} on ${endpoint}` : null
    };
};

module.exports = { detectRepeatedFailures };
