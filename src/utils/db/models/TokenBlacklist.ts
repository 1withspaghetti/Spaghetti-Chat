import mongoose, { Schema } from "mongoose";

export type jwtId = {
    _id: Buffer
}

const jwtIdSchema = new Schema<jwtId>({
    _id: Buffer
});

// Rename _id to id
jwtIdSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

export default mongoose.models.TokenBlacklist as mongoose.Model<jwtId> || mongoose.model<jwtId>('TokenBlacklist', jwtIdSchema, 'tokenBlacklist');