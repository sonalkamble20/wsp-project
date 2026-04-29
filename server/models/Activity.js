/**
 * Activity.js — Mongoose model for workout activity logs.
 *
 * Each activity belongs to a single user (owner) and references an
 * ExerciseType document for the workout category.
 *
 * Model responsibilities:
 *  - Schema definition and validation
 *  - Static helpers used exclusively by ActivityController
 */

import mongoose from 'mongoose';

const VALID_TYPES = [
    'Running',
    'Cycling',
    'Swimming',
    'Walking',
    'Weightlifting',
    'Yoga',
    'Other',
];

const activitySchema = new mongoose.Schema(
    {
        // The authenticated user who owns this record
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: [true, 'Activity type is required'],
            enum: VALID_TYPES,
        },
        date: {
            type: String, // ISO date string "YYYY-MM-DD" stored as string for simplicity
            required: [true, 'Date is required'],
        },
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: [1, 'Duration must be at least 1 minute'],
        },
        distance: {
            type: Number,
            default: 0,
            min: 0,
        },
        note: {
            type: String,
            trim: true,
            default: '',
        },
    },
    { timestamps: true }
);

/* ─── Static: all activities for a user, newest first ─── */
activitySchema.statics.getByOwner = function (ownerId) {
    return this.find({ owner: ownerId }).sort({ date: -1, createdAt: -1 });
};

/* ─── Static: aggregated stats for a user ─── */
activitySchema.statics.getStatsForOwner = async function (ownerId) {
    const results = await this.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalDuration: { $sum: '$duration' },
                totalDistance: { $sum: '$distance' },
            },
        },
        { $sort: { count: -1 } },
    ]);

    const totalWorkouts = results.reduce((acc, r) => acc + r.count, 0);
    const totalDuration = results.reduce((acc, r) => acc + r.totalDuration, 0);
    const totalDistance = results.reduce((acc, r) => acc + r.totalDistance, 0);
    const favoriteType = results.length > 0 ? results[0]._id : 'None';

    return { totalWorkouts, totalDuration, totalDistance, favoriteType };
};

/* ─── Static: activities for a list of user ids (friends' feed) ─── */
activitySchema.statics.getFriendsFeed = function (ownerIds) {
    return this.find({ owner: { $in: ownerIds } })
        .sort({ date: -1, createdAt: -1 })
        .populate('owner', 'name email');
};

const Activity = mongoose.model('Activity', activitySchema);

export { VALID_TYPES };
export default Activity;
