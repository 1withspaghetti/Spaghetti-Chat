import { ApiError, apiHandler } from "@/utils/api";
import TokenBlacklist from "@/utils/db/models/TokenBlacklist";
import mongodb from "@/utils/db/mongodb";
import { createJWTPair, verifyRefreshJWT } from "@/utils/jwt";
import { HttpStatusCode } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

async function GET(req: NextApiRequest, res: NextApiResponse) {
    var {userId, jwtId} = verifyRefreshJWT(req.headers.authorization);

    await mongodb();
    var id = await TokenBlacklist.findOne({_id: Buffer.from(jwtId,'hex')});
    if (id && id._id) throw new ApiError("Invalid Auth Token", HttpStatusCode.Unauthorized);

    var tokenPair = await createJWTPair(userId, jwtId);

    res.status(200).json(tokenPair);
}

export default apiHandler({GET});