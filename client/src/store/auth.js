/**
 * auth.js — Pinia store for authentication state.
 *
 * Manages:
 *  - The current user object (derived from the JWT / server response)
 *  - JWT persistence in localStorage
 *  - Login and registration API calls (delegated to api.js)
 *  - Logout
 */

import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        currentUser: JSON.parse(localStorage.getItem('fittrak_user') || 'null'),
        error: null,
        loading: false,
    }),

    getters: {
        isAuthenticated: (state) => !!state.currentUser,
        isAdmin: (state) => state.currentUser?.role === 'admin',
    },

    actions: {
        /** Persist user + token from a server auth response */
        _persistSession(token, user) {
            localStorage.setItem('fittrak_token', token);
            localStorage.setItem('fittrak_user', JSON.stringify(user));
            this.currentUser = user;
            this.error = null;
        },

        /** POST /api/users/login */
        async login(email, password) {
            this.loading = true;
            this.error = null;
            try {
                const { token, user } = await api.post('/users/login', { email, password });
                this._persistSession(token, user);
                return true;
            } catch (err) {
                this.error = err.message;
                return false;
            } finally {
                this.loading = false;
            }
        },

        /** POST /api/users/register */
        async register(name, email, password) {
            this.loading = true;
            this.error = null;
            try {
                const { token, user } = await api.post('/users/register', { name, email, password });
                this._persistSession(token, user);
                return true;
            } catch (err) {
                this.error = err.message;
                return false;
            } finally {
                this.loading = false;
            }
        },

        /** PUT /api/users/me — update own profile */
        async updateProfile(data) {
            this.loading = true;
            this.error = null;
            try {
                const updated = await api.put('/users/me', data);
                const merged = { ...this.currentUser, ...updated };
                localStorage.setItem('fittrak_user', JSON.stringify(merged));
                this.currentUser = merged;
                return true;
            } catch (err) {
                this.error = err.message;
                return false;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            localStorage.removeItem('fittrak_token');
            localStorage.removeItem('fittrak_user');
            this.currentUser = null;
            this.error = null;
        },
    },
});
