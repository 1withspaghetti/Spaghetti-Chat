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

async function GET(req: NextApiRequest, res: NextApiResponse) {
    const id = verifyResourceJWT(req.headers.authorization);

    await mongodb();
    const friends = await User.aggregate([{$match: {_id: id}}, {$lookup: {from: "users", localField: "friends", foreignField: "_id", as: "friends"}}, {$project: {"friends._id": true, "friends.username": true, "friends.avatar": true, "friends.color": true}}]);
    const incoming = await FriendRequest.aggregate([{$match: {to: id}}, {$lookup: {from: "users", localField: "from", foreignField: "_id", as: "from"}}, {$project: {"from._id": true, "from.username": true, "from.avatar": true, "from.color": true}}]);
    const outgoing = await FriendRequest.aggregate([{$match: {from: id}}, {$lookup: {from: "users", localField: "to", foreignField: "_id", as: "to"}}, {$project: {"to._id": true, "to.username": true, "to.avatar": true, "to.color": true}}]);
    res.status(200).json({friends: friends[0].friends.map((d: any)=>transformId(d)) || [], incoming: incoming.map(d=>transformId(d.from[0])), outgoing: outgoing.map(d=>transformId(d.to[0]))});
}

async function POST(req: NextApiRequest, res: NextApiResponseWithSocket) {
    const id = verifyResourceJWT(req.headers.authorization);
    const to = await UserIdValidatorNumber.validate(req.body.to);
    const acceptOnly = req.query.acceptOnly == "true";

    // Check if the user is trying to send a friend request to themselves
    if (id == to) {
        // Remove the friend request from the user's outgoing friend requests
        res.socket.server.io.to(`u${id}`).emit("update", {type: "friends", outgoing: {pull: [to]}});
        throw new ApiError("You can't send a friend request to yourself", HttpStatusCode.BadRequest);
    }

    await mongodb();
    // Check if the user is already friends with the other user
    var already = await User.count({_id: id, friends: to});
    if (already > 0) {
        // Remove the friend request from the user's outgoing friend requests
        res.socket.server.io.to(`u${id}`).emit("update", {type: "friends", outgoing: {pull: [to]}});
        throw new ApiError("You are already friends with that person", HttpStatusCode.BadRequest);
    }

    const friend = await User.findOne({_id: to}, {_id: true, username: true, avatar: true, color: true});
    if (!friend) throw new ApiError("That user doesn't exist", HttpStatusCode.BadRequest);

    // Check if friend request already exists
    var existing = await FriendRequest.findOne({$or:[{to, from: id}, {to: id, from: to}]});
    if (existing && existing.to == id) {
        // If the friend request already exists, accept it
        await User.updateOne({_id: id}, {$addToSet: {friends: existing.from}});
        await User.updateOne({_id: existing.from}, {$addToSet: {friends: id}});
        await FriendRequest.deleteOne({_id: existing._id});

        // Update on sender client
        res.socket.server.io.to(`u${id}`).emit("update", {type: "friends", incoming: {pull: [to]}, outgoing: {pull: [to]}, friends: {push: [friend.toJSON()]}});
        // Update on receiver client
        const user = await User.findOne({_id: id}, {_id: true, username: true, avatar: true, color: true});
        res.socket.server.io.to(`u${to}`).emit("update", {type: "friends", incoming: {pull: [id]}, outgoing: {pull: [id]}, friends: {push: [user?.toJSON()]}});
        
        if (await Channel.count({dm: true, members: [id, to]}) == 0) await new Channel({_id: generateRandomId(), dm: true, members: [id, to]}).save();

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
    res.socket.server.io.to(`u${id}`).emit("update", {type: "friends", outgoing: {push: [friend.toJSON()]}});
    // Update on receiver client
    const user = await User.findOne({_id: id}, {_id: true, username: true, avatar: true, color: true});
    res.socket.server.io.to(`u${to}`).emit("update", {type: "friends", incoming: {push: [user?.toJSON()]}});

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
    res.socket.server.io.to(`u${id}`).emit("update", {type: "friends", outgoing: {pull: [user]}, incoming: {pull: [user]}, friends: {pull: [user]}});
    // Update on receiver client
    res.socket.server.io.to(`u${user}`).emit("update", {type: "friends", outgoing: {pull: [id]}, incoming: {pull: [id]}, friends: {pull: [id]}});

    res.status(200).json({success: true});
}

export default apiHandler({GET, POST, DELETE});