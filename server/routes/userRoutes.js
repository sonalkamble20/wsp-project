/**
 * userRoutes.js — Express router for /users
 *
 * Public routes (no auth required):
 *   POST /users/register
 *   POST /users/login
 *
 * Authenticated routes (valid JWT required):
 *   GET    /users/me
 *   PUT    /users/me
 *   DELETE /users/me
 *   GET    /users/friends
 *   POST   /users/friends/:friendId
 *   DELETE /users/friends/:friendId
 *
 * Admin-only routes (valid JWT + admin role):
 *   GET    /users
 *   PUT    /users/:id
 *   DELETE /users/:id
 */

import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
    register,
    login,
    getMe,
    getAllUsers,
    updateMe,
    deleteMe,
    deleteUser,
    updateUser,
    addFriend,
    removeFriend,
    getFriends,
} from '../controllers/userController.js';

const router = Router();

/* ── Public ── */
router.post('/register', register);
router.post('/login', login);

/* ── Authenticated ── */
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);
router.delete('/me', requireAuth, deleteMe);
router.get('/friends', requireAuth, getFriends);
router.post('/friends/:friendId', requireAuth, addFriend);
router.delete('/friends/:friendId', requireAuth, removeFriend);

/* ── Admin only ── */
router.get('/', requireAuth, requireAdmin, getAllUsers);
router.put('/:id', requireAuth, requireAdmin, updateUser);
router.delete('/:id', requireAuth, requireAdmin, deleteUser);

export default router;
