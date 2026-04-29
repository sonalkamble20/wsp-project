/**
 * api.js — Centralized API communication module for FitTrak.
 *
 * ALL client-to-server communication goes through this module.
 * This gives us one place to:
 *  - Attach the JWT Authorization header
 *  - Handle errors and surface feedback to the user
 *  - Map HTTP status codes to user-friendly messages
 *
 * Usage:
 *   import api from '../services/api';
 *   const data = await api.get('/activities');
 *   const data = await api.post('/users/login', { email, password });
 */

// In production, the server and client are served from the same origin.
// In development, Vite proxies /api to http://localhost:5000.
const BASE_URL = '/api';

/**
 * Retrieve the JWT stored in localStorage.
 * Returns null if not logged in.
 */
function getToken() {
    return localStorage.getItem('fittrak_token');
}

/**
 * Build headers for every request.
 * Always sends Content-Type: application/json.
 * Attaches Bearer token if one is stored.
 */
function buildHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

/**
 * Core fetch wrapper.
 * Throws a plain Error with a user-friendly message on HTTP or network failure.
 */
async function request(method, path, body) {
    const options = {
        method,
        headers: buildHeaders(),
    };

    if (body !== undefined) {
        options.body = JSON.stringify(body);
    }

    let response;
    try {
        response = await fetch(`${BASE_URL}${path}`, options);
    } catch {
        throw new Error('Network error — could not reach the server.');
    }

    // Parse JSON regardless of status (error responses also carry JSON bodies)
    let data;
    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        // Prefer the server's message, fall back to a generic one
        throw new Error(data.message || `Server error (${response.status})`);
    }

    return data;
}

/* ── Convenience methods ── */
const api = {
    get:    (path)        => request('GET',    path),
    post:   (path, body)  => request('POST',   path, body),
    put:    (path, body)  => request('PUT',    path, body),
    delete: (path)        => request('DELETE', path),
};

export default api;
