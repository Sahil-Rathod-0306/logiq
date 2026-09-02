const Log = require("../models/log.model");

const LATENCY_HISTORY_MS = Number(process.env.LATENCY_HISTORY_WINDOW_MS) || 30 * 60 * 1000;
const MINIMUM_SAMPLES = 5;

const getLatencyScore = (absoluteZScore) => {
    if (absoluteZScore >= 3) return 25;
    if (absoluteZScore >= 2) return 15;
    if (absoluteZScore >= 1.5) return 10;
    return 0;
};

const detectLatencyAnomaly = async (source, responseTime) => {
    if (!source || !Number.isFinite(responseTime)) return { detected: false, score: 0, zScore: 0, mean: 0, standardDeviation: 0, reason: null };

    const records = await Log.find({
        source,
        timestamp: { $gte: new Date(Date.now() - LATENCY_HISTORY_MS), $lte: new Date() },
        responseTime: { $type: "number" }
    }).select("responseTime -_id").lean();
    const values = records.map((record) => record.responseTime).filter(Number.isFinite);
    if (values.length < MINIMUM_SAMPLES) return { detected: false, score: 0, zScore: 0, mean: 0, standardDeviation: 0, reason: null };

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    const zScore = standardDeviation === 0 ? 0 : (responseTime - mean) / standardDeviation;
    const score = getLatencyScore(Math.abs(zScore));

    return {
        detected: score > 0,
        score,
        zScore: Number(zScore.toFixed(2)),
        mean: Number(mean.toFixed(2)),
        standardDeviation: Number(standardDeviation.toFixed(2)),
        reason: score > 0 ? `Unusual response time: ${responseTime}ms (baseline ${mean.toFixed(1)}ms, z-score ${zScore.toFixed(2)})` : null
    };
};

module.exports = { detectLatencyAnomaly };
