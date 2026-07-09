import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors,
            })
            return;
        }
        req.body = result.data;
        next();
    }
}

export const validateShema = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                message: "Invalid query parameters",
                errors: result.error.flatten().fieldErrors,
            })
            return;
        }
        req.query = result.data as any;
        next();
    }
}