/**
 * index.js — FitTrak Express server entry point.
 *
 * Responsibilities:
 *  - Load environment variables
 *  - Connect to MongoDB via the centralized db module
 *  - Mount route groups
 *  - Serve the Vue production build in production
 *  - Start the HTTP server
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './server/db.js';
import userRoutes from './server/routes/userRoutes.js';
import activityRoutes from './server/routes/activityRoutes.js';
import exerciseTypeRoutes from './server/routes/exerciseTypeRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

/* ── Middleware ── */
app.use(cors());
app.use(express.json());

/* ── API routes ── */
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/exercise-types', exerciseTypeRoutes);

/* ── Serve the Vue production build in production ── */
if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, 'client', 'dist');
    app.use(express.static(clientDist));

    // SPA fallback — any non-API route returns index.html
    app.get(/^(?!\/api).*/, (_req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'));
    });
}

/* ── Start ── */
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 FitTrak server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });
