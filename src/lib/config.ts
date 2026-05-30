/**
 * Centralized API & environment configuration.
 * Resolves the backend API URL from environment variables, fallback to localhost.
 */
export const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  "http://localhost:8000";
