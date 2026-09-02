const User = require("../models/user.model");
const { generateToken } = require("../utils/generateToken");
const { recordSecurityEvent } = require("../utils/securityEvent");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (typeof name !== "string" || !name.trim() || name.length > 80) return res.status(400).json({ success: false, message: "A valid name is required" });
        if (typeof email !== "string" || !EMAIL_PATTERN.test(email) || email.length > 254) return res.status(400).json({ success: false, message: "A valid email is required" });
        if (typeof password !== "string" || password.length < 8 || password.length > 128) return res.status(400).json({ success: false, message: "Password must be between 8 and 128 characters" });
        const normalizedEmail = email.toLowerCase().trim();
        if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, message: "An account with this email already exists" });
        const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role: "VIEWER" });
        await recordSecurityEvent({ type: "USER_REGISTERED", req, userId: user._id, message: "Viewer account registered" });
        return res.status(201).json({ success: true, message: "Account created", data: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) { return next(error); }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ success: false, message: "Email and password are required" });
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            await recordSecurityEvent({ type: "FAILED_LOGIN", req, message: "Failed login attempt", severity: "MEDIUM" });
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const token = generateToken(user);
        await recordSecurityEvent({ type: "SUCCESSFUL_LOGIN", req, userId: user._id, message: "User login succeeded" });
        return res.status(200).json({ success: true, message: "Login successful", token, data: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) { return next(error); }
};

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        return res.status(200).json({ success: true, data: user });
    } catch (error) { return next(error); }
};

module.exports = { register, login, getMe };
