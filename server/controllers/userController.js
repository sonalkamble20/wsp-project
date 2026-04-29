/**
 * userController.js — HTTP handlers for User routes.
 *
 * Controller responsibilities:
 *  - Validate/parse HTTP input
 *  - Delegate all data access to the User model
 *  - Build and send HTTP responses
 *
 * The controller never touches mongoose directly — that is the model's job.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/* ─── Helper: mint a signed JWT ─── */
function signToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/* ─── POST /users/register ─── */
export async function register(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const existing = await User.findByEmail(email);
        if (existing) {
            return res.status(409).json({ message: 'An account with that email already exists.' });
        }

        const user = await User.create({ name, email, password });
        const token = signToken(user);

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── POST /users/login ─── */
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findByEmail(email);
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = signToken(user);

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── GET /users/me ─── (requires JWT) */
export async function getMe(req, res) {
    try {
        const user = await User.findById(req.user.id).select(User.publicFields());
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── GET /users ─── (admin only) */
export async function getAllUsers(req, res) {
    try {
        const users = await User.find().select(User.publicFields()).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── PUT /users/me ─── update own name or password */
export async function updateMe(req, res) {
    try {
        const { name, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (name) user.name = name;
        if (password) user.password = password; // pre-save hook re-hashes

        await user.save();
        res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── DELETE /users/me ─── delete own account */
export async function deleteMe(req, res) {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Account deleted.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── DELETE /users/:id ─── (admin only) */
export async function deleteUser(req, res) {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── PUT /users/:id ─── (admin only: update any user's role) */
export async function updateUser(req, res) {
    try {
        const { name, role } = req.body;
        const update = {};
        if (name) update.name = name;
        if (role) update.role = role;

        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select(
            User.publicFields()
        );
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── POST /users/friends/:friendId ─── add a friend */
export async function addFriend(req, res) {
    try {
        const { friendId } = req.params;
        if (friendId === req.user.id) {
            return res.status(400).json({ message: 'You cannot add yourself as a friend.' });
        }
        await User.addFriend(req.user.id, friendId);
        res.json({ message: 'Friend added.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── DELETE /users/friends/:friendId ─── remove a friend */
export async function removeFriend(req, res) {
    try {
        await User.removeFriend(req.user.id, req.params.friendId);
        res.json({ message: 'Friend removed.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── GET /users/friends ─── get current user's friends */
export async function getFriends(req, res) {
    try {
        const result = await User.getFriends(req.user.id);
        res.json(result?.friends ?? []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
