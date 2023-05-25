import mongoose, { Schema, mongo } from "mongoose";

export type IUser = {
    _id: number,
    email: string,
    username: string,
    avatar?: number,
    color?: number,
    meta: number,
    salt: Buffer,
    hash: Buffer,
    loginAttemptNext: Date,
    created: Date
}

const userSchema = new Schema<IUser>({
    _id: Number,
    email: String,
    username: String,
    avatar: String,
    color: Number,
    meta: Number,
    salt: Buffer,
    hash: Buffer,
    loginAttemptNext: { type: Date, default: Date.now },
    created: { type: Date, default: Date.now },
});

// Rename _id to id
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

export default mongoose.models.User as mongoose.Model<IUser> || mongoose.model<IUser>('User', userSchema);