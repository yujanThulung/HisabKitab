import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or phone is required")
    .refine(
      (value) => {
        // Email
        const isEmail = z.email().safeParse(value).success;

        // Nepal phone number (adjust if needed)
        const isPhone = /^9[6-9]\d{8}$/.test(value);

        return isEmail || isPhone;
      },
      {
        message: "Enter a valid email or phone number",
      }
    ),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;