import api from "./axios";

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
    await api.post("/logout")
}

export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post("/auth/refresh-token", { refreshToken });
    return response.data.data;
}