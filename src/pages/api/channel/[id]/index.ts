import { ApiError, apiHandler } from "@/utils/api";
import Channel from "@/utils/db/models/Channel";
import mongodb from "@/utils/db/mongodb";
import { verifyResourceJWT } from "@/utils/jwt";
import { UserIdValidatorString } from "@/utils/validation/userValidation";
import { NextApiRequest, NextApiResponse } from "next";

async function GET(req: NextApiRequest, res: NextApiResponse) {
    const _id = verifyResourceJWT(req.headers.authorization);
    
    const channelId = await UserIdValidatorString.validate(req.query.id);

    await mongodb();
    const channel = await Channel.findOne({_id: channelId, members: _id}, {_id: true, dm: true, name: true, owner: true, avatar: true, lastMessage: true, members: {$elemMatch: {$ne: _id}}, [`lastRead.${_id}`]: true, created: true}).populate("members", {_id: true, username: true, avatar: true, color: true});
    if (!channel) throw new ApiError("Unknown channel", 404);

    res.status(200).json({success: true, channel: channel.toJSON()});
}

export default apiHandler({GET});