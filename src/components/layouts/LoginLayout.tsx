import { useContext, useEffect, useState } from "react"
import ThemeSwitch from "../ThemeSwitch";
import Link from "next/link";
import Image from 'next/image';
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { NotificationContext } from "@/context/NotificationContext";

export default function LoginLayout({children}: {children: React.ReactNode}) {

    var authContext = useContext(AuthContext);
    var notify = useContext(NotificationContext);

    const [data, setData] = useState<any>();
    useEffect(()=>{
        if (authContext.awaitAuth || !authContext.loggedIn || data) return;

        axios.get('/api/user', {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            setData(res.data);
        }).catch(notify);
    }, [authContext.awaitAuth]);
    
    return (
        <>
            <div className="sticky top-0 left-0 right-0 text-center flex justify-center">
                <div className='w-full sm:w-max px-6 py-2 bg-slate-200 dark:bg-slate-800 sm:rounded-b-lg shadow-lg flex flex-col sm:flex-row justify-center items-center'>
                    <Link href="/" passHref className="whitespace-nowrap px-4 py-2 cursor-pointer hover:opacity-90 transition">
                        <div className="text-2xl font-bold">Spaghetti Chat</div>
                        <div className="text-sm italic opacity-75">Online Chat Service</div>
                    </Link>
                    <div>
                        { authContext.awaitAuth ? '' :
                        ( authContext.loggedIn && data ?
                            <div className="mt-2 sm:mt-0 sm:ml-4">
                                <div className="text-sm italic opacity-90">You are already logged in as:</div>
                                <div className="flex gap-2 items-center my-1 px-2 py-1 bg-slate-400 dark:bg-slate-700 rounded-lg">
                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                        <Image src={`/imgs/profile.jpg`} alt="Profile Picture" width={32} height={32}></Image>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold">{data.username}</div>
                                    </div>
                                </div>
                                <Link href="/" className="hover:opacity-75 transition-opacity">Start chatting ➜</Link>
                            </div>
                        :
                            <div className="flex">
                                <Link href="/sign-up" className="h-min rounded-lg shadow text-lg font-semibold mx-1 px-4 py-[2px] cursor-pointer transition-all text-navy-50 bg-blue-500 dark:bg-blue-700 hover:shadow-lg hover:scale-105">Sign Up</Link>
                                <Link href="/login" className="h-min rounded-lg shadow text-lg font-semibold mx-1 px-4 py-[2px] cursor-pointer transition-all text-navy-50 bg-blue-500 dark:bg-blue-700 hover:shadow-lg hover:scale-105">Login</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="w-fill flex justify-center mt-16">{children}</div>
        </>
    )
}