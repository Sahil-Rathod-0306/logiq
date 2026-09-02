const jwt = require("jsonwebtoken");

const generateToken = (user) => jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
);

module.exports = { generateToken };
