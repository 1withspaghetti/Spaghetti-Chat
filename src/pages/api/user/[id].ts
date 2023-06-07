import { ApiError, apiHandler } from '@/utils/api'
import { HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyResourceJWT } from '@/utils/jwt';
import { string } from 'yup';
import User from '@/utils/db/models/User';
import mongodb from '@/utils/db/mongodb';
import { UserIdValidatorString } from '@/utils/validation/userValidation';

async function GET(req: NextApiRequest, res: NextApiResponse) {
  verifyResourceJWT(req.headers.authorization);
  const _id = parseInt(await UserIdValidatorString.validate(req.query.id));

  await mongodb();
  var user = await User.findOne({_id}, {_id: true, username: true, avatar: true, color: true, meta: true});
  if (!user)throw new ApiError("Unknown user", HttpStatusCode.NotFound);
  res.status(200).json(user.toJSON());
}

export default apiHandler({GET});
