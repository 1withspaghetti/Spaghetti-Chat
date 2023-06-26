import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import ThemeSwitch from "@/components/ThemeSwitch";
import MessageInput from "@/components/MessageInput";
import SkeletonText from "@/components/loader/SkeletonText";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { NextPageWithLayout } from "@/pages/_app";
import axios from "axios";
import { NotificationContext } from "@/context/NotificationContext";

const Channel: NextPageWithLayout = () => {

    var authContext = useContext(AuthContext);
    const notify = useContext(NotificationContext);
    const router = useRouter();

    const [channel, setChannel] = useState<any>();

    useEffect(()=>{
        if (authContext.awaitAuth || !authContext.loggedIn || channel) return;

        axios.get('/api/channel/'+router.query.channelId, {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            setChannel(res.data.channel);
        }).catch(notify);
    }, [authContext.awaitAuth]);

    return (
        <>
            <div className="flex flex-col w-full pt-2 pr-2 h-full">
                <div className="absolute flex z-10 top-2 left-2 right-2 ml-2 mr-5 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg">
                    {
                        channel ?
                            <>
                                <div className="text-xl font-bold">{channel.name || (channel.members as any[]).map(x=>x.username).sort().join(', ')}</div>
                                <div className="text-lg">{(!channel.dm && channel.name) ? (channel.members as any[]).map(x=>x.username).sort().join(', ') : ''}</div>
                            </>
                        :
                            <>
                                <SkeletonText className="text-xl font-bold mr-2" width={200}></SkeletonText>
                                <SkeletonText className="text-lg" faint width={400}></SkeletonText>
                            </>

                    }
                </div>
                <div className="flex flex-col-reverse gap-2 h-full px-4 pt-16 pb-4 overflow-y-auto">
                    { true ?
                        <>
                            {[10, 17, 9, 12, 8, 15, 11, 13, 14, 17,  10, 17, 9, 12, 8, 15, 11, 13, 14, 17].map((x, i) =>
                                <div className="flex mx-2 py-1" key={i}>
                                    <div className="skeleton-pfp mr-2"></div>
                                    <div className="w-full">
                                        <SkeletonText className="text-lg font-bold" width={x*10}></SkeletonText>
                                        <SkeletonText className="text-lg font-bold" width={x*30} faint></SkeletonText>
                                    </div>
                                </div>
                            )}
                        </>
                    :
                        <>

                        </>
                    }
                </div>
                <MessageInput to={channel ? (channel.dm ? channel.members[0].username : channel.name || 'channel') : 'channel'}/>
            </div>
        </>
  )
}
Channel.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Channel;
