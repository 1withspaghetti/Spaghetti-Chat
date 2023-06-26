import { NextApiResponseWithSocket } from "@/types/next";
import { ApiError, apiHandler } from "@/utils/api";
import { generateRandomId, transformId } from "@/utils/db/dbUtil";
import Channel from "@/utils/db/models/Channel";
import FriendRequest from "@/utils/db/models/FriendRequest";
import User from "@/utils/db/models/User";
import mongodb from "@/utils/db/mongodb";
import { verifyResourceJWT } from "@/utils/jwt";
import { UserIdValidatorNumber, UserIdValidatorString } from "@/utils/validation/userValidation";
import { HttpStatusCode } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getChannels } from "./channels";

async function GET(req: NextApiRequest, res: NextApiResponse) {
    const id = verifyResourceJWT(req.headers.authorization);

    await mongodb();
    const friends = await User.findOne({_id: id}, {friends: true}).populate("friends", {_id: true, username: true, avatar: true, color: true});
    const incoming = await FriendRequest.find({to: id}, {from: true}).populate("from", {_id: true, username: true, avatar: true, color: true});
    const outgoing = await FriendRequest.find({from: id}, {to: true}).populate("to", {_id: true, username: true, avatar: true, color: true});
    if (!friends) throw new ApiError("User not found", HttpStatusCode.NotFound);

    res.status(200).json({friends: friends.toJSON().friends || [], incoming: incoming.map(d=>d.toJSON().from), outgoing: outgoing.map(d=>d.toJSON().from)});
}

async function POST(req: NextApiRequest, res: NextApiResponseWithSocket) {
    const id = verifyResourceJWT(req.headers.authorization);
    const to = await UserIdValidatorNumber.validate(req.body.to);
    const acceptOnly = req.query.acceptOnly == "true";

    // Check if the user is trying to send a friend request to themselves
    if (id == to) throw new ApiError("You can't send a friend request to yourself", HttpStatusCode.BadRequest);

    await mongodb();
    // Check if the user is already friends with the other user
    var already = await User.count({_id: id, friends: to});
    if (already > 0) throw new ApiError("You are already friends with that person", HttpStatusCode.BadRequest);

    const friend = await User.findOne({_id: to}, {_id: true, username: true, avatar: true, color: true});
    if (!friend) throw new ApiError("That user doesn't exist", HttpStatusCode.BadRequest);

    // Check if friend request already exists
    var existing = await FriendRequest.findOne({$or:[{to, from: id}, {to: id, from: to}]});
    if (existing && existing.to == id) {
        // If the friend request already exists, accept it
        await Promise.all([
            User.updateOne({_id: id}, {$addToSet: {friends: existing.from}}),
            User.updateOne({_id: existing.from}, {$addToSet: {friends: id}}),
            FriendRequest.deleteOne({_id: existing._id})
        ]);

        // Update on sender client
        res.socket.server.io.to(`u${id}`).emit("friendUpdate", {incoming: {action: 'delete', data: {id: to}}, outgoing: {action: 'delete', data: {id: to}}, friends: {action: 'add', data: [friend.toJSON()]}});
        // Update on receiver client
        const user = await User.findOne({_id: id}, {_id: true, username: true, avatar: true, color: true});
        res.socket.server.io.to(`u${to}`).emit("friendUpdate", {incoming: {action: 'delete', data: {id: id}}, outgoing: {action: 'delete', data: {id: id}}, friends: {action: 'add', data: [user?.toJSON()]}});
        
        // Create a DM channel if it doesn't exist
        if (await Channel.count({dm: true, $or:[{members: [id, to]}, {members: [to, id]}]}) == 0) {
            var dm = new Channel({_id: generateRandomId(), dm: true, members: [id, to]});
            await dm.save();
            await Promise.all([
                getChannels({_id: dm._id}, id).then(d=>res.socket.server.io.to(`u${id}`).emit("channelUpdate", {action: "add", data: d[0].toJSON()})),
                getChannels({_id: dm._id}, to).then(d=>res.socket.server.io.to(`u${to}`).emit("channelUpdate", {action: "add", data: d[0].toJSON()}))
            ]);
        }

        res.status(200).json({success: true});
        return;
    } else if (existing) throw new ApiError("There is already a friend request to that person", HttpStatusCode.BadRequest);
    else if (acceptOnly) throw new ApiError("There is no friend request from that person", HttpStatusCode.BadRequest);

    // Check if the user has too many friends or friend requests
    var friendsSize = await User.aggregate([{$match: {_id: id}}, {$project: {friends: {$size: "$friends"}}}]);
    if (friendsSize[0].friends >= 100) throw new ApiError("You can't have more than 100 friends :(", HttpStatusCode.BadRequest);

    var requestCount = await FriendRequest.count({from: id});
    if (requestCount >= 25) throw new ApiError("You can't send more than 25 active friend requests at a time, please cancel some of them to continue", HttpStatusCode.BadRequest);

    await new FriendRequest({to, from: id}).save();
    // Update on sender client
    res.socket.server.io.to(`u${id}`).emit("friendUpdate", {outgoing: {action: 'add', data: [friend.toJSON()]}});
    // Update on receiver client
    const user = await User.findOne({_id: id}, {_id: true, username: true, avatar: true, color: true});
    res.socket.server.io.to(`u${to}`).emit("friendUpdate", {incoming: {action: 'add', data: [user?.toJSON()]}});

    res.status(200).json({success: true});
}

async function DELETE(req: NextApiRequest, res: NextApiResponseWithSocket) {
    const id = verifyResourceJWT(req.headers.authorization);
    const user = parseInt(await UserIdValidatorString.validate(req.query.user));

    await mongodb();
    // Delete all friend requests between the two users
    await FriendRequest.deleteMany({$or:[{to: user, from: id}, {to: id, from: user}]});
    // Remove the users from each other's friends list
    await User.updateOne({_id: id}, {$pull: {friends: user}});
    await User.updateOne({_id: user}, {$pull: {friends: id}});
    // Update on sender client
    res.socket.server.io.to(`u${id}`).emit("friendUpdate", {outgoing: {action: 'delete', data: {id: user}}, incoming: {action: 'delete', data: {id: user}}, friends: {action: 'delete', data: {id: user}}});
    // Update on receiver client
    res.socket.server.io.to(`u${user}`).emit("friendUpdate", {outgoing: {action: 'delete', data: {id}}, incoming: {action: 'delete', data: {id}}, friends: {action: 'delete', data: {id}}});

    res.status(200).json({success: true});
}

export default apiHandler({GET, POST, DELETE});