import { NextApiResponseWithSocket } from '@/types/next';
import { ApiError, apiHandler } from '@/utils/api'
import User from '@/utils/db/models/User';
import mongodb from '@/utils/db/mongodb';
import { verifyResourceJWT } from '@/utils/jwt';
import userColors from '@/utils/userColors';
import { SignUpValidator } from '@/utils/validation/authValidation';
import { HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next'
import { number, object, string } from 'yup';


async function GET(req: NextApiRequest, res: NextApiResponse) {
  const _id = verifyResourceJWT(req.headers.authorization);

  await mongodb();
  var user = await User.findOne({_id}, {_id: true, username: true, email: true, avatar: true, color: true, meta: true, created: true, about: true, settings: true});
  if (!user) throw new ApiError("Unknown user", HttpStatusCode.NotFound);
  res.status(200).json(user.toJSON());
}

const validator = object({
  username: SignUpValidator.user,
  color: number().min(0, 'Invalid Color').max(16777215, 'Invalid Color').test('test-color', 'Invalid Color', (e)=>{
    if (!e) return true;
    let hex = '#'+e.toString(16).padStart(6,'0');
    for (let row of userColors) if (row.includes(hex)) return true;
    return false;
  }),
  about: string().max(2048, 'Max of 2048 characters'),
})

async function POST(req: NextApiRequest, res: NextApiResponseWithSocket) {
  const _id = verifyResourceJWT(req.headers.authorization);

  const { username, color, about } = await validator.validate(req.body);

  await mongodb();
  var user = await User.findOne({_id}, {_id: true, username: true, email: true, avatar: true, color: true, meta: true, created: true, about: true, settings: true});
  if (!user) throw new ApiError("Unknown user", HttpStatusCode.NotFound);

  let needsGlobalUpdate = false;
  if (user.username != username) {
    var usernameExists = await User.exists({username});
    if (usernameExists) throw new ApiError("Username already taken", HttpStatusCode.BadRequest);
    // If over 2 username changes in the last 2 hours (regenerates at 1 change every hour)
    if (Date.now() < (user.usernameNext||new Date()).getTime() - (3600000 * 2)) throw new ApiError("You have updated your username too many times recently, please try again in an hour.", HttpStatusCode.BadRequest);
    user.usernameNext = new Date(Math.max((user.usernameNext||new Date()).getTime(), Date.now()) + 3600000);
    user.username = username;
    needsGlobalUpdate = true;
  }
  if (user.color != color) {
    user.color = color;
    needsGlobalUpdate = true;
  }
  if (user.about != about) {
    user.about = about;
  }
  await user.save();

  if (needsGlobalUpdate) {
    res.socket.server.io.emit('userUpdate', {action: 'edit', data: {id: user._id, username: user.username, avatar: user.avatar, color: user.color}}); // Note: All users will receive this update
  }

  res.status(200).json(user.toJSON());
}

export default apiHandler({GET, POST});
