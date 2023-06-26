import mongoose, { Schema } from "mongoose";
import { transformIdSchemaOptions } from "@/utils/db/dbUtil";

export type IUser = {
    _id: number,
    email: string,
    username: string,
    avatar?: number,
    color?: number,
    about?: string,
    meta: number,
    salt: Buffer,
    hash: Buffer,
    loginAttemptNext: Date,
    created: Date,
    friends: number[],
    avatarNext: Date,
    usernameNext: Date,
    emailNext: Date,
}

const userSchema = new Schema<IUser>({
    _id: Number,
    email: String,
    username: String,
    avatar: Number,
    color: Number,
    about: String,
    meta: Number,
    salt: Buffer,
    hash: Buffer,
    loginAttemptNext: { type: Date, default: Date.now },
    created: { type: Date, default: Date.now },
    friends: [{type: Number, ref: 'User' }],
    avatarNext: { type: Date, default: Date.now },
    usernameNext: { type: Date, default: Date.now },
    emailNext: { type: Date, default: Date.now },
});

// Rename _id to id
userSchema.set('toJSON', transformIdSchemaOptions);

export default mongoose.models.User as mongoose.Model<IUser> || mongoose.model<IUser>('User', userSchema);