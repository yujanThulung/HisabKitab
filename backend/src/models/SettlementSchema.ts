import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction {
    fromId: mongoose.Types.ObjectId;
    fromName: string;
    toId: mongoose.Types.ObjectId;
    toName: string;
    amount: number;
}

export interface IUserSnapshot {
    userId: mongoose.Types.ObjectId;
    name: string;
    totalAmount: number;
    balance: number;
}

export interface ISettlement extends Document {
    settledAt: Date;
    settledBy: mongoose.Types.ObjectId;
    periodFrom: Date;
    periodTo: Date;
    totalAmount: number;
    perPersonShare: number;
    transactions: ITransaction[];
    userSnapshot: IUserSnapshot[];
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
    fromId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fromName: { type: String, required: true },
    toId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toName: { type: String, required: true },
    amount: { type: Number, required: true },
}, { _id: false });

const UserSnapshotSchema = new Schema<IUserSnapshot>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    balance: { type: Number, required: true },
}, { _id: false });

const SettlementSchema = new Schema<ISettlement>({
    settledAt: { type: Date, required: true },
    settledBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    periodFrom: { type: Date, required: true },
    periodTo: { type: Date, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    perPersonShare: { type: Number, required: true },
    transactions: { type: [TransactionSchema], default: [] },
    userSnapshot: { type: [UserSnapshotSchema], default: [] },
}, {
    timestamps: true
});

SettlementSchema.index({ settledAt: -1 });

const Settlement = mongoose.model<ISettlement>("Settlement", SettlementSchema);

export default Settlement;