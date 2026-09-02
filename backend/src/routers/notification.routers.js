const express = require("express");
const router = express.Router();

const controller = require("../controllers/notification.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorize.middleware");

// DEBUG: Check what is undefined in your terminal when you run the app
console.log("authenticate:", typeof authenticate);
console.log("authorize:", typeof authorize("ADMIN"));
console.log("createNotification:", typeof controller.createNotification);

router.get("/", authenticate, authorize("ADMIN", "ANALYST", "VIEWER"), controller.getNotifications);
router.get("/", authenticate, authorize("ADMIN", "ANALYST", "VIEWER"), controller.getNotifications);
router.get("/:id", authenticate, authorize("ADMIN", "ANALYST", "VIEWER"), controller.getNotificationById);
router.post("/:id/retry", authenticate, authorize("ADMIN", "ANALYST"), controller.retryNotification);

module.exports = router;