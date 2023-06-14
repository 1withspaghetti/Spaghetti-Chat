import React from "react";
import { useEffect, useState } from "react";

export default function Notification(props: {id: number, title: string, message: string, isError?: boolean, shouldRemove: boolean}) {
    
    const [visible, setVisible] = useState<boolean>(true);

    useEffect(()=>{
        setTimeout(close, 5000);
    }, []);

    useEffect(()=>{
        if (props.shouldRemove) close();
    }, [props.shouldRemove]);

    function close() {
        if (!visible) return;
        setVisible(false);
    }

    return (
        <div className={`max-w-sm h-max notification ${visible ? 'max-h-screen translate-x-0 mb-4' : 'max-h-0 translate-x-[calc(100%+1rem)] mb-0'} overflow-hidden transition-all`}>
            <div className={`flex pl-4 pr-2 py-2 rounded-lg shadow-lg text-white ${props.isError ? "bg-red-600" : "bg-green-500"}`}>
                <div className="flex flex-col justify-center">
                    <div className="text-xl font-bold whitespace-nowrap">{props.title}</div>
                    <div className="font-semibold">{props.message}</div>
                </div>
                <button className="text-2xl font-bold h-min px-2" onClick={close}>⨯</button>
            </div>
        </div>
    )
}
