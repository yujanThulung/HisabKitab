import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response";
import Expense from "../models/Expenses";
import mongoose from "mongoose";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const createItem = async (req: Request, res: Response) => {
    try {
        const { title, amount, note, date } = req.body;

        if (!title || !amount || !date) {
            sendError({ res, statusCode: 400, message: "Title, amount and date are required" });
            return;
        }
        if (typeof title !== "string" || title.trim() === "") {
            sendError({ res, statusCode: 400, message: "Title must be a non-empty string" });
            return;
        }

        if (typeof amount !== "number") {
            sendError({ res, statusCode: 400, message: "Amount must be a number" });
            return;
        }

        if (isNaN(amount) || amount < 0) {
            sendError({ res, statusCode: 400, message: "Amount must be a non-negative number" });
            return;
        }

        const expenseDate = new Date(date);
        if (isNaN(expenseDate.getTime())) {
            sendError({ res, statusCode: 400, message: "Invalid date format" });
            return;
        }

        if (expenseDate > new Date()) {
            sendError({ res, statusCode: 400, message: "Date cannot be in the future" });
            return;
        }

        if (!req.uploadedFile) {
            sendError({ res, statusCode: 400, message: "Image is required" });
            return;
        }

        const image = req.uploadedFile.url;
        const imagePublicId = req.uploadedFile.publicId;

        const expense = await Expense.create({
            title,
            amount,
            image,
            imagePublicId,
            note,
            date: expenseDate,
            userId: req.userId,
        });
        sendSuccess({
            res, statusCode: 201, message: "Expense created successfully",
            data: expense
        })

    } catch (error) {
        console.error("Error in createItem controller:", error);
        sendError({ res, statusCode: 500, message: "Internal server error" });
    }
}


export const updateItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, amount } = req.body;



        if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            sendError({ res, statusCode: 400, message: "Invalid expense ID" });
            return;
        }

        if (!title || amount === undefined) {
            return sendError({
                res,
                statusCode: 400,
                message: "Title and amount are required",
            });
        }

        const expense = await Expense.findById(id)
        if (!expense) {
            return sendError({ res, statusCode: 404, message: "Expanse is not found" });
        }

        if (Date.now() - expense.createdAt.getTime() > TWENTY_FOUR_HOURS) {
            return sendError({
                res,
                statusCode: 403,
                message: "You can only update an expense within 24 hours of creation.",
            });
        }
        expense.title = title;
        expense.amount = amount;

        await expense.save();

        sendSuccess({
            res,
            statusCode: 201,
            message: "Expanse updated successfully.",
            data: expense
        })
    } catch (error) {
        console.error("Error while updating", error);
        sendError({ res, statusCode: 500, message: "Internal server error" })
    }
}

