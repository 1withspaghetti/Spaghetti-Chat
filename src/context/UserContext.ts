import { createContext } from "react";

export type User = {
    id: number;
    username: string;
    avatar: number;
    color: string;
    meta: number;
}

export const UserContext = createContext<User|undefined>(undefined);