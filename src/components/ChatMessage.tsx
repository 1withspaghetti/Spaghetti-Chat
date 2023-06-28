import { getTimeAgo } from "@/utils/time";
import { useEffect, useState } from "react";

export default function ChatMessage(props: {data: any}) {

    const [time, setTime] = useState<number>(Date.now());

    useEffect(()=>{
        const interval = setInterval(()=>{
            setTime(Date.now());
        }, 5000);
        return ()=>{
            clearInterval(interval);
        }
    }, []);

    return (
        <div className="flex mx-2 py-1 text-sm sm:text-base" key={props.data.id}>
            <img src={`/api/avatar/${props.data.author.avatar}?size=48`} alt="Profile Picture" className="pfp mobile-small mr-2"></img>
            <div className="w-full">
                <div className="">
                    <span className="font-semibold mr-1" style={{color: props.data.author.color ? '#'+props.data.author.color.toString(16).padStart(6,'0') : 'currentcolor'}}>{props.data.author.username}</span>
                    <span className="inline sm:inline text-[11px] text-black dark:text-white text-opacity-30 dark:text-opacity-30">{getTimeAgo(new Date(props.data.created))}</span>
                </div>
                <div className={props.data.unconfirmed ? 'opacity-50' : ''}>{props.data.content}</div>
            </div>
        </div>
    )
}