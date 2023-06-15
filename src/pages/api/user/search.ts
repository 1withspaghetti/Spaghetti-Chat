import { apiHandler } from "@/utils/api";
import User from "@/utils/db/models/User";
import mongodb from "@/utils/db/mongodb";
import { verifyResourceJWT } from "@/utils/jwt";
import { UsernameSearchValidator } from "@/utils/validation/userValidation";
import { NextApiRequest, NextApiResponse } from "next";

async function GET(req: NextApiRequest, res: NextApiResponse) {
    var id = verifyResourceJWT(req.headers.authorization);

    const query = await UsernameSearchValidator.validate(req.query.q);
    if (!query || query.length < 1) return res.status(200).json([]);

    await mongodb();
    var user = await User.find({username: {$regex: query, $options: 'i'}, _id: {$ne: id}}, {_id: true, username: true, avatar: true, color: true}, {limit: 10});
    res.status(200).json({results: user.map(u => u.toJSON())});
}

export default apiHandler({GET});