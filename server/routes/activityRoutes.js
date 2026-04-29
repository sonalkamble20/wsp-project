/**
 * activityRoutes.js — Express router for /activities
 *
 * All routes require a valid JWT (requireAuth).
 *
 *   GET    /activities         — list own activities
 *   POST   /activities         — log a new activity
 *   PUT    /activities/:id     — update own activity
 *   DELETE /activities/:id     — delete own activity
 *   GET    /activities/stats   — get aggregated stats for current user
 *   GET    /activities/feed    — get friends' latest activities
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
    getMyActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    getMyStats,
    getFriendsFeed,
} from '../controllers/activityController.js';

const router = Router();

// All activity routes require authentication
router.use(requireAuth);

// Order matters — specific paths before parameterized ones
router.get('/stats', getMyStats);
router.get('/feed', getFriendsFeed);

router.get('/', getMyActivities);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
