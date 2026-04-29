/**
 * User.js — Mongoose model for FitTrak users.
 *
 * Responsibilities (Model layer):
 *  - Define the schema and field-level validation
 *  - Hash passwords before saving
 *  - Expose static helper methods used by the UserController
 *
 * The controller is responsible for HTTP logic; the model handles data logic.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        // Array of ObjectIds referencing other users
        friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

/* ─── Pre-save hook: hash password if it was changed ─── */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
});

/* ─── Instance method: compare candidate password with stored hash ─── */
userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

/* ─── Static: find user by email (used during login) ─── */
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase().trim() });
};

/* ─── Static: get a safe public projection (no password) ─── */
userSchema.statics.publicFields = function () {
    return '-password';
};

/* ─── Static: add a friend (bidirectional) ─── */
userSchema.statics.addFriend = async function (userId, friendId) {
    await this.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } });
    await this.findByIdAndUpdate(friendId, { $addToSet: { friends: userId } });
};

/* ─── Static: remove a friend (bidirectional) ─── */
userSchema.statics.removeFriend = async function (userId, friendId) {
    await this.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await this.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
};

/* ─── Static: get a user's friend list, populated ─── */
userSchema.statics.getFriends = function (userId) {
    return this.findById(userId).populate('friends', '-password');
};

const User = mongoose.model('User', userSchema);

export default User;
