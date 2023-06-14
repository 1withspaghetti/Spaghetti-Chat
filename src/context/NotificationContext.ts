import { createContext } from "react";

export const NotificationContext = createContext<(titleOrError: string|any, message?: string, isError?: boolean)=>void>(()=>{});