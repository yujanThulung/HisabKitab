import { create } from "zustand";
import { persist } from "zustand/middleware";


import { login as loginApi, logout as logoutApi } from "../api/auth";
import type { AuthResponse, LoginPayload, User } from "../types/auth";


interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    logout: () => Promise<void>;

    initialize: () => void;
}


export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            loading: false,

            get isAuthenticated() {
                return !!get().accessToken;
            },

            login: async (payload) => {
                set({ loading: true });

                try {
                    const data: AuthResponse = await loginApi(payload);

                    set({
                        user: data.user,
                        accessToken: data.accessToken,
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
                    loading: false,
                })
            },

            initialize: () => {

            }
        }),
        {
            name: "auth-storage",
            partialize: (state: any) => ({
                user: state.user,
                accessToken: state.accessToken
            })
        }

    )
)