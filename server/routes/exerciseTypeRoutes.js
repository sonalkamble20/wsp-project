/**
 * exerciseTypeRoutes.js — Express router for /exercise-types
 *
 * Authenticated routes (any logged-in user):
 *   GET  /exercise-types            — list active types
 *   GET  /exercise-types/calories   — estimate calories for a type + duration
 *
 * Admin-only routes:
 *   GET    /exercise-types/all     — list all types (including inactive)
 *   POST   /exercise-types         — create a new type
 *   PUT    /exercise-types/:id     — update a type
 *   DELETE /exercise-types/:id     — delete a type
 */

import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
    getAllTypes,
    getAllTypesAdmin,
    createType,
    updateType,
    deleteType,
    estimateCalories,
} from '../controllers/exerciseTypeController.js';

const router = Router();

// All exercise type routes require at least a logged-in user
router.use(requireAuth);

// Specific paths before parameterized ones
router.get('/calories', estimateCalories);
router.get('/all', requireAdmin, getAllTypesAdmin);

router.get('/', getAllTypes);
router.post('/', requireAdmin, createType);
router.put('/:id', requireAdmin, updateType);
router.delete('/:id', requireAdmin, deleteType);

export default router;
