"use client";

import { createContext } from "react";
import { Socket } from "socket.io-client";

export default createContext<Socket|undefined>(undefined);