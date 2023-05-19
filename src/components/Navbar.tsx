import { useContext, useState } from "react"
import ThemeSwitch from "./ThemeSwitch";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";

export default function Navbar() {

    var [open, setOpen] = useState<boolean>(false);

    var authContext = useContext(AuthContext);
    
    return (
        <div className='sticky top-0 left-0 right-0 bg-slate-200 dark:bg-slate-800 shadow-lg flex justify-between'>
            <div className={`flex flex-col sm:flex-row overflow-hidden transition-all sm:h-11`} style={{maxHeight: `${open ? 44 + 44 * 2/*<- The number to additional nav buttons */ : 44}px`}}>
                <div className="flex">
                    <Link href="/" className="text-xl whitespace-nowrap font-bold px-5 pt-2 pb-1 cursor-pointer transition-[border-color] border-slate-200 dark:border-slate-800 border-b-4 bg-slate-200 hover:border-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:hover:border-blue-700 dark:focus:border-blue-700">Website Name</Link>
                </div>
                <div className="flex flex-col sm:flex-row w-min">
                    <Link href="" className="nav-item">Example</Link>
                    <Link href="" className="nav-item">Example</Link>
                </div>
            </div>
            <div className="flex items-center h-11">
                { authContext.awaitAuth ? '' :
                ( authContext.loggedIn ?
                    <div tabIndex={0} onClick={authContext.logout} title="Log out of current account" className="h-min text-lg font-semibold mx-1 px-2 py-[2px] cursor-pointer transition-all text-red-500">Logout</div>
                :
                    <Link href="/login" className="h-min rounded-lg shadow text-lg font-semibold mx-1 px-4 py-[2px] cursor-pointer transition-all text-navy-50 bg-blue-500 dark:bg-blue-700 hover:shadow-lg hover:scale-105">Login</Link>
                )}
                <div className=""><ThemeSwitch></ThemeSwitch></div>
                <div onClick={()=>{setOpen(!open)}} tabIndex={0} className="cursor-pointer sm:hidden p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="40" viewBox="0 96 960 960" width="40"><path d="M120 816v-60h720v60H120Zm0-210v-60h720v60H120Zm0-210v-60h720v60H120Z"/></svg>
                </div>
            </div>
        </div>
    )
}