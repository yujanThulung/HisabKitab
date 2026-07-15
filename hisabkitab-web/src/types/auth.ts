export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

export interface LoginPayload {
    identifier: string; // email or phone
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}