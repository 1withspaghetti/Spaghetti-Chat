import { ApiError, apiHandler } from "@/utils/api";
import TokenBlacklist from "@/utils/db/models/TokenBlacklist";
import mongodb from "@/utils/db/mongodb";
import { RESOURCE_JWT_EXPIRE_TIME, verifyRefreshJWT } from "@/utils/jwt";
import { HttpStatusCode } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

async function GET(req: NextApiRequest, res: NextApiResponse) {
    var {userId, jwtId, expires} = verifyRefreshJWT(req.headers.authorization);

    await mongodb();
    var id = await TokenBlacklist.findOne({_id: Buffer.from(jwtId,'hex')});
    if (id && id._id) throw new ApiError("Invalid Auth Token", HttpStatusCode.Unauthorized);
    
    await new TokenBlacklist({id: Buffer.from(jwtId, "hex"), expires: Date.now()+RESOURCE_JWT_EXPIRE_TIME+10000})
        .save();

    res.status(200).json({success: true});
}

export default apiHandler({GET});