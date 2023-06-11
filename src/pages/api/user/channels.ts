import { apiHandler } from "@/utils/api";
import { transformId } from "@/utils/db/dbUtil";
import Channel from "@/utils/db/models/Channel";
import mongodb from "@/utils/db/mongodb";
import { verifyResourceJWT } from "@/utils/jwt";
import { NextApiRequest, NextApiResponse } from "next";

async function GET(req: NextApiRequest, res: NextApiResponse) {
    const id = verifyResourceJWT(req.headers.authorization);

    await mongodb();
    const channels = await Channel.aggregate([
        {$match: {members: id}},  // Match channels where the user is a member
        {$lookup: {from: "users", localField: "members", foreignField: "_id", as: "members"}}, // Join the users collection with the member's ids
        {$set: {members: {$filter: {input: "$members", as: "member", cond: {$ne: ["$$member._id", id]}}}}}, // Remove the requesting user from the members array
        {$set: {members: {$map: {input: "$members", as: "member", in: {$mergeObjects: ["$$member", {id: "$$member._id"}]}}}}}, // Rename _id to id
        {$project: {_id: true, dm: true, name: true, owner: true, avatar: true, lastMessage: true, "members.id": true, "members.username": true, "members.avatar": true, "members.color": true}},
        {$sort: {lastMessage: -1}} // Sort by last message
    ]);

    res.status(200).json({success: true, channels: channels.map(channel => transformId(channel))});
}

export default apiHandler({GET});