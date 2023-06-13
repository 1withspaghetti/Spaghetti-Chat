import { ApiError, apiHandler } from '@/utils/api'
import User from '@/utils/db/models/User';
import mongodb from '@/utils/db/mongodb';
import { verifyResourceJWT } from '@/utils/jwt';
import { HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next'


async function GET(req: NextApiRequest, res: NextApiResponse) {
  var _id = verifyResourceJWT(req.headers.authorization);

  await mongodb();
  var user = await User.findOne({_id}, {_id: true, username: true, email: true, avatar: true, color: true, meta: true, created: true, about: true, settings: true});
  if (!user) throw new ApiError("Unknown user", HttpStatusCode.NotFound);
  res.status(200).json(user.toJSON());
}

export default apiHandler({GET});
