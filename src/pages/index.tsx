import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import Image from 'next/image';
import ThemeSwitch from "@/components/ThemeSwitch";
import MessageInput from "@/components/MessageInput";

export default function Home() {
  var authContext = useContext(AuthContext);
  const router = useRouter();

  const [selfData, setSelfData] = useState<any>();
  const [channelData, setChannelData] = useState<any>();

  useEffect(()=>{
      if (!authContext.awaitAuth && !authContext.loggedIn) router.push('/login?url='+router.route);
  }, [authContext]);

  useEffect(()=>{
      if (authContext.awaitAuth || !authContext.loggedIn || selfData) return;

      axios.get('/api/user', {headers: {Authorization: authContext.resourceToken}}).then(res=>{
          setSelfData(res.data);
      })
  }, [authContext.awaitAuth]);


  const [open, setOpen] = useState<boolean>(false);

  return (
        <div className="fixed top-0 right-0 left-0 bottom-0 gradient bg-opacity-50 flex">
            <div className="flex flex-col flex-shrink-0 items-stretch w-full max-w-[20rem] gradient bg-opacity-80 rounded-r-3xl shadow-xl overflow-hidden">
                <div className="flex items-center px-4 py-2 bg-black bg-opacity-5 dark:bg-opacity-25 shadow-lg">
                    <div className="w-12 h-12 mr-4 rounded-full overflow-hidden shadow-lg">
                        { selfData ?
                            <Image src={`/imgs/profile.jpg`} alt="Profile Picture" width={48} height={48}></Image>
                        :
                            <div className="skeleton-pfp"></div>
                        }
                    </div>
                    <div className="mr-auto">
                        { selfData ?
                            <>
                                <div className="text-lg font-bold -mb-[2px]">{selfData.username}</div>
                                <div className="text-sm opacity-25">Id: {selfData.id}</div>
                            </>
                        :
                            <>
                                <div className="skeleton-text text-lg font-bold -mb-[2px]">xxxxxxxxxx</div>
                                <div className="skeleton-text text-sm opacity-25">xxxxxxxxxxxxxxxxx</div>
                            </>
                        }
                    </div>
                    <div className="px-1 opacity-50 hover:opacity-75 transition-opacity cursor-pointer">
                        <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 96 960 960"><path d="m388 976-20-126q-19-7-40-19t-37-25l-118 54-93-164 108-79q-2-9-2.5-20.5T185 576q0-9 .5-20.5T188 535L80 456l93-164 118 54q16-13 37-25t40-18l20-127h184l20 126q19 7 40.5 18.5T669 346l118-54 93 164-108 77q2 10 2.5 21.5t.5 21.5q0 10-.5 21t-2.5 21l108 78-93 164-118-54q-16 13-36.5 25.5T592 850l-20 126H388Zm92-270q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38Z"/></svg>
                    </div>
                </div>
                <div className="flex flex-col h-full p-2">
                    { true ?
                        <>
                            {[12, 16, 9, 10, 15, 9, 12, 15, 17, 10, 8].map((x, i) =>
                                <div className="flex items-center mx-2 py-1" key={i}>
                                    <div className="skeleton-pfp mr-2"></div>
                                    <div className="skeleton-text text-lg font-bold -mb-[2px]">{'x'.repeat(x)}</div>
                                </div>
                            )}
                        </>
                    :
                        <>

                        </>
                    }
                </div>
                <div><ThemeSwitch></ThemeSwitch></div>
            </div>
            <div className="flex flex-col w-full relative pt-2 pr-2">
                <div className="sticky flex bottom-2 left-2 right-2 mx-2 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg">
                    <div className="skeleton-text text-xl font-bold mr-2">{'x'.repeat(15)}</div>
                    <div className="skeleton-text faint text-lg">{'x'.repeat(45)}</div>
                </div>
                <div className="flex flex-col-reverse gap-2 h-full px-4 py-4 overflow-y-auto">
                    { true ?
                        <>
                            {[10, 17, 9, 12, 8, 15, 11, 13, 14, 17,  10, 17, 9, 12, 8, 15, 11, 13, 14, 17].map((x, i) =>
                                <div className="flex mx-2 py-1" key={i}>
                                    <div className="skeleton-pfp mr-2"></div>
                                    <div className="">
                                        <div className="skeleton-text text-lg font-bold -mb-[2px]">{'x'.repeat(x)}</div>
                                        <div className="skeleton-text faint">{'x'.repeat(x*4)}</div>
                                    </div>
                                </div>
                            )}
                        </>
                    :
                        <>

                        </>
                    }
                </div>
                <MessageInput />
            </div>
        </div>
  )
}
