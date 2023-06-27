import { ApiError, apiHandler } from "@/utils/api";
import { verifyResourceJWT } from "@/utils/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from 'formidable';
import path from "path";
import { HttpStatusCode } from "axios";
import sharp from "sharp";
import fs from "fs";
import { generateRandomId } from "@/utils/db/dbUtil";
import User from "@/utils/db/models/User";
import { NextApiResponseWithSocket } from "@/types/next";

export const AVATAR_UPLOAD_DIR = path.resolve('.', `avatars/`);

export const config = {
    api: {
      bodyParser: false,
    },
};

const options: Partial<formidable.Options> = {
    keepExtensions: true, 
    uploadDir: AVATAR_UPLOAD_DIR,
    filter: (part)=>{
        return !!part.mimetype?.match(/^image\/(png|jpg|jpeg|webp|gif)$/) && part.name==='avatar';
    },
    filename: (name, ext, part, form)=>{
        return generateRandomId('avatar') + '.webp';
    },
    fileWriteStreamHandler: (file)=>{
        if (!file) throw new ApiError("Error uploading files", HttpStatusCode.InternalServerError);
        let transform = sharp().resize(128, 128, {fit: 'fill'}).toFormat('webp');
        transform.toFile((file as any).filepath);
        return transform;
    },
    maxFields: 1,
    maxFiles: 1,
    maxFileSize: 1024 * 1024,
    maxTotalFileSize: 1024 * 1024,
    allowEmptyFiles: false,
    multiples: true,
}

fs.mkdirSync(AVATAR_UPLOAD_DIR, {recursive: true});

async function POST(req: NextApiRequest, res: NextApiResponseWithSocket) {
    const id = verifyResourceJWT(req.headers.authorization);

    var user = await User.findOne({_id: id}, {_id: true, avatar: true, avatarNext: true});
    if (!user) throw new ApiError("User not found", HttpStatusCode.NotFound);

    // If over 4 avatar changes in the last 40 minutes (regenerates at 1 change every 10 minutes)
    if (Date.now() < (user.avatarNext||new Date()).getTime() - (600000 * 4)) throw new ApiError("You have updated your avatar too many times recently, please slow down!", HttpStatusCode.BadRequest);
    user.avatarNext = new Date(Math.max((user.avatarNext||new Date()).getTime(), Date.now()) + 600000);
    await user.save();

    const form = formidable(options);

    form.on('progress', (bytesReceived, bytesExpected)=>{
        if (bytesReceived > options.maxFileSize! || bytesExpected > options.maxFileSize!) {
            throw new ApiError("File too large", HttpStatusCode.BadRequest);
        }
    });

    var { fields, files } = await new Promise<{fields: formidable.Fields, files: formidable.Files}>((resolve, reject)=>{
        form.parse(req, (err, fields, files)=>{
            if (!err) resolve({fields, files});
            else {
                console.error("Could not upload files:", err);
                try {
                    if (files) {
                        for (let file of (Array.isArray(files) ? files : [files])) {
                            if (file.filepath) fs.unlinkSync(file.filepath);
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
                reject(new ApiError("Error uploading files", HttpStatusCode.InternalServerError));
            }
        });
    });

    if (!files.avatar) throw new ApiError("No file uploaded", HttpStatusCode.BadRequest);
    if (Array.isArray(files.avatar)) {
        for (let file of files.avatar) {
            fs.unlinkSync(file.filepath);
        }
        throw new ApiError("Only one file allowed", HttpStatusCode.BadRequest);
    }

    user = await User.findOne({_id: id}, {_id: true, username: true, avatar: true, color: true, meta: true});
    if (!user) throw new ApiError("Unknown user", HttpStatusCode.NotFound);

    
    if (user.avatar) {
        var old = path.resolve(AVATAR_UPLOAD_DIR, user.avatar + '.webp');
        if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    user.avatar = parseInt(files.avatar.newFilename.split('.')[0]);
    await user.save();

    res.socket.server.io.emit('userUpdate', {action: 'edit', data: user.toJSON()}); // Note: All users will receive this update
    res.socket.server.io.to(`u${id}`).emit('selfUserUpdate', {action: 'set', data: user.toJSON()}); // Note: Only the user will receive this update

    res.status(200).json({success: true, avatar: user.avatar});
}

export default apiHandler({ POST });