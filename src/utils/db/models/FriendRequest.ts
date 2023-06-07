import mongoose, { ObjectId, Schema } from "mongoose";

export type IFriendRequest = {
    to: number,
    from: number,
    created: Date
}

const friendRequestSchema = new Schema<IFriendRequest>({
    to: Number,
    from: Number,
    created: { type: Date, default: Date.now },
});

export default mongoose.models.friendRequest as mongoose.Model<IFriendRequest> || mongoose.model<IFriendRequest>('friendRequest', friendRequestSchema);
