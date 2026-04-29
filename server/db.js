/**
 * db.js — Centralized database connection module.
 * All database access is routed through this module.
 * Models and controllers never interact with mongoose directly.
 */

import mongoose from 'mongoose';

let connected = false;

/**
 * Connects to MongoDB using the URI from environment variables.
 * Subsequent calls are no-ops if already connected.
 */
export async function connectDB() {
    if (connected) return;

    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is not defined in the environment variables.');
    }

    await mongoose.connect(uri);
    connected = true;
    console.log('✅  MongoDB connected:', mongoose.connection.host);
}

/**
 * Gracefully disconnect from MongoDB (used in tests / shutdown hooks).
 */
export async function disconnectDB() {
    if (!connected) return;
    await mongoose.disconnect();
    connected = false;
    console.log('🔌  MongoDB disconnected.');
}

export default mongoose;
