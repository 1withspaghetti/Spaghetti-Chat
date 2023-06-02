import { useRef, useState } from "react";

export default function MessageInput() {

    const input = useRef<HTMLTextAreaElement>(null);

    function adjustSize() {
        if (!input.current) return;
        input.current.style.height = "0px";
        input.current.style.height = Math.min(input.current.scrollHeight, 256) + "px";
    }

    return (
        <div className="flex m-4 mt-0">
            <div className="flex w-full px-2 py-2 gradient bg-opacity-100 rounded-lg shadow-xl transition-opacity duration-300">
                <div title="Send message" tabIndex={0} className="opacity-25 hover:opacity-50 transition-opacity cursor-pointer">
                    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 96 960 960"><path d="M97 849V303q0-25 21-38.5t45-4.5l644 272q29 12 29 44t-29 44L163 891q-24 10-45-3.5T97 849Zm83-57 516-216-516-219v146l253 73-253 71v145Zm0-216V357v435-216Z"/></svg>
                </div>
                <textarea ref={input} placeholder="Message @1withspaghetti" autoComplete="none" rows={1}
                    onInput={adjustSize}
                    className="mt-1 px-2 w-full bg-transparent outline-none resize-none">
                </textarea>
                <div title="Upload file" tabIndex={0} className="opacity-25 hover:opacity-50 transition-opacity cursor-pointer">
                    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 96 960 960"><path d="M452 854h60V653l82 82 42-42-156-152-154 154 42 42 84-84v201ZM220 976q-24 0-42-18t-18-42V236q0-24 18-42t42-18h361l219 219v521q0 24-18 42t-42 18H220Zm331-554h189L551 236v186Z"/></svg>
                </div>
            </div>
        </div>
    );
}