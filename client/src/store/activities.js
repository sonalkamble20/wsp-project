/**
 * activities.js — Pinia store for workout activities.
 *
 * All data comes from the server via the centralized api.js module.
 * Ownership is enforced on the server using the JWT; the client
 * never sets the owner field itself.
 */

import { defineStore } from 'pinia';
import api from '../services/api';

export const useActivitiesStore = defineStore('activities', {
    state: () => ({
        activities: [],
        stats: null,
        friendsFeed: [],
        loading: false,
        error: null,
    }),

    actions: {
        /** GET /api/activities — fetch own activities from server */
        async fetchActivities() {
            this.loading = true;
            this.error = null;
            try {
                this.activities = await api.get('/activities');
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        /** GET /api/activities/stats — fetch aggregated stats */
        async fetchStats() {
            try {
                this.stats = await api.get('/activities/stats');
            } catch (err) {
                this.error = err.message;
            }
        },

        /** GET /api/activities/feed — fetch friends' activities */
        async fetchFriendsFeed() {
            this.loading = true;
            this.error = null;
            try {
                this.friendsFeed = await api.get('/activities/feed');
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        /** POST /api/activities — log a new activity */
        async addActivity(activityData) {
            this.error = null;
            try {
                const created = await api.post('/activities', activityData);
                this.activities.unshift(created);
                // Refresh stats after adding
                await this.fetchStats();
                return created;
            } catch (err) {
                this.error = err.message;
                return null;
            }
        },

        /** PUT /api/activities/:id — update an activity */
        async updateActivity(id, data) {
            this.error = null;
            try {
                const updated = await api.put(`/activities/${id}`, data);
                const index = this.activities.findIndex((a) => a._id === id);
                if (index !== -1) this.activities[index] = updated;
                await this.fetchStats();
                return updated;
            } catch (err) {
                this.error = err.message;
                return null;
            }
        },

        /** DELETE /api/activities/:id — delete an activity */
        async deleteActivity(id) {
            this.error = null;
            try {
                await api.delete(`/activities/${id}`);
                this.activities = this.activities.filter((a) => a._id !== id);
                await this.fetchStats();
            } catch (err) {
                this.error = err.message;
            }
        },
    },
});
