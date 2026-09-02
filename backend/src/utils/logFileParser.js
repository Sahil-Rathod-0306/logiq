const { parse } = require("csv-parse/sync");

const MAX_RECORDS = 1000;
const toNumber = (value) => value === "" || value === undefined || value === null ? undefined : Number(value);
const normalize = (record) => ({
    timestamp: record.timestamp,
    source: record.source,
    eventType: record.eventType || record.event_type,
    severity: record.severity,
    statusCode: toNumber(record.statusCode ?? record.status ?? record.status_code),
    responseTime: toNumber(record.responseTime ?? record.response_time),
    ip: record.ip || record.ipAddress || record.ip_address,
    endpoint: record.endpoint,
    message: record.message
});

const parseTextLine = (line) => {
    const [timestamp, source, eventType, severity, statusCode, responseTime, ip, endpoint, ...message] = line.trim().split(/\s+/);
    return normalize({ timestamp, source, eventType, severity, statusCode, responseTime, ip, endpoint, message: message.join(" ") });
};

const parseLogFile = (file) => {
    const ext = file.originalname.toLowerCase().split(".").pop();
    const content = file.buffer.toString("utf8").replace(/^\uFEFF/, "");
    if (!content.trim()) throw new Error("The uploaded file is empty");
    let records;
    if (ext === "json") {
        const parsed = JSON.parse(content);
        records = Array.isArray(parsed) ? parsed : parsed?.logs;
        if (!Array.isArray(records)) throw new Error("JSON must be an array or an object containing a logs array");
    } else if (ext === "csv") {
        records = parse(content, { columns: true, skip_empty_lines: true, trim: true, relax_column_count: false });
    } else if (ext === "log" || ext === "txt") {
        records = content.split(/\r?\n/).filter((line) => line.trim()).map(parseTextLine);
    } else throw new Error("Unsupported file type. Upload CSV, JSON, LOG, or TXT files only");
    if (records.length > MAX_RECORDS) throw new Error(`A maximum of ${MAX_RECORDS} records can be processed per upload`);
    return records.map(normalize);
};
module.exports = { parseLogFile };
