import mongoose, { Schema } from "mongoose";
import { transformIdSchemaOptions } from "@/utils/db/dbUtil";

export type IChannel = {
    _id: number,
    name?: string,
    dm: boolean,
    avatar?: number,
    owner?: number,
    members: number[],
    lastMessage?: Date,
    created: Date,
}

const channelSchema = new Schema<IChannel>({
    _id: Number,
    dm: Boolean,
    name: String,
    avatar: Number,
    owner: Number,
    members: [Number],
    lastMessage: { type: Date, default: Date.now },
    created: { type: Date, default: Date.now },
});

// Rename _id to id
channelSchema.set('toJSON', transformIdSchemaOptions);

export default mongoose.models.Channel as mongoose.Model<IChannel> || mongoose.model<IChannel>('Channel', channelSchema);