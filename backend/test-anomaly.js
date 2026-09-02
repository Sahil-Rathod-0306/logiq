const {
    detectAnomaly
} = require("./src/services/anomaly.service");


const log = {
    statusCode: 500,
    severity: "ERROR",
    responseTime: 2500
};


const currentCount = 250;
const averageCount = 50;


const result = detectAnomaly(
    log,
    currentCount,
    averageCount
);


console.log(result);