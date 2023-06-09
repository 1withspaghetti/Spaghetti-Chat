import { Socket } from "socket.io-client";
import { createContext } from "react";

export const SocketContext = createContext<Socket|undefined>(undefined);