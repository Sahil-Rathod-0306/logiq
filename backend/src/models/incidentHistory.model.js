const mongoose = require("mongoose");
const incidentHistorySchema = new mongoose.Schema({
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident", required: true },
    action: { type: String, required: true }, previousValue: { type: mongoose.Schema.Types.Mixed, default: null }, newValue: { type: mongoose.Schema.Types.Mixed, default: null },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, timestamp: { type: Date, default: Date.now }
}, { versionKey: false });
incidentHistorySchema.index({ incidentId: 1, timestamp: -1 });
module.exports = mongoose.model("IncidentHistory", incidentHistorySchema);
