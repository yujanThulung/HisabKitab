import mongoose, { Document, Schema } from "mongoose";

export interface IExpense {
    id: string;
    title: string;
    amount: number;
    image: string;
    note: string;
    date: Date;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    image: { type: String },
    note: { type: String },
    date: { type: Date, required: true },
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, {
    timestamps: true
})

ExpenseSchema.index({ title: 1, date: 1 }, { unique: true });

const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;