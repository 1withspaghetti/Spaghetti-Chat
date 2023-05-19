import { ApiError, apiHandler } from '@/utils/api'
import { User } from '@/utils/db/userDatabase';
import { verifyResourceJWT } from '@/utils/jwt';
import { HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next'


async function GET(req: NextApiRequest, res: NextApiResponse) {
  var id = verifyResourceJWT(req.headers.authorization);

  var user = await User.findOne({where: {id}, attributes: ['id', 'username', 'email', 'avatar', 'color', 'meta']});
  if (!user) throw new ApiError("Unknown user", HttpStatusCode.NotFound);
  res.status(200).json(user.toJSON());
}

export default apiHandler({GET});
