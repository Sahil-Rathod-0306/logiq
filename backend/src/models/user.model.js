const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["ADMIN", "ANALYST", "VIEWER"], default: "VIEWER", trim: true }
}, { timestamps: true });

userSchema.pre("save", async function hashPassword() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
