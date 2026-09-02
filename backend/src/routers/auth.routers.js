const express = require("express");
const { register, login, getMe } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const router = express.Router();
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authenticate, getMe);
module.exports = router;


// const express = require("express");

// const router = express.Router();

// router.get("/", (req, res) => {
//     res.json({
//         success: true,
//         message: "Authentication is disabled for development"
//     });
// });

// module.exports = router;