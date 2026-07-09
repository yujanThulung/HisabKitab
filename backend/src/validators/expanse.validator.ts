import { z } from "zod";

export const expenseSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    amount: z.coerce.number().nonnegative("Amount must be non-negative"),
    note: z.string().optional(),
    date: z.coerce.date().refine(
        (date) => date <= new Date(),
        "Date cannot be in the future"
    ),
});

export const updateExpenseSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  amount: z.coerce.number().nonnegative("Amount must be non-negative"),
});