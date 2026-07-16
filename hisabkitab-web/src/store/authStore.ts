import { create } from "zustand";
import { persist } from "zustand/middleware";

import { login as loginApi, logout as logoutApi, refreshAccessToken as refreshTokenApi } from "../api/auth";
import type { AuthResponse, LoginPayload, User } from "../types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenAction: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,

      login: async (payload) => {
        set({ loading: true });
        try {
          const data: AuthResponse = await loginApi(payload);
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            loading: false,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await logoutApi(); // best-effort — invalidates refresh token on server
        } catch (error) {
          console.error("Logout failed:", error);
        }
        // Clear everything from store + localStorage (zustand persist handles this)
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          loading: false,
        });
      },

      // Called by the axios response interceptor when a 401 is received.
      // Attempts to exchange the stored refreshToken for a new token pair.
      refreshTokenAction: async () => {
        const currentRefreshToken = get().refreshToken;

        // No refresh token stored — nothing to exchange, log out immediately
        if (!currentRefreshToken) {
          get().logout();
          return;
        }

        try {
          // POST /auth/refresh-token → { accessToken, refreshToken }
          const data = await refreshTokenApi(currentRefreshToken);

          // Rotate both tokens — new pair is persisted to localStorage automatically
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        } catch {
          // Refresh token is expired or revoked — clear auth state.
          // ProtectedRoute will see no tokens and redirect to /login.
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
          });
        }
      },

      initialize: () => {},
    }),
    {
      name: "auth-storage",
      // Only persist tokens and user — not loading state
      partialize: (state: AuthState) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
