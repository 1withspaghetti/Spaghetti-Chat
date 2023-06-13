import { apiHandler } from "@/utils/api";
import { UserIdValidatorString } from "@/utils/validation/userValidation";
import { NextApiRequest, NextApiResponse } from "next";
import { AVATAR_UPLOAD_DIR } from "../user/avatar";
import path from "path";
import fs from "fs";
import sharp from "sharp";


async function GET(req: NextApiRequest, res: NextApiResponse) {

    var id = parseInt(await UserIdValidatorString.validate((req.query.id as string).replace(/\.webp$/, '')));

    var file = path.resolve(AVATAR_UPLOAD_DIR, `${id}.webp`);
    
    if (!fs.existsSync(file)) file = path.resolve('.', `public/images/default-avatar.webp`);
    if (!fs.existsSync(file)) throw new Error("Default avatar not found");

    const stream = fs.createReadStream(file);
    let transform = sharp();

    if (typeof req.query.size === 'string' && /^[\d]{1,4}$/.test(req.query.size)) {
        const size = parseInt(req.query.size);
        transform = transform.resize(size, size, {fit: 'outside', position: 'center'});
    }

    res.setHeader('Content-Type', 'image/webp');
    //res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

    stream.pipe(transform).pipe(res);
}

export default apiHandler({GET});