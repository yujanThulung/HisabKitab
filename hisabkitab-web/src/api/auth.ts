import api from "./axios";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

import type {
    LoginPayload,
    RegisterPayload,
    AuthResponse,
    RefreshTokenResponse
} from "../types/auth";


export const login = async (
    payload: LoginPayload
): Promise<AuthResponse> => {
    const isEmail = payload.identifier.includes("@");

    const response = await api.post("/login", {
        ...(isEmail ? { email: payload.identifier } : { phone: payload.identifier }),
        password: payload.password,
    });

    return response.data.data;
}


export const register = async (payload: RegisterPayload) => {
    const response = await api.post("/auth/register", payload);
    return response.data;
}

// Uses plain axios (no interceptors) to avoid a loop where a 401 response
// triggers a refresh attempt, which fails, which calls logout again.
// Access token is attached manually since the interceptor is bypassed.
export const logout = async (refreshToken?: string | null) => {
    const accessToken = useAuthStore.getState().accessToken;
    await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        { refreshToken },
        {
            headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
        }
    );
}

// Uses a plain axios instance (no interceptors) to avoid an infinite refresh loop.
// If this call fails, the interceptor in axios.ts catches the error and logs the user out.
export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
    );
    return response.data.data;
}