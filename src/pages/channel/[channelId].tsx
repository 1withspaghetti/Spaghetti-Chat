import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { UIEvent as ReactUIEvent, use, useContext, useEffect, useReducer, useRef, useState } from "react";
import MessageInput from "@/components/MessageInput";
import SkeletonText from "@/components/loader/SkeletonText";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { NextPageWithLayout } from "@/pages/_app";
import axios, { AxiosError } from "axios";
import { NotificationContext } from "@/context/NotificationContext";
import { globalArrayReducer } from "@/utils/reducer";
import { SocketContext } from "@/context/SocketContext";
import { getTimeAgo } from "@/utils/time";
import ChatMessage from "@/components/ChatMessage";
import { UserContext } from "@/context/UserContext";
import user from "../api/user";

const Channel: NextPageWithLayout = () => {

    var authContext = useContext(AuthContext);
    var userContext = useContext(UserContext);
    var socket = useContext(SocketContext);
    const notify = useContext(NotificationContext);
    const router = useRouter();

    const [channel, setChannel] = useState<any>();
    const [messagesLoaded, setMessagesLoaded] = useState(false);
    const [messages, dispatchMessage] = useReducer(globalArrayReducer((a,b)=>b.id-a.id), []);

    useEffect(()=>{
        if (authContext.awaitAuth || !authContext.loggedIn || channel) return;

        axios.get('/api/channel/'+router.query.channelId, {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            setChannel(res.data.channel);
        }).catch((err: AxiosError<any, any>)=>{
            if (err.response?.status == 404) router.push('/');
            else notify(err);
        });

        axios.get('/api/channel/'+router.query.channelId+'/messages', {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            dispatchMessage({action: 'set', data: res.data.messages});
            setMessagesLoaded(true);
        }).catch((err: AxiosError<any, any>)=>{
            if (err.response?.status == 404) router.push('/');
            else notify(err);
        });
    }, [authContext.awaitAuth]);

    function updateUsers(data: any) {
        dispatchMessage({action: 'editAuthor', data: data.data});
    }

    useEffect(()=>{
        if (!socket) return;
        socket.on('message', dispatchMessage);
        socket.on('userUpdate', updateUsers);
        return ()=>{
            socket?.off('message', dispatchMessage);
            socket?.off('userUpdate', updateUsers);
        }
    }, [socket]);

    function sendMessage(content: string) {
        if (!content) return true;
        var temp = {
            id: Date.now(),
            author: userContext,
            content,
            created: new Date().toISOString(),
            unconfirmed: true
        }
        dispatchMessage({action: 'add', data: temp});
        axios.post('/api/channel/'+router.query.channelId+'/messages?count=25', {content}, {headers: {Authorization: authContext.resourceToken}}).then(res=>{
            dispatchMessage({action: 'add', data: res.data.message});
        }).catch(notify).finally(()=>{
            dispatchMessage({action: 'delete', data: temp});
        });

        return true;
    }

    const reachedEnd = useRef(false);

    function onScroll(event: ReactUIEvent<HTMLDivElement, UIEvent>) {
        if (messages.length < 25) reachedEnd.current = true;
        if (reachedEnd.current) return;

        if (event.currentTarget.scrollHeight - event.currentTarget.offsetHeight + event.currentTarget.scrollTop < 50) {
            axios.get('/api/channel/'+router.query.channelId+'/messages?before='+messages[messages.length-1].id+'&count=25', {headers: {Authorization: authContext.resourceToken}}).then(res=>{
                if (res.data.messages.length < 25) reachedEnd.current = true;
                dispatchMessage({action: 'add', data: res.data.messages});
            }).catch(notify);
        }
    }


    return (
        <>
            <div className="flex flex-col w-full pt-2 pr-2 h-full">
                <div className="absolute flex z-10 top-2 left-2 right-2 ml-0 sm:ml-2 mr-5 px-4 py-2 gradient bg-opacity-100 rounded-lg shadow-lg">
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
                <div className="flex flex-col-reverse gap-1 sm:gap-2 h-full px-1 sm:px-4 pt-16 pb-4 overflow-y-auto" onScroll={onScroll}>
                    { !messagesLoaded ?
                        <>
                            {[10, 17, 9, 12, 8, 15, 11, 13, 14, 17,  10, 17, 9, 12, 8, 15, 11].map((x, i) =>
                                <div className="flex mx-2 py-1" key={i}>
                                    <div className="skeleton-pfp mr-1"></div>
                                    <div className="w-full">
                                        <SkeletonText className="font-bold" width={x*10}></SkeletonText>
                                        <SkeletonText className="font-bold" width={x*30} faint></SkeletonText>
                                    </div>
                                </div>
                            )}
                        </>
                    :
                        <>
                            {messages.map((x, i) =>
                                <ChatMessage data={x} key={x.id}></ChatMessage>
                            )}
                        </>
                    }
                </div>
                <MessageInput to={channel ? (channel.dm ? channel.members[0].username : channel.name || 'channel') : 'channel'} onSend={sendMessage}/>
            </div>
        </>
  )
}
Channel.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Channel;
