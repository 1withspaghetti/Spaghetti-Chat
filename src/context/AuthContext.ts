import { createContext } from "react";


export const AuthContext = createContext<{
    loggedIn: boolean, 
    awaitAuth: boolean,
    resourceToken?: string, 
    updateAuth: (refreshToken: string, resourceToken: string)=>void,
    logout: ()=>Promise<void>;
}>({loggedIn: false, awaitAuth: true, updateAuth: ()=>{console.error("Auth context is not ready yet!")}, logout: async ()=>{console.error("Auth context is not ready yet!")}});