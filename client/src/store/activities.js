import { defineStore } from 'pinia';

export const useActivitiesStore = defineStore('activities', {
    state: () => ({
        activities: [
            { id: 1, userId: 2, type: 'Running', distance: 5, duration: 30, date: '2026-03-01', note: 'Morning run' },
            { id: 2, userId: 2, type: 'Cycling', distance: 15, duration: 45, date: '2026-03-03', note: 'To work' },
            { id: 3, userId: 3, type: 'Swimming', distance: 1, duration: 40, date: '2026-03-05', note: 'Pool' },
            { id: 4, userId: 4, type: 'Walking', distance: 3, duration: 45, date: '2026-03-07', note: 'Evening walk' },
            { id: 5, userId: 2, type: 'Weightlifting', distance: 0, duration: 60, date: '2026-03-08', note: 'Leg day' }
        ],
        nextId: 6
    }),
    actions: {
        addActivity(activity) {
            this.activities.push({
                ...activity,
                id: this.nextId++
            });
        },
        updateActivity(id, data) {
            const index = this.activities.findIndex(a => a.id === id);
            if (index !== -1) {
                this.activities[index] = { ...this.activities[index], ...data };
            }
        },
        deleteActivity(id) {
            this.activities = this.activities.filter(a => a.id !== id);
        }
    },
    getters: {
        getUserActivities: (state) => (userId) => {
            return state.activities.filter(a => a.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
        },
        getFriendsActivities: (state) => (friendIds) => {
            return state.activities.filter(a => friendIds.includes(a.userId)).sort((a, b) => new Date(b.date) - new Date(a.date));
        },
        getUserStats: (state) => (userId) => {
            const userActs = state.activities.filter(a => a.userId === userId);
            const totalWorkouts = userActs.length;
            const totalDuration = userActs.reduce((acc, a) => acc + (Number(a.duration) || 0), 0);
            const totalDistance = userActs.reduce((acc, a) => acc + (Number(a.distance) || 0), 0);

            const typeCounts = userActs.reduce((acc, a) => {
                acc[a.type] = (acc[a.type] || 0) + 1;
                return acc;
            }, {});

            let favoriteType = 'None';
            let maxCount = 0;
            for (const [type, count] of Object.entries(typeCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    favoriteType = type;
                }
            }

            return {
                totalWorkouts,
                totalDuration,
                totalDistance,
                favoriteType
            };
        }
    }
});
