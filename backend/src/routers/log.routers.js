const express = require("express");

const {
    createLog,
    getLogs,
    uploadLogs
} = require("../controllers/log.controller");
const multer = require("multer");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorize.middleware");
const { logLimiter } = require("../middleware/rateLimit.middleware");

const router = express.Router();
const allowedExtensions = /\.(csv|json|log|txt)$/i;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: Number(process.env.MAX_LOG_UPLOAD_BYTES) || 5 * 1024 * 1024 }, fileFilter: (req, file, callback) => callback(null, allowedExtensions.test(file.originalname)) });

router.post("/", authenticate, authorize("ADMIN", "ANALYST"), logLimiter, createLog);
router.post("/upload", authenticate, authorize("ADMIN", "ANALYST"), logLimiter, (req, res, next) => {
    upload.single("file")(req, res, (error) => {
        if (error) return res.status(400).json({ success: false, message: error.code === "LIMIT_FILE_SIZE" ? "File is too large" : "Invalid upload" });
        return uploadLogs(req, res, next);
    });
});

router.get("/", authenticate, authorize("ADMIN", "ANALYST", "VIEWER"), getLogs);

module.exports = router;




// const express = require("express");

// const {
//     createLog,
//     getLogs
// } = require("../controllers/log.controller");

// const router = express.Router();

// router.post("/", createLog);
// router.get("/", getLogs);

// module.exports = router;
