import api from "./axios";
import axios from "axios";

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
    const response = await api.post("/register", payload);
    return response.data;
}

export const logout = async () => {
    await api.post("/auth/logout")
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