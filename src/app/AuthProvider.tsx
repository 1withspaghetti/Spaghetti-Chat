"use client";

import AuthContext from "@/context/AuthContext";
import axios, { AxiosError } from "axios";
import { createContext, useEffect, useState } from "react";

var refreshToken: string|undefined = undefined;
var tokensUpdated: boolean = false;

export default function Layout({ children }: { children: React.ReactNode}) {
    

    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [resourceToken, setResourceToken] = useState<string>();
    const [awaitAuth, setAwaitAuth] = useState<boolean>(true);

    function updateTokens() {
        return new Promise<void>((res)=>{
            if (!refreshToken) return res();
            tokensUpdated = false;
            axios.get('/api/auth/refresh', {headers: {"Authorization": refreshToken}})
            .then((res)=>{
                if (tokensUpdated) return;
                setLoggedIn(true);
                refreshToken = res.data["refresh_token"];
                setResourceToken(res.data["resource_token"]);

                localStorage.setItem("session_token", res.data["refresh_token"]);
            }).catch((err: AxiosError<any, any>)=>{
                if (tokensUpdated) return;
                if (err.response?.status == 401) {
                    setLoggedIn(false);
                    refreshToken = undefined;
                    setResourceToken(undefined);
                    localStorage.removeItem("session_token");
                }
                console.error(err);
            }).finally(()=>{
                res();
            })
        });
    }

    useEffect(() => {
        var _refreshToken = localStorage.getItem("session_token");
        if (_refreshToken) {
            setLoggedIn(true);
            refreshToken = _refreshToken;
            updateTokens().then(()=>{
                setAwaitAuth(false);
            });
        } else setAwaitAuth(false);

        const interval = setInterval(updateTokens, 120000);
        return () => clearInterval(interval);
    }, []);

    function setTokens(_refreshToken: string|undefined, resourceToken: string|undefined) {
        tokensUpdated = true;

        if (_refreshToken && resourceToken) setLoggedIn(true);
        refreshToken = _refreshToken;
        setResourceToken(resourceToken);

        if (refreshToken) localStorage.setItem('session_token', refreshToken);
        else localStorage.removeItem('session_token');
    }

    async function logout() {
        try {
            await axios.get("/api/auth/logout", {headers: {"Authorization": refreshToken}});
        } catch (err) {
            if (!(err instanceof AxiosError) || err.response?.status != 401) throw err;
        }
        setLoggedIn(false);
        refreshToken = undefined;
        setResourceToken(undefined);
        localStorage.removeItem("session_token");
    }
    
    return (
        <AuthContext.Provider value={{loggedIn, resourceToken, awaitAuth, updateAuth: setTokens, logout}}>
            {children}
        </AuthContext.Provider>
    )
  }