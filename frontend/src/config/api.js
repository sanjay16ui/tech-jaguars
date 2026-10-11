/**
 * Centralized API configuration for BIS Sentinel frontend.
 * Uses VITE_API_BASE_URL when provided in the environment (e.g. on Vercel),
 * falling back to local backend for development.
 * Automatically removes any trailing slashes to prevent double slashes in request paths.
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
export const API_BASE = rawBaseUrl.replace(/\/+$/, '');
