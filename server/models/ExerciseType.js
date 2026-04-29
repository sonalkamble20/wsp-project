/**
 * ExerciseType.js — Mongoose model for exercise type catalog.
 *
 * Admins can manage the catalog of exercise types available to users.
 * This is the third data model, distinct from User and Activity.
 *
 * Model responsibilities:
 *  - Schema definition and validation
 *  - Static helpers used exclusively by ExerciseTypeController
 */

import mongoose from 'mongoose';

const exerciseTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Exercise type name is required'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        category: {
            type: String,
            enum: ['Cardio', 'Strength', 'Flexibility', 'Balance', 'Other'],
            default: 'Other',
        },
        // Rough calories burned per minute for this exercise type
        caloriesPerMinute: {
            type: Number,
            default: 5,
            min: 0,
        },
        // Whether this type is visible to all users (admins can hide/show)
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

/* ─── Static: all active exercise types sorted by name ─── */
exerciseTypeSchema.statics.getAllActive = function () {
    return this.find({ isActive: true }).sort({ name: 1 });
};

/* ─── Static: find by name (case-insensitive) ─── */
exerciseTypeSchema.statics.findByName = function (name) {
    return this.findOne({ name: new RegExp(`^${name}$`, 'i') });
};

/**
 * Static: estimate calories burned for a given duration using
 * this type's caloriesPerMinute rate.  Returns a plain number.
 * This is the "extra functionality" specific to fitness tracking.
 */
exerciseTypeSchema.statics.estimateCalories = async function (typeName, durationMinutes) {
    const type = await this.findByName(typeName);
    if (!type) return durationMinutes * 5; // default rate
    return Math.round(type.caloriesPerMinute * durationMinutes);
};

const ExerciseType = mongoose.model('ExerciseType', exerciseTypeSchema);

export default ExerciseType;
