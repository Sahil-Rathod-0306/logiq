const express = require("express");
const controller = require("../controllers/incident.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorize.middleware");
const { getIncidentNotifications } = require("../controllers/notification.controller");
const router = express.Router();
router.use(authenticate);
router.get("/", authorize("ADMIN", "ANALYST", "VIEWER"), controller.getIncidents);
router.get("/:id/notifications", authorize("ADMIN", "ANALYST", "VIEWER"), getIncidentNotifications);
router.get("/:id", authorize("ADMIN", "ANALYST", "VIEWER"), controller.getIncidentById);
router.post("/", authorize("ADMIN", "ANALYST"), controller.createIncident);
router.patch("/:id/status", authorize("ADMIN", "ANALYST"), controller.updateIncidentStatus);
router.patch("/:id/resolve", authorize("ADMIN", "ANALYST"), controller.resolveIncident);
router.patch("/:id/false-positive", authorize("ADMIN", "ANALYST"), controller.markFalsePositive);
router.patch("/:id/assign", authorize("ADMIN"), controller.assignIncident);
module.exports = router;



// const express = require("express");

// const router = express.Router();

// router.get("/", async (req, res) => {
//     res.json({
//         success: true,
//         message: "Incident API is running"
//     });
// });

// module.exports = router;