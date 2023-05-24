import { LoginValidator } from "@/utils/validation/authValidation";
import { ApiError, apiHandler } from "@/utils/api";
import type { NextApiRequest, NextApiResponse } from "next";
import { object } from "yup";
import crypto from 'crypto';
import { HttpStatusCode } from "axios";
import { AuthTokenPair, createJWTPair } from "@/utils/jwt";
import User from "@/utils/db/models/User";
import mongodb from "@/utils/db/mongodb";

async function POST(req: NextApiRequest, res: NextApiResponse<AuthTokenPair>) {
    const body = await object(LoginValidator).validate(req.body);

    await mongodb();
    var user = await User.findOne({
        $or: [{username: body.user}, {email: body.user}]
    }, {_id: true, username: true, salt: true, hash: true, loginAttemptNext: true});

    if (!user) throw new ApiError("Invalid Username or Email", HttpStatusCode.BadRequest);
    console.log(user);

    // If over 8 failed password attempts in the last 40 minutes (regenerates at 1 attempt every 5 minutes)
    if (Date.now() < user.loginAttemptNext.getTime() - (300000 * 8)) throw new ApiError("Maximum password attempts succeeded", HttpStatusCode.TooManyRequests)

    var testHash = crypto.createHash("sha512").update(body.pass).update(user.salt).digest();
    if (!crypto.timingSafeEqual(user.hash, testHash)) {
        user.loginAttemptNext.setTime(Math.max(user.loginAttemptNext.getTime(), Date.now()) + 300000);
        await user.save();
        throw new ApiError("Invalid Password", HttpStatusCode.BadRequest);
    }

    var jwtId = crypto.randomBytes(8).toString("hex");
    var tokenPair = await createJWTPair(user._id, jwtId);
    
    res.status(200).json(tokenPair);
}

export default apiHandler({POST})