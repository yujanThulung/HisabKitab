import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Access token required"
            })
            return
        }

        const token = authHeader?.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET as string
        ) as { userId: string };

        //Attach userId to request
        req.userId = decoded.userId;

        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                message: "Access token expired"
            });
            return;
        }
        res.status(401).json({
            message: "Invalid access token"
        })
    }
};