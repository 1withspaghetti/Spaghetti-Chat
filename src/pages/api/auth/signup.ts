import { SignUpValidator } from "@/utils/validation/authValidation";
import { ApiError, apiHandler } from "@/utils/api";
import { NextApiRequest, NextApiResponse } from "next";
import { object } from "yup";
import crypto from 'crypto';
import { HttpStatusCode } from "axios";
import { AuthTokenPair, createJWTPair } from "@/utils/jwt";
import User from "@/utils/db/models/User";
import mongodb from "@/utils/db/mongodb";

async function POST(req: NextApiRequest, res: NextApiResponse<AuthTokenPair>) {
    const body = await object(SignUpValidator).validate(req.body);
    
    await mongodb();
    var userByUsername = await User.findOne({
        username: body.user,
    }, {username: true});

    if (userByUsername) throw new ApiError("Username is already in use", HttpStatusCode.BadRequest);

    var userByEmail = await User.findOne({
        email: body.email
    }, {email: true});

    if (userByEmail) throw new ApiError("Email is already in use", HttpStatusCode.BadRequest);

    var _id = crypto.randomInt(281474976710655);

    var salt = crypto.randomBytes(8);
    var hash = crypto.createHash("sha512").update(body.pass).update(salt).digest();

    await new User({
        _id,
        email: body.email,
        username: body.user,
        meta: 0,
        salt,
        hash,
        loginAttemptNext: 0,
    }).save();

    var jwtId = crypto.randomBytes(8).toString("hex");
    var tokenPair = await createJWTPair(_id, jwtId);

    res.status(200).json(tokenPair);
}

export default apiHandler({POST});