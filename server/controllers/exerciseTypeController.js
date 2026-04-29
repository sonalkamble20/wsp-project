/**
 * exerciseTypeController.js — HTTP handlers for ExerciseType routes.
 *
 * Controller responsibilities:
 *  - Validate/parse HTTP input
 *  - Admin-only mutations (create / update / delete)
 *  - Public reads (any authenticated user can list exercise types)
 *  - Delegate all data access to the ExerciseType model
 */

import ExerciseType from '../models/ExerciseType.js';

/* ─── GET /exercise-types ─── list all active types (authenticated users) */
export async function getAllTypes(req, res) {
    try {
        const types = await ExerciseType.getAllActive();
        res.json(types);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── GET /exercise-types/all ─── list ALL types including inactive (admin only) */
export async function getAllTypesAdmin(req, res) {
    try {
        const types = await ExerciseType.find().sort({ name: 1 });
        res.json(types);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── POST /exercise-types ─── create a new exercise type (admin only) */
export async function createType(req, res) {
    try {
        const { name, description, category, caloriesPerMinute } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Exercise type name is required.' });
        }

        const existing = await ExerciseType.findByName(name);
        if (existing) {
            return res.status(409).json({ message: `Exercise type "${name}" already exists.` });
        }

        const type = await ExerciseType.create({
            name,
            description: description || '',
            category: category || 'Other',
            caloriesPerMinute: Number(caloriesPerMinute) || 5,
        });

        res.status(201).json(type);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── PUT /exercise-types/:id ─── update an exercise type (admin only) */
export async function updateType(req, res) {
    try {
        const { name, description, category, caloriesPerMinute, isActive } = req.body;
        const update = {};
        if (name !== undefined) update.name = name;
        if (description !== undefined) update.description = description;
        if (category !== undefined) update.category = category;
        if (caloriesPerMinute !== undefined) update.caloriesPerMinute = Number(caloriesPerMinute);
        if (isActive !== undefined) update.isActive = isActive;

        const type = await ExerciseType.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!type) return res.status(404).json({ message: 'Exercise type not found.' });
        res.json(type);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── DELETE /exercise-types/:id ─── delete an exercise type (admin only) */
export async function deleteType(req, res) {
    try {
        const type = await ExerciseType.findByIdAndDelete(req.params.id);
        if (!type) return res.status(404).json({ message: 'Exercise type not found.' });
        res.json({ message: `Exercise type "${type.name}" deleted.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── GET /exercise-types/calories ─── estimate calories (any authenticated user) */
export async function estimateCalories(req, res) {
    try {
        const { type, duration } = req.query;
        if (!type || !duration) {
            return res.status(400).json({ message: 'Query params "type" and "duration" are required.' });
        }

        const calories = await ExerciseType.estimateCalories(type, Number(duration));
        res.json({ type, duration: Number(duration), estimatedCalories: calories });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
