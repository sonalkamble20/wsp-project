/**
 * activityController.js — HTTP handlers for Activity routes.
 *
 * Controller responsibilities:
 *  - Validate/parse HTTP input
 *  - Enforce ownership: all writes use req.user.id from verified JWT
 *  - Delegate all data access to the Activity model
 *  - Build and send HTTP responses
 */

import Activity from '../models/Activity.js';
import ExerciseType from '../models/ExerciseType.js';
import User from '../models/User.js';

/* ─── GET /activities ─── get all activities for the logged-in user */
export async function getMyActivities(req, res) {
    try {
        const activities = await Activity.getByOwner(req.user.id);
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── POST /activities ─── log a new activity */
export async function createActivity(req, res) {
    try {
        const { type, date, duration, distance, note } = req.body;

        if (!type || !date || !duration) {
            return res.status(400).json({ message: 'Type, date, and duration are required.' });
        }

        // Estimate calories using the ExerciseType model's fitness-specific logic
        const estimatedCalories = await ExerciseType.estimateCalories(type, Number(duration));

        const activity = await Activity.create({
            owner: req.user.id, // ownership comes from JWT, not the request body
            type,
            date,
            duration: Number(duration),
            distance: Number(distance) || 0,
            note: note || '',
        });

        res.status(201).json({ ...activity.toObject(), estimatedCalories });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── PUT /activities/:id ─── update own activity */
export async function updateActivity(req, res) {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found.' });

        // Ownership check — only the owner may update
        if (activity.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You do not own this activity.' });
        }

        const { type, date, duration, distance, note } = req.body;
        if (type) activity.type = type;
        if (date) activity.date = date;
        if (duration !== undefined) activity.duration = Number(duration);
        if (distance !== undefined) activity.distance = Number(distance);
        if (note !== undefined) activity.note = note;

        await activity.save();
        res.json(activity);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── DELETE /activities/:id ─── delete own activity */
export async function deleteActivity(req, res) {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found.' });

        // Ownership check
        if (activity.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You do not own this activity.' });
        }

        await activity.deleteOne();
        res.json({ message: 'Activity deleted.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── GET /activities/stats ─── aggregated stats for the logged-in user */
export async function getMyStats(req, res) {
    try {
        const stats = await Activity.getStatsForOwner(req.user.id);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/* ─── GET /activities/feed ─── paginated activities from friends */
export async function getFriendsFeed(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Retrieve friends list for the current user
        const userWithFriends = await User.getFriends(req.user.id);
        const friendIds = (userWithFriends?.friends ?? []).map((f) => f._id);

        // Fetch feed data and total count in parallel
        const [items, total] = await Promise.all([
            Activity.getFriendsFeed(friendIds, skip, limit),
            Activity.countFriendsFeed(friendIds),
        ]);

        res.json({
            items,
            total,
            page,
            limit,
            hasMore: skip + items.length < total,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
