import { useEffect, useRef, useState } from "react";

export default function MessageInput(props: {to: string, onSend: (message: string) => boolean}) {

    const input = useRef<HTMLTextAreaElement>(null);

    function adjustSize() {
        if (!input.current) return;
        input.current.style.height = "0px";
        input.current.style.height = Math.min(input.current.scrollHeight, 256) + "px";
    }

    function send() {
        if (!input.current) return;
        if (props.onSend(input.current.value)) {
            input.current.value = "";
            adjustSize();
        }
    }

    useEffect(()=>{
        adjustSize();
        window.addEventListener('resize', adjustSize);
        return () => window.removeEventListener('resize', adjustSize);
    }, [])

    return (
        <div className="flex m-2 sm:m-4 mt-0 sm:mt-0 text-sm sm:text-base">
            <div className="flex w-full px-2 py-2 gradient bg-opacity-100 rounded-lg shadow-xl transition-opacity duration-300">
                <button title="Upload file" className="h-min opacity-25 hover:opacity-50 transition-opacity cursor-pointer">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 scale-90" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 -960 960 960"><path d="M460.09-52Q357-52 284.5-123.055 212-194.109 212-296v-441q0-73.9 51.712-125.95Q315.425-915 389.062-915q74.637 0 126.288 52.05Q567-810.9 567-736v399q0 45-31 76.5T459.5-229q-45.5 0-76-33T353-342v-397h63v400q0 19.875 12.805 33.938Q441.611-291 460.105-291q18.495 0 31.195-13.562Q504-318.125 504-337v-400q0-48-33.5-81T389-851q-48 0-81.5 33T274-737v442.655q0 76.317 54.376 128.331Q382.752-114 459.876-114 538-114 592-166.514t54-129.831V-739h63v442q0 101.891-72.91 173.445Q563.179-52 460.09-52Z"/></svg>
                </button>
                <textarea ref={input} placeholder={`Message @${props.to}`} autoComplete="none" rows={1}
                    onInput={adjustSize}
                    onKeyDown={(e) => {if (e.key == "Enter" && !e.shiftKey) {send();e.preventDefault()}}}
                    className="mt-[2px] sm:mt-1 px-2 w-full bg-transparent outline-none resize-none">
                </textarea>
                <button title="Send message" onClick={send} className="h-min opacity-25 hover:opacity-50 transition-opacity cursor-pointer">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 96 960 960"><path d="M97 849V303q0-25 21-38.5t45-4.5l644 272q29 12 29 44t-29 44L163 891q-24 10-45-3.5T97 849Zm83-57 516-216-516-219v146l253 73-253 71v145Zm0-216V357v435-216Z"/></svg>
                </button>
            </div>
        </div>
    );
}