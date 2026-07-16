import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Guards against multiple simultaneous refresh calls
let isRefreshing = false;

// Requests that arrived while a refresh was in progress are queued here
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// Flush the queue — retry all queued requests with the new token, or reject them all
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
};

// ── Request interceptor ──────────────────────────────────────────────────────
// Reads accessToken from Zustand (persisted in localStorage) and attaches it
// to every outgoing request as a Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// On 401: attempts a silent token refresh, then retries the original request.
// On refresh failure: clears auth state so ProtectedRoute redirects to /login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      // A refresh is already running — queue this request and wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.set("Authorization", `Bearer ${token}`);
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // POST /auth/refresh-token — stores the new accessToken + refreshToken in Zustand
        await useAuthStore.getState().refreshTokenAction();
        const newToken = useAuthStore.getState().accessToken;

        // Retry all queued requests with the fresh token
        processQueue(null, newToken);

        // Retry the original failed request
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or invalid — reject everything and log out
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
