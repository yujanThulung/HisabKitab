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
                    })
                } catch (error) {
                    set({ loading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await logoutApi();
                } catch (error) {

                }
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    loading: false,
                })
            },

            refreshTokenAction: async () => {
                const currentRefreshToken = get().refreshToken;
                if (!currentRefreshToken) {
                    get().logout();
                    return;
                }

                try {
                    const data = await refreshTokenApi(currentRefreshToken);
                    set({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    });
                } catch {
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                    });
                }
            },

            initialize: () => {

            }
        }),
        {
            name: "auth-storage",
            partialize: (state: any) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            })
        }

    )
)