import { ApiError, apiHandler } from '@/utils/api'
import { User } from '@/utils/db/userDatabase';
import { HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyResourceJWT } from '@/utils/jwt';
import { string } from 'yup';

const validator = string().required('Required').matches(/^\d+$/);

async function GET(req: NextApiRequest, res: NextApiResponse) {
  verifyResourceJWT(req.headers.authorization);
  const id = parseInt(await validator.validate(req.query.id));

  var user = await User.findOne({where: {id}, attributes: ['id', 'username', 'avatar', 'color', 'meta']});
  if (!user)throw new ApiError("Unknown user", HttpStatusCode.NotFound);
  res.status(200).json(user.toJSON());
}

export default apiHandler({GET});
