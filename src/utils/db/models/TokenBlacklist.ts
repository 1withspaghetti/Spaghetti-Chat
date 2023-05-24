import mongoose, { Schema } from "mongoose";

export type jwtId = {
    _id: Buffer
}

const jwtIdSchema = new Schema<jwtId>({
    _id: Buffer
});

const blacklist = mongoose.model<jwtId>('TokenBlacklist', jwtIdSchema, 'TokenBlacklist');

export default blacklist;