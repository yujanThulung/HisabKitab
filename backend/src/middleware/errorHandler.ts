import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { sendError } from "../utils/response";
import multer from "multer";

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error("Unhandled error: ", err);
    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.fromEntries(
            Object.entries(err.errors).map(([key, value]: any) => [key, value.message])
        )
        sendError({ res, message: "Validation Error", statusCode: 400, errors })
        return
    }

    //cast error
    if (err instanceof mongoose.Error.CastError) {
        sendError({ res, message: `Invalid ${err.path}: ${err.value}`, statusCode: 400 });
        return;
    }

    //duplicate key error
    if (err.code === 11000) {
        const value = Object.values(err.keyValue).join(", ");
        sendError({ res, message: `Duplicate key error: ${value} already exists`, statusCode: 409 });
        return;
    }


    //multer file upload error

    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE" ? "File size exceeds the limit" : `Upload Error: ${err.message}`;
        sendError({ res, message, statusCode: 400 })
        return;
    }

    //Known operational error
    if (err.status && typeof err.status === "number") {
        sendError({ res, message: err.message || "An error occurred", statusCode: err.status })
        return;
    }

    //unknown error
    sendError({ res, message: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message || "Internal Server Error", statusCode: 500 });
}