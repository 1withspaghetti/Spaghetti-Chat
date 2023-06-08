import { Server as NetServer, Socket } from "net";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export type NextApiHandlerWithSocket<T = any> = (req: NextApiRequest, res: NextApiResponseWithSocket<T>) => unknown | Promise<unknown>

export type NextApiResponseWithSocket<T = any> = NextApiResponse<T> & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};