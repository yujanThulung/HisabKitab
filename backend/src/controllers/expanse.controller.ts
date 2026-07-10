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

        const expense = await Expense.findById(id);
        if (!expense) {
            sendError({ res, statusCode: 404, message: "Expense not found" });
            return;
        }

        // Authorization: Check if the expense belongs to the authenticated user
        if (expense.userId.toString() !== req.userId) {
            sendError({ res, statusCode: 403, message: "You are not authorized to update this expense" });
            return;
        }

        if (Date.now() - expense.createdAt.getTime() > TWENTY_FOUR_HOURS) {
            sendError({
                res,
                statusCode: 403,
                message: "You can only update an expense within 24 hours of creation.",
            });
            return;
        }
        expense.title = title;
        expense.amount = amount;

        await expense.save();

        sendSuccess({
            res,
            statusCode: 200,
            message: "Expense updated successfully.",
            data: expense
        })
    } catch (error) {
        console.error("Error while updating", error);
        sendError({ res, statusCode: 500, message: "Internal server error" })
    }
}


export const getItems = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            sendError({ res, statusCode: 401, message: "Unauthorized" });
            return;
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Convert userId string to ObjectId for proper comparison
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Build filter - start with just userId
        const filter: any = {
            userId: userObjectId,
        };

        // Only add date filter if from or to is provided
        if (req.query.from || req.query.to) {
            const dateFilter: any = {};

            if (req.query.from) {
                const from = new Date(req.query.from as string);
                from.setHours(0, 0, 0, 0);
                dateFilter.$gte = from;
            }

            if (req.query.to) {
                const to = new Date(req.query.to as string);
                to.setHours(23, 59, 59, 999);
                dateFilter.$lte = to;
            }

            filter.date = dateFilter;
        }

        console.log("Filter:", JSON.stringify(filter, null, 2)); // Debug log

        const [items, totalItems, userTotals] = await Promise.all([
            Expense.find(filter)
                .populate("userId", "name phone")
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            Expense.countDocuments(filter),
            Expense.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: "$userId",
                        totalAmount: {
                            $sum: "$amount",
                        }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    },
                },
                { $unwind: "$user" },
                {
                    $project: {
                        _id: 0,
                        userId: "$_id",
                        name: "$user.name",
                        phone: "$user.phone",
                        totalAmount: 1,
                    }
                },
                {
                    $sort: {
                        totalAmount: -1,
                    }
                }
            ])
        ]);

        const grandTotal = userTotals.reduce((sum: number, user: any) => sum + user.totalAmount, 0);

        console.log(`Found ${items.length} items out of ${totalItems} total`); // Debug log

        sendSuccess({
            res,
            statusCode: 200,
            message: "Expenses fetched successfully",
            data: {
                items,
                summary: {
                    grandTotal,
                    userTotals,
                },
                pagination: {
                    page,
                    limit,
                    total: totalItems,
                    hasMore: skip + items.length < totalItems,
                },

                // filters: {
                //     from: req.query.from || null,
                //     to: req.query.to || null,
                // }
            },
        });
    } catch (error) {
        console.error("Error while fetching data", error);
        sendError({ res, statusCode: 500, message: "Internal server error" });
    }
}

export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            sendError({ res, statusCode: 400, message: "Invalid expense ID" });
            return;
        }

        const expense = await Expense.findById(id);
        if (!expense) {
            sendError({ res, statusCode: 404, message: "Expense not found" });
            return;
        }

        // Authorization: Check if the expense belongs to the authenticated user
        if (expense.userId.toString() !== req.userId) {
            sendError({ res, statusCode: 403, message: "You are not authorized to delete this expense" });
            return;
        }

        await expense.deleteOne();

        sendSuccess({
            res,
            statusCode: 200,
            message: "Expense deleted successfully",
            data: { id: expense._id }
        });
    } catch (error) {
        console.error("Error while deleting expense", error);
        sendError({ res, statusCode: 500, message: "Internal server error" });
    }
}