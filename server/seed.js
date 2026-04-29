/**
 * seed.js — Seeds the database with default exercise types.
 * Run once: `node server/seed.js`
 */

import 'dotenv/config';
import { connectDB } from './db.js';
import ExerciseType from './models/ExerciseType.js';

const DEFAULT_TYPES = [
    { name: 'Running',       category: 'Cardio',     caloriesPerMinute: 10, description: 'Outdoor or treadmill running' },
    { name: 'Cycling',       category: 'Cardio',     caloriesPerMinute: 8,  description: 'Road or stationary cycling' },
    { name: 'Swimming',      category: 'Cardio',     caloriesPerMinute: 9,  description: 'Lap swimming or open water' },
    { name: 'Walking',       category: 'Cardio',     caloriesPerMinute: 4,  description: 'Brisk walking' },
    { name: 'Weightlifting', category: 'Strength',   caloriesPerMinute: 6,  description: 'Free weights or machine training' },
    { name: 'Yoga',          category: 'Flexibility', caloriesPerMinute: 3, description: 'Yoga and stretching sessions' },
    { name: 'Other',         category: 'Other',       caloriesPerMinute: 5, description: 'Any other physical activity' },
];

async function seed() {
    await connectDB();

    for (const typeData of DEFAULT_TYPES) {
        const existing = await ExerciseType.findByName(typeData.name);
        if (!existing) {
            await ExerciseType.create(typeData);
            console.log(`  ✅ Created: ${typeData.name}`);
        } else {
            console.log(`  ⏭️  Skipped (exists): ${typeData.name}`);
        }
    }

    console.log('Seeding complete.');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
