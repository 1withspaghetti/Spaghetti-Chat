import { apiHandler } from "@/utils/api";
import Channel from "@/utils/db/models/Channel";
import mongodb from "@/utils/db/mongodb";
import { verifyResourceJWT } from "@/utils/jwt";
import { NextApiRequest, NextApiResponse } from "next";

export async function getChannels(match: any, userId: number) {
    return Channel.find(
        {members: userId}, 
        {_id: true, dm: true, name: true, owner: true, avatar: true, lastMessage: true, members: {$elemMatch: {$ne: userId}}, [`lastRead.${userId}`]: true, created: true},
        {sort: {lastMessage: -1}}
    ).populate("members", {_id: true, username: true, avatar: true, color: true})
}

async function GET(req: NextApiRequest, res: NextApiResponse) {
    const id = verifyResourceJWT(req.headers.authorization);

    await mongodb();
    const channels = await getChannels({members: id}, id)

    res.status(200).json({success: true, channels: channels.map(channel => channel.toJSON())});
}

export default apiHandler({GET});