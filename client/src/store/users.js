/**
 * users.js — Pinia store for user directory and friend management.
 *
 * Provides:
 *  - A directory of all users (admin view)
 *  - The current user's friends list
 *  - Friend add / remove via server API
 *  - Admin user CRUD
 */

import { defineStore } from 'pinia';
import api from '../services/api';

export const useUsersStore = defineStore('users', {
    state: () => ({
        allUsers: [],       // loaded by admin
        friends: [],        // current user's friends
        loading: false,
        error: null,
    }),

    getters: {
        getUserById: (state) => (id) =>
            state.allUsers.find((u) => u._id === id || u.id === id),

        isFriend: (state) => (userId) =>
            state.friends.some((f) => f._id === userId || f.id === userId),
    },

    actions: {
        /** GET /api/users — load all users (admin only) */
        async fetchAllUsers() {
            this.loading = true;
            this.error = null;
            try {
                this.allUsers = await api.get('/users');
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        /** GET /api/users/friends — load current user's friend list */
        async fetchFriends() {
            this.error = null;
            try {
                this.friends = await api.get('/users/friends');
            } catch (err) {
                this.error = err.message;
            }
        },

        /** POST /api/users/friends/:id — add a friend */
        async addFriend(friendId) {
            this.error = null;
            try {
                await api.post(`/users/friends/${friendId}`);
                await this.fetchFriends();
            } catch (err) {
                this.error = err.message;
            }
        },

        /** DELETE /api/users/friends/:id — remove a friend */
        async removeFriend(friendId) {
            this.error = null;
            try {
                await api.delete(`/users/friends/${friendId}`);
                this.friends = this.friends.filter((f) => f._id !== friendId);
            } catch (err) {
                this.error = err.message;
            }
        },

        /** Toggle friend status — used by the Friends view */
        async toggleFriend(friendId) {
            if (this.isFriend(friendId)) {
                await this.removeFriend(friendId);
            } else {
                await this.addFriend(friendId);
            }
        },

        /* ── Admin actions ── */

        /** PUT /api/users/:id — admin update a user */
        async updateUser(id, data) {
            this.error = null;
            try {
                const updated = await api.put(`/users/${id}`, data);
                const index = this.allUsers.findIndex((u) => u._id === id);
                if (index !== -1) this.allUsers[index] = updated;
            } catch (err) {
                this.error = err.message;
            }
        },

        /** DELETE /api/users/:id — admin delete a user */
        async deleteUser(id) {
            this.error = null;
            try {
                await api.delete(`/users/${id}`);
                this.allUsers = this.allUsers.filter((u) => u._id !== id);
            } catch (err) {
                this.error = err.message;
            }
        },
    },
});
