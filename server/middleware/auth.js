/**
 * auth.js — JWT middleware for FitTrak.
 *
 * Exports:
 *  requireAuth  — attaches req.user from a verified JWT; rejects if missing/invalid
 *  requireAdmin — must follow requireAuth; rejects if user is not an admin
 */

import jwt from 'jsonwebtoken';

/**
 * Verifies the Bearer token in the Authorization header.
 * On success, attaches { id, email, role } to req.user and calls next().
 * On failure, responds with 401.
 */
export function requireAuth(req, res, next) {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Only forward minimal, safe fields to downstream handlers
        req.user = { id: payload.id, email: payload.email, role: payload.role };
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
}

/**
 * Must be used AFTER requireAuth.
 * Rejects the request if the authenticated user is not an admin.
 */
export function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
}
