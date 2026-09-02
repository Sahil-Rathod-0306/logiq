const mongoose = require("mongoose");
const User = require("../models/user.model");
const { recordSecurityEvent } = require("../utils/securityEvent");
const ROLES = ["ADMIN", "ANALYST", "VIEWER"];

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) { return next(error); }
};

const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!mongoose.isValidObjectId(req.params.id) || !ROLES.includes(role))
            return res.status(400)
                .json({ success: false, message: "A valid user id and role are required" });
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        await recordSecurityEvent({ type: "USER_ROLE_UPDATED", req, userId: req.user.userId, message: `Role updated to ${role}`, severity: "HIGH" });
        return res.status(200).json({ success: true, data: user });
    } catch (error) { return next(error); }
};

module.exports = { getUsers, updateUserRole };
