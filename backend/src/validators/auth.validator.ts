import { z } from "zod";

export const registerSchema = z.object(
    {
        name: z.string().min(3, "Name must be at least 3 characters").max(20, "Name must be at most 20 characters"),
        email: z.string().email("Invalid email address"),
        phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password too long"),
    }
)

export const loginSchema = z.object(
    {
        email: z.string().email("Invalid email address").optional(),
        phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits").optional(),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password too long"),
    }
).refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
})