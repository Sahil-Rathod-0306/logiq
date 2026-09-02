const Log = require("../models/log.model");


const getSourceFrequency = async (source) => {

    const now = new Date();


    // Current 1-minute window
    const oneMinuteAgo = new Date(
        now.getTime() - 60 * 1000
    );


    // Previous 30-minute window
    const thirtyOneMinutesAgo = new Date(
        now.getTime() - 31 * 60 * 1000
    );


    const currentLogs = await Log.countDocuments({
        source,

        timestamp: {
            $gte: oneMinuteAgo,
            $lte: now
        }
    });


    const historicalLogs = await Log.countDocuments({
        source,

        timestamp: {
            $gte: thirtyOneMinutesAgo,

            $lt: oneMinuteAgo
        }
    });


    // Historical period = 30 one-minute windows.
    const averageCount = historicalLogs / 30;


    return {
        currentCount: currentLogs,

        averageCount,

        historicalLogs
    };
};


module.exports = {
    getSourceFrequency
};
