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
import AvatarZoom from "@/components/AvatarZoom";
import userColors from "@/utils/userColors";

const Home: NextPageWithLayout = () => {

    var authContext = useContext(AuthContext);
    var userContext = useContext(UserContext);
    const notify = useContext(NotificationContext);
    const router = useRouter();

    const [popup, setPopup] = useState<undefined|"avatar">();

    const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);
    const [email, setEmail] = useState<string>();
    const [username, setUsername] = useState<string>();
    const [color, setColor] = useState<number>();
    const [about, setAbout] = useState<string>();
    const [avatar, setAvatar] = useState<string>();
    const [originalSettings, setOriginalSettings] = useState<any>();

    const usernameInput = useRef<FormInput>(null);
    const avatarInput = useRef<HTMLInputElement>(null);
    const aboutMe = useRef<HTMLTextAreaElement>(null);
    const [colorPanel, setColorPanel] = useState<boolean>(false);
    const [emailShown, setEmailShown] = useState<boolean>(false);

    const [hasChanges, setHasChanges] = useState<boolean>(false);

    useEffect(()=>{
        if (authContext.awaitAuth || !authContext.loggedIn || settingsLoaded) return;

        axios.get('/api/user/settings', {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            setEmail(res.data.email);
            setUsername(res.data.username);
            setColor(res.data.color);
            setAbout(res.data.about);
            setAvatar(res.data.avatar);

            setSettingsLoaded(true);
            setOriginalSettings({...res.data});
        }).catch(notify);
    }, [authContext.awaitAuth])

    function selectAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || !e.target.files[0]) return;
        var file = e.target.files[0];
        if (file.size > 4 * 1024 * 1024) {
            notify("Error", "File must be less than 4MB", true);
            return;
        }
        if (!file.type.match(/image\/(png|jpg|jpeg|webp|gif)/)) {
            notify("Error", "Supported file extensions: PNG, JPG, WEBP, GIF", true);
            return;
        }
        setPopup("avatar");
    }
    function uploadAvatar(blob: Blob) {
        var formData = new FormData();
        formData.append("avatar", blob);
        axios.post('/api/user/avatar', formData, {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            setAvatar(res.data.avatar);
            notify("", "Your avatar has been updated successfully.");
        }).catch(notify);
        setPopup(undefined);
    }
    function cancelAvatar(err?: string) {
        if (err) notify("Error", err, true);
        setPopup(undefined);
    }

    const aboutMeAdjustSize = ()=>{
        if (!aboutMe.current) return;
        setAbout(aboutMe.current.value);
        aboutMe.current.style.height = "0px";
        aboutMe.current.style.height = Math.max(Math.min(aboutMe.current.scrollHeight, 128), 72) + "px";
    }

    function resetSettings() {
        setEmail(originalSettings.email);
        setUsername(originalSettings.username);
        setColor(originalSettings.color);
        setAbout(originalSettings.about);
    }

    function saveSettings() {
        axios.post('/api/user/settings', {username, color, about}, {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            setOriginalSettings({...res.data});
        }).catch(notify);
    }

    useEffect(()=>{
        if (!settingsLoaded) return;
        if (username != originalSettings.username || color != originalSettings.color || about != originalSettings.about) {
            setHasChanges(true);
        } else {
            setHasChanges(false);
        }
    }, [originalSettings, username, color, about]);


    if (!settingsLoaded) {
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
                <div className="absolute flex z-10 top-2 left-2 right-2 ml-2 mr-4 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg">
                    <div className="text-lg font-bold">Settings</div>
                </div>
                <div className="flex flex-col items-center gap-2 w-full h-full px-4 pt-16 pb-16 overflow-y-auto">
                    <div className="mx-auto w-full max-w-lg p-2 sm:p-4 gradient bg-opacity-90 rounded-lg shadow-lg">
                        <div className="flex gap-3 sm:gap-6">
                            <div className="w-16 sm:w-24 h-16 sm:h-24 flex-shrink-0 relative rounded-full bg-black bg-opacity-25 select-none overflow-hidden group">
                                <img src={`/api/avatar/${avatar}`} alt="Your Profile Picture" className="flex-shrink-0 rounded-full bg-black bg-opacity-25 select-none"></img>
                                <label tabIndex={0} htmlFor="avatar" className="absolute top-0 right-0 left-0 bottom-0 flex justify-center items-center bg-black bg-opacity-80 opacity-0 group-hover:opacity-75 focus:opacity-100 transition-opacity cursor-pointer">
                                    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 -960 960 960"><path d="M769-648v-94h-94v-72.5h94V-908h72v93.5h95v72.5h-95v94h-72ZM109-55q-39.05 0-66.525-27.475Q15-109.95 15-149v-495q0-38.463 27.475-66.731Q69.95-739 109-739h132l84-98h257v95H368l-84 98H109v495h661v-393h95v393q0 39.05-28.269 66.525Q808.463-55 770-55H109Zm330.5-171q72.5 0 121.5-49t49-121.5q0-72.5-49-121T439.5-566q-72.5 0-121 48.5t-48.5 121q0 72.5 48.5 121.5t121 49Zm0-60q-47.5 0-78.5-31.5t-31-79q0-47.5 31-78.5t78.5-31q47.5 0 79 31t31.5 78.5q0 47.5-31.5 79t-79 31.5Zm.5-110Z"/></svg>
                                </label>
                                <input ref={avatarInput} type="file" id="avatar" name="avatar" accept="image/*" className="hidden" onChange={selectAvatar}></input>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex flex-col sm:flex-row gap-2 text-base sm:text-2xl font-bold break-all">
                                    <FormInput ref={usernameInput} id="username" label="" validator={SignUpValidator.user} noShift value={[username, setUsername]} attr={{placeholder: "Username", style: {color: color ? '#'+color.toString(16).padStart(6,'0') : 'currentcolor', background: "rgb(0 0 0 / 0.25)"}, autoCorrect: "false", autoComplete: "off"}}></FormInput>
                                    <button title="Set Username Color" className="group flex-shrink-0 flex items-center" onClick={()=>setColorPanel(!colorPanel)}>
                                        <Image width={24} height={24} src="/imgs/color-icon.svg" alt="Select user color" className="opacity-50 group-hover:opacity-75 transition-opacity"></Image>
                                    </button>
                                </div>
                                <div className="mt-1 text-xs sm:text-base opacity-50">Id: {originalSettings.id}</div>
                            </div>
                        </div>
                        <div className={`flex flex-col items-center sm:my-0 overflow-hidden ${colorPanel ? 'max-h-screen my-4' : 'max-h-0 my-0'} transition-all`}>
                            <button className="w-[calc(1.5rem*7)] h-6 bg-current" onClick={()=>setColor(undefined)}><span className="dark:text-black text-white text-sm font-semibold">Reset</span></button>
                            {userColors.map((c, i)=>
                                <div key={i} className="flex">
                                    {c.map((c, i)=>
                                        <button key={i} className="flex-shrink-0 w-6 h-6" style={{background: c}} onClick={()=>setColor(parseInt(c.substring(1), 16))}></button>
                                    )}
                                </div>
                            )}
                            <button className="flex-shrink-0 text-xs sm:text-sm opacity-50 mt-2" onClick={()=>setColorPanel(false)}>Collapse</button>
                        </div>
                        <div className="mt-2">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end">
                                <span className="font-bold">About Me</span>
                                <span className="text-xs opacity-50">Description will be limited to 6 lines</span>
                            </div>
                            <textarea ref={aboutMe} autoComplete="none" rows={3}
                                value={about}
                                onInput={aboutMeAdjustSize}
                                className="mt-1 px-2 w-full bg-black bg-opacity-25 outline-none resize-none rounded slim-scrollbar">
                            </textarea>
                        </div>
                    </div>
                    <div className="sm:grid grid-cols-[auto,auto] mt-4 gap-x-4 gap-y-2 text-lg">
                        <div className="font-bold">Account Created:</div>
                        <div className="">{new Date(originalSettings.created).toLocaleString()}</div>
                        <div className="font-bold">Email:</div>
                        <div className="">
                            { !emailShown ? 
                                <>
                                    <span>********</span>
                                    <span>@{email?.split('@')[1]}</span>
                                </>
                                :
                                <span>{email}</span>
                            }
                            {emailShown ? <button className="ml-2 text-xs opacity-50" onClick={()=>setEmailShown(false)}>Hide</button> : <button className="ml-2 text-xs opacity-50" onClick={()=>setEmailShown(true)}>Reveal</button>}
                        </div>
                    </div>
                    <div className="mt-0 flex gap-6">
                        <button onClick={()=>notify('Error', 'Not supported yet :(', true)} className="text-base text-blue-500 underline">Change Email</button>
                        <button onClick={()=>notify('Error', 'Not supported yet :(', true)} className="text-base text-blue-500 underline">Change Password</button>
                    </div>
                    <div className="mt-6 flex gap-2">
                        <button onClick={resetSettings} onTouchStart={resetSettings} className="w-min rounded-lg shadow font-semibold mx-1 px-2 py-1 transition-all text-navy-50 bg-slate-400 dark:bg-slate-500 hover:shadow-lg hover:scale-105">Reset</button>
                        <button onClick={saveSettings} onTouchStart={saveSettings} className="w-min rounded-lg shadow font-semibold mx-1 px-4 py-1 transition-all text-navy-50 bg-blue-500 dark:bg-blue-700 hover:shadow-lg hover:scale-105">Save</button>
                    </div>
                </div>
            </div>
            <div className={`absolute left-0 bottom-0 right-0 px-4 py-2 text-center bg-red-600 shadow-lg rounded-t-lg text-white ${hasChanges ? 'translate-y-0' : 'translate-y-full'} transition-transform`}>
                <b>Careful!</b> You have unsaved changes! <a href="#" onClick={resetSettings} className="underline">Reset</a> - <a href="#" onClick={saveSettings} className="underline">Save</a>
            </div>
            { popup && 
                <div className='fixed z-50 top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-50' onClick={()=>setPopup(undefined)}>
                    {popup === 'avatar' && 
                        <div className='max-w-lg w-full flex flex-col items-center gradient bg-opacity-60 p-6 m-4 rounded-lg shadow-lg text-center' onClick={(e)=>e.stopPropagation()}>
                            <AvatarZoom src={avatarInput.current?.files?.[0]} onSubmit={uploadAvatar} onCancel={cancelAvatar}></AvatarZoom>
                        </div>
                    }
                </div>
            }
        </>
    )
}
Home.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Home;
