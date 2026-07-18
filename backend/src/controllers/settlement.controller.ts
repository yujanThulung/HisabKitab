import { Request, Response } from "express";
import Expense from "../models/Expenses";
import mongoose from "mongoose";
import { sendError, sendSuccess } from "../utils/response";
import Settlement, { ITransaction, IUserSnapshot } from "../models/SettlementSchema";


interface PopulatedUser {
    _id: mongoose.Types.ObjectId;
    name: string;
}

interface UserTotal {
    userId: mongoose.Types.ObjectId;
    name: string;
    totalAmount: number;
}

export const createSettlement = async (req: Request, res: Response) => {
    try {
        const { periodFrom, periodTo } = req.body;
        const settledBy = req.userId;
        console.log("settleBy", settledBy);

        if (!periodFrom || !periodTo) {
            return sendError({ res, statusCode: 400, message: "periodFrom and periodTo are required" })
        }

        const expenses = await Expense.find({
            date: { $gte: new Date(periodFrom), $lte: new Date(periodTo) }
        }).populate<{ userId: PopulatedUser }>("userId", "name");


        if (expenses.length === 0) {
            return sendError({ res, statusCode: 400, message: "No expenses found" })
        }
        //group by user, sum totals
        const totalMap: Record<string, UserTotal> = {};

        for (const exp of expenses) {
            const uid = exp.userId._id.toString();
            if (!totalMap[uid]) {
                totalMap[uid] = { userId: exp.userId._id, name: exp.userId.name, totalAmount: 0 };
            }
            totalMap[uid].totalAmount += exp.amount;
        }
        const userTotals: UserTotal[] = Object.values(totalMap)

        const totalAmount = userTotals.reduce((sum, u) => sum + u.totalAmount, 0);
        const perPersonShare = Math.round((totalAmount / userTotals.length) * 100) / 100;

        const userSnapshot: IUserSnapshot[] = userTotals.map(u => ({
            userId: u.userId,
            name: u.name,
            totalAmount: u.totalAmount,
            balance: Math.round((u.totalAmount - perPersonShare) * 100) / 100,
        }));


        const creditors = userSnapshot
            .filter(u => u.balance > 0)
            .map(u => ({ ...u, remaining: u.balance }))
            .sort((a, b) => b.balance - a.balance);

        const debtors = userSnapshot
            .filter(u => u.balance < 0)
            .map(u => ({ ...u, remaining: u.balance }))
            .sort((a, b) => b.remaining - a.remaining);

        const transactions: ITransaction[] = [];
        let i = 0, j = 0;

        while (i < debtors.length && j < creditors.length) {
            const pay = Math.min(debtors[i].remaining, creditors[j].remaining);

            transactions.push({
                fromId: debtors[i].userId,
                fromName: debtors[i].name,
                toId: creditors[j].userId,
                toName: creditors[j].name,
                amount: Math.round(pay * 100) / 100,
            });

            debtors[i].remaining -= pay;
            creditors[j].remaining -= pay;

            if (debtors[i].remaining <= 0.01) i++;
            if (creditors[j].remaining < 0.01) j++;
        }

        const settlement = await Settlement.create({
            settledAt: new Date(),
            settledBy,
            periodFrom,
            periodTo,
            totalAmount,
            perPersonShare,
            transactions,
            userSnapshot
        });

        sendSuccess({
            res,
            statusCode: 201,
            message: "Settlement recorded successfully",
            data: settlement
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal error";
        sendError({ res, statusCode: 500, message: message })
    }
}


export const getSettlemets = async (req: Request, res: Response) => {
    try {
        const settlements = await Settlement.find()
            .sort({ settledAt: -1 })
            .lean()
        sendSuccess({ res, statusCode: 200, message: "Settlements fetch successfully.", data: settlements})
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal error";
        sendError({ res, statusCode: 500, message: message });
    }
}