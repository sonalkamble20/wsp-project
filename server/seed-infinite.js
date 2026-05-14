
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from './models/User.js';
import Activity from './models/Activity.js';
import { VALID_TYPES } from './models/Activity.js';

const ATLAS_URI = 'mongodb+srv://sonalkamble209_db_user:dCzNjtXFNtCIYq78@cluster0.yfq7gpy.mongodb.net/fittrak?appName=Cluster0';

async function seedInfiniteData() {
    await mongoose.connect(ATLAS_URI);

    let users = await User.find();
    if (users.length < 2) {
        console.log('Not enough users. Creating dummy users...');
        const user1 = await User.create({ name: 'Bob Infinite', email: 'bob@example.com', password: 'password123' });
        const user2 = await User.create({ name: 'Alice Infinite', email: 'alice@example.com', password: 'password123' });
        
        // Make them friends so the feed works
        await User.addFriend(user1._id, user2._id);
        await User.addFriend(user2._id, user1._id);
        
        users = [user1, user2];
    }

    console.log(`Generating data for ${users.length} users...`);

    const activitiesToCreate = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomType = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)];
        
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        activitiesToCreate.push({
            owner: randomUser._id,
            type: randomType,
            date: dateStr,
            duration: 15 + Math.floor(Math.random() * 45),
            distance: Math.random() * 10,
            note: `Generated activity #${i} - Feeling great!`
        });
    }

    await Activity.insertMany(activitiesToCreate);
    console.log('Successfully seeded 50 activities for infinite scroll demo.');
    process.exit(0);
}

seedInfiniteData().catch(err => {
    console.error(err);
    process.exit(1);
});
