import mongoose, { Schema } from "mongoose";
import { transformIdSchemaOptions } from "@/utils/db/dbUtil";

export type IMessage = {
    _id: number,
    channel: number,
    author: number,
    content: string,
    attachments?: number[],
    created: Date,
}

const userSchema = new Schema<IMessage>({
    _id: Number,
    channel: { type: Number, ref: 'Channel' },
    author: { type: Number, ref: 'User' },
    content: String,
    attachments: [{type: Number, ref: 'Attachment'}],
    created: { type: Date, default: Date.now },
});

// Rename _id to id
userSchema.set('toJSON', transformIdSchemaOptions);
userSchema.index({channel: 1});

export default mongoose.models.Message as mongoose.Model<IMessage> || mongoose.model<IMessage>('Message', userSchema);