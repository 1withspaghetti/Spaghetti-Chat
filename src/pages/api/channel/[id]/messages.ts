import { NextApiResponseWithSocket } from "@/types/next";
import { ApiError, apiHandler } from "@/utils/api";
import { generateRandomId } from "@/utils/db/dbUtil";
import Channel from "@/utils/db/models/Channel";
import Message from "@/utils/db/models/Message";
import mongodb from "@/utils/db/mongodb";
import { verifyResourceJWT } from "@/utils/jwt";
import { UserIdValidatorNumber } from "@/utils/validation/userValidation";
import { NextApiRequest, NextApiResponse } from "next";
import { number, string } from "yup";

async function GET(req: NextApiRequest, res: NextApiResponse) {
    const _id = verifyResourceJWT(req.headers.authorization);

    const channelId = await UserIdValidatorNumber.validate(req.query.id);
    const before = await number().optional().validate(req.query.before);
    const count = await number().optional().max(100, "Max 100 messages at a time").min(1, "Min 1 message").validate(req.query.count);
    
    await mongodb();
    const channelExists = await Channel.exists({_id: channelId, members: _id});
    if (!channelExists) throw new ApiError("Unknown channel", 404);

    const messages = await Message.find({channel: channelId, _id: before ? {$lt: before} : {$exists: true}})
        .sort({_id: -1}).limit(count || 25).populate("author", {_id: true, username: true, avatar: true, color: true});

    res.status(200).json({success: true, messages: messages.map(m => m.toJSON())});
}

const contentValidator = string().required().min(1, "Min 1 character").max(2000, "Max 2000 characters");

async function POST(req: NextApiRequest, res: NextApiResponseWithSocket) {
    const _id = verifyResourceJWT(req.headers.authorization);

    const channelId = await UserIdValidatorNumber.validate(req.query.id);
    const content = await contentValidator.validate(req.body.content);
    
    await mongodb();
    const channel = await Channel.findOne({_id: channelId, members: _id}, {_id: true, members: true});
    if (!channel) throw new ApiError("Unknown channel", 404);

    const id = generateRandomId('message');

    const message = new Message({
        _id: id,
        channel: channelId,
        author: _id,
        content,
        created: new Date(),
    });
    await (await message.save()).populate('author', {_id: true, username: true, avatar: true, color: true});

    channel.members.forEach(member => {
        if (member != _id) res.socket.server.io.to(`u${member}`).emit("message", {action: 'add', data: message.toJSON()});
    });

    res.status(200).json({success: true, message: message.toJSON()});
}   

export default apiHandler({GET, POST});