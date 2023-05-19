import { ApiError, apiHandler } from "@/utils/api";
import { TokenBlacklist } from "@/utils/db/userDatabase";
import { createJWTPair, verifyRefreshJWT } from "@/utils/jwt";
import { HttpStatusCode } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

async function GET(req: NextApiRequest, res: NextApiResponse) {
    var {userId, jwtId} = verifyRefreshJWT(req.headers.authorization);

    var count = await TokenBlacklist.count({where: {id: Buffer.from(jwtId,'hex')}});
    if (count > 0) throw new ApiError("Invalid Auth Token", HttpStatusCode.Unauthorized);

    var tokenPair = await createJWTPair(userId, jwtId);

    res.status(200).json(tokenPair);
}

export default apiHandler({GET});