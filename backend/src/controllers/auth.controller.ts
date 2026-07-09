import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { sendError, sendSuccess } from "../utils/response";
import { generateTokens, hashToken, setRefreshTokenCookie, verifyToken } from "../utils/token";

import User from "../models/User";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password } = req.body;

        const existing = await User.findOne({ $or: [{ email }, { phone }] });

        if (existing) {
            sendError({ res, statusCode: 400, message: "User already exists with this email or phone number" });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({ name, email, phone, password: passwordHash });

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = hashToken(refreshToken);
        await user.save();

        setRefreshTokenCookie(res, refreshToken);

        sendSuccess({
            res,
            statusCode: 201,
            message: "User registered successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                },
                accessToken
            }
        })
    } catch (error) {
        console.error("Error in register controller:", error);
        sendError({ res, statusCode: 500, message: "Internal server error" });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, phone, password } = req.body;

        const user = await User.findOne({ $or: [{ email }, { phone }] })
        if (!user) {
            await bcrypt.compare(password, "$2a$12$invalidsaltinvalidsaltinv") // Dummy compare to mitigate timing attacks
            sendError({ res, statusCode: 401, message: "Invalid credentials" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            sendError({ res, statusCode: 401, message: "Invalid credentials" });
            return
        }

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = hashToken(refreshToken);
        await user.save();

        setRefreshTokenCookie(res, refreshToken);

        sendSuccess({
            res,
            statusCode: 200,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                },
                accessToken
            }
        });
    } catch (error) {
        console.error("Error in login controller:", error);
        sendError({ res, statusCode: 500, message: "Internal server error" });
    }
}


export const refresh = async (req: Request, res: Response) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        if (!oldRefreshToken) {
            sendError({ res, statusCode: 401, message: "Refresh token missing" });
            return;
        }

        const decoded = verifyToken(
            oldRefreshToken,
            process.env.JWT_REFRESH_SECRET as string
        ) as { userId: string } | null;

        if (!decoded) {
            sendError({ res, statusCode: 401, message: "Invalid refresh token" });
            return;
        }

        const hashedToken = hashToken(oldRefreshToken);

        const user = await User.findOne({ _id: decoded.userId, refreshToken: hashedToken });
        if (!user) {
            sendError({ res, statusCode: 401, message: "Invalid refresh token" });
            return
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        user.refreshToken = hashToken(refreshToken);
        await user.save();

        setRefreshTokenCookie(res, refreshToken);

        sendSuccess({
            res,
            statusCode: 200,
            message: "Token refreshed successfully",
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            }
        })
    } catch (error) {
        console.error("Error in refresh controller:", error);
        sendError({ res, statusCode: 500, message: "Internal server error" });
    }
}


export const logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const hashedToken = hashToken(refreshToken);
            await User.updateOne({ refreshToken: hashToken(refreshToken) },
                { $set: { refreshToken: "" } });
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })
    } catch (error) {
        console.error("Error in logout controller:", error);
        sendError({ res, statusCode: 500, message: "Internal server error" });
    }
}



export const me = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.userId).select('-passwordHash -refreshToken');

        if (!user) {
            sendError({ res, statusCode: 404, message: "User not found" });
            return;
        }

        sendSuccess({
            res,
            statusCode: 200,
            message: "User data fetched successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            }
        });
    } catch (error) {
        console.error("Get me error:", error);
        sendError({ res, statusCode: 500, message: 'Internal server error' })
    }

}