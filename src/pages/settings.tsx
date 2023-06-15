import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { NextPageWithLayout } from "./_app";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import axios from "axios";
import Image from "next/image";
import { UserContext } from "@/context/UserContext";
import { NotificationContext } from "@/context/NotificationContext";
import FormInput from "@/components/FormInput";
import { SignUpValidator } from "@/utils/validation/authValidation";

const Home: NextPageWithLayout = () => {

    var authContext = useContext(AuthContext);
    var userContext = useContext(UserContext);
    const notify = useContext(NotificationContext);
    const router = useRouter();

    const [settings, setSettings] = useState<any>();
    const [originalSettings, setOriginalSettings] = useState<any>();

    const usernameInput = useRef<FormInput>(null);
    const avatarInput = useRef<HTMLInputElement>(null);
    const aboutMe = useRef<HTMLTextAreaElement>(null);

    useEffect(()=>{
        if (authContext.awaitAuth || !authContext.loggedIn || settings) return;

        axios.get('/api/user/settings', {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            setSettings(res.data);
            usernameInput.current?.setValue(res.data.username);
            setOriginalSettings({...res.data});
        }).catch(notify);
    }, [authContext.awaitAuth])

    function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || !e.target.files[0]) return;
        var file = e.target.files[0];
        if (file.size > 1024 * 1024) {
            notify("Error", "File must be less than 1MB", true);
            return;
        }
        if (!file.type.match(/image\/(png|jpg|jpeg|webp|gif)/)) {
            notify("Error", "Supported file extensions: PNG, JPG, WEBP, GIF", true);
            return;
        }
        var formData = new FormData();
        formData.append("avatar", file);
        axios.post('/api/user/avatar', formData, {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            setSettings({...settings, avatar: res.data.avatar});
            notify("", "Your avatar has been updated successfully.");
        }).catch(notify);
    }

    const aboutMeAdjustSize = ()=>{
        if (!aboutMe.current) return;
        aboutMe.current.style.height = "0px";
        aboutMe.current.style.height = Math.max(Math.min(aboutMe.current.scrollHeight, 128), 72) + "px";
    }



    if (!settings) {
        return (
            <div className="flex flex-col w-full pt-2 pr-2 h-full">
                    <div className="absolute flex z-10 top-2 left-2 right-2 ml-2 mr-5 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg">
                        <div className="text-lg font-bold">Settings</div>
                    </div>
                    <div className="mt-16 mx-auto text-2xl font-semibold italic opacity-50">Loading...</div>
            </div>
        )
    }
    return (
        <>
            <div className="flex flex-col w-full h-full pt-2 pr-2">
                <div className="absolute flex z-10 top-2 left-2 right-2 ml-2 mr-5 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg">
                    <div className="text-lg font-bold">Settings</div>
                </div>
                <div className="flex flex-col gap-2 w-full h-full px-4 pt-16 pb-4 overflow-y-auto">
                    <div className="mx-auto w-full max-w-lg p-2 sm:p-4 gradient bg-opacity-90 rounded-lg shadow-lg">
                        <div className="flex items-center gap-3 sm:gap-6">
                            <div className="w-16 sm:w-24 h-16 sm:h-24 flex-shrink-0 relative rounded-full bg-black bg-opacity-25 select-none overflow-hidden group">
                                <img src={`/api/avatar/${settings.avatar}`} className="pfp large"></img>
                                <label tabIndex={0} htmlFor="avatar" className="absolute top-0 right-0 left-0 bottom-0 flex justify-center items-center bg-black bg-opacity-80 opacity-0 group-hover:opacity-75 focus:opacity-100 transition-opacity cursor-pointer">
                                    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 -960 960 960"><path d="M769-648v-94h-94v-72.5h94V-908h72v93.5h95v72.5h-95v94h-72ZM109-55q-39.05 0-66.525-27.475Q15-109.95 15-149v-495q0-38.463 27.475-66.731Q69.95-739 109-739h132l84-98h257v95H368l-84 98H109v495h661v-393h95v393q0 39.05-28.269 66.525Q808.463-55 770-55H109Zm330.5-171q72.5 0 121.5-49t49-121.5q0-72.5-49-121T439.5-566q-72.5 0-121 48.5t-48.5 121q0 72.5 48.5 121.5t121 49Zm0-60q-47.5 0-78.5-31.5t-31-79q0-47.5 31-78.5t78.5-31q47.5 0 79 31t31.5 78.5q0 47.5-31.5 79t-79 31.5Zm.5-110Z"/></svg>
                                </label>
                                <input type="file" id="avatar" name="avatar" accept="image/*" className="hidden" onChange={uploadAvatar}></input>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex gap-2 text-base sm:text-2xl font-bold break-all">
                                    <FormInput ref={usernameInput} id="username" label="" validator={SignUpValidator.user} noShift initialVal={settings.username} attr={{placeholder: "Username", style: {background: "rgb(0 0 0 / 0.25)"}, autoCorrect: "false", autoComplete: "off"}}></FormInput>
                                    <button className="group flex-shrink-0">
                                        <Image width={24} height={24} src="/imgs/color-icon.svg" alt="Select user color" className="opacity-50 group-hover:opacity-75 transition-opacity"></Image>
                                    </button>
                                </div>
                                <div className="text-sm sm:text-base opacity-50">Id: {settings.id}</div>
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end">
                                <span className="font-bold">About Me</span>
                                <span className="text-xs opacity-50">Description will be limited to 6 lines</span>
                            </div>
                            <textarea ref={aboutMe} autoComplete="none" rows={3}
                                onInput={aboutMeAdjustSize}
                                className="mt-1 px-2 w-full bg-black bg-opacity-25 outline-none resize-none rounded slim-scrollbar">
                            </textarea>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
Home.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Home;
