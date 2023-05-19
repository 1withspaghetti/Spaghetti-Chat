import { SignUpValidator } from "@/types/authValidation";
import { ApiError, apiHandler } from "@/utils/api";
import { User } from "@/utils/db/userDatabase";
import { NextApiRequest, NextApiResponse } from "next";
import { object } from "yup";
import crypto from 'crypto';
import { HttpStatusCode } from "axios";
import { AuthTokenPair, createJWTPair } from "@/utils/jwt";

async function POST(req: NextApiRequest, res: NextApiResponse<AuthTokenPair>) {
    const body = await object(SignUpValidator).validate(req.body);
    
    var userByUsername = await User.findOne({
        attributes: ["username"],
        where: {
            username: body.user
        }
    });

    if (userByUsername) throw new ApiError("Username is already in use", HttpStatusCode.BadRequest);

    var userByEmail = await User.findOne({
        attributes: ["email"],
        where: {
            email: body.email
        }
    });

    if (userByEmail) throw new ApiError("Email is already in use", HttpStatusCode.BadRequest);

    var id = crypto.randomInt(281474976710655);

    var salt = crypto.randomBytes(8);
    var hash = crypto.createHash("sha512").update(body.pass).update(salt).digest();

    await User.build({
        id,
        email: body.email,
        username: body.user,
        salt,
        hash,
        loginAttemptNext: 0
    }).save();

    var jwtId = crypto.randomBytes(8).toString("hex");
    var tokenPair = await createJWTPair(id, jwtId);

    res.status(200).json(tokenPair);
}

export default apiHandler({POST});