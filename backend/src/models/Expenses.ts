import mongoose, { Document, Schema } from "mongoose";

export interface IExpense extends Document {
    title: string;
    amount: number;
    image?: string | null;
    imagePublicId?: string | null;
    note?: string;
    date: Date;
    userId: mongoose.Types.ObjectId;
    isSettled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: null, },
    note: { type: String, default: "" },
    date: {
        type: Date, required: true, validate: {
            validator: function (value: Date) {
                return value <= new Date();
            }
        }
    },
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    isSettled: { type: Boolean, default: false }
}, {
    timestamps: true
})

ExpenseSchema.index({ isSettled: 1 });
const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;