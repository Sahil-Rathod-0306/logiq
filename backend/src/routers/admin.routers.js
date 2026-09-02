const express = require("express");
const { getUsers, updateUserRole } = require("../controllers/admin.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorize.middleware");
const router = express.Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/users", getUsers);
router.patch("/users/:id/role", updateUserRole);
module.exports = router;



// const express = require("express");

// const router = express.Router();

// router.get("/", (req, res) => {
//     res.json({
//         success: true,
//         message: "Admin API is running"
//     });
// });

// module.exports = router;