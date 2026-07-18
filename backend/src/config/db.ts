import mongoose from "mongoose";
import Expense from "../models/Expenses";

const connectDB = async(): Promise<void> =>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string)
        console.log(`MongoDB connected: ${conn.connection.host}`)
        await Expense.syncIndexes();
    } catch (error) {
        console.error("MongoDB connection error:",error)
        process.exit(1)
    }
}

export default connectDB;