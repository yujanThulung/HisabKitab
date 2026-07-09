import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { Response } from "express";
import crypto from "crypto";


export const hashToken = (token:string): string =>{
    return crypto.createHash('sha256').update(token).digest('hex')
}

export const generateTokens = (userId: Types.ObjectId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
}

export const setRefreshTokenCookie = (res: Response, token: string) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}


export const verifyToken = (token: string, secret: string) =>{
    try {
        return jwt.verify(token,secret);
    } catch (error) {
        return null
    }
}