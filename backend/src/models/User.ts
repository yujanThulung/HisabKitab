import mongoose,{Document, Schema} from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    password: string;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    phone: {type: String, unique: true},
    password: {type: String, required: true},
    refreshToken: {type: String}
}, {
    timestamps: true
})

UserSchema.index({ email: 1, phone: 1 }, { unique: true });

const User = mongoose.model<IUser>("User", UserSchema);

export default User;