import { ApiError, apiHandler } from "@/utils/api";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import { NextApiResponseWithSocket } from "@/types/next";
import { verifyResourceJWT } from "@/utils/jwt";

export const config = {
    api: {
        bodyParser: false,
    },
};

async function GET(req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (!res.socket.server.io) {
        console.log("socket.io is initializing");
        const io = new Server(res.socket.server as any);
        io.use((socket, next) => {
            if (socket.handshake.auth && socket.handshake.auth.token) {
                try {
                    const token = socket.handshake.auth.token as string;
                    var id = verifyResourceJWT(token);
                    socket.data.id = id;
                    socket.join(`u${id}`)
                    next();
                } catch (err) {
                    return next(new ApiError("Authentication error"));
                }
            } else next(new ApiError("Authentication error"));
        });
        io.on("connection", (socket) => {
            console.log(`socket.io is connected with user ${socket.data.id}`);
        });
        res.socket.server.io = io;
    }
    res.status(200).json({success: true});
}

export default apiHandler({GET});