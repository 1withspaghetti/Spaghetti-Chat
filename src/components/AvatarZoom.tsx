import { use, useEffect, useRef, useState } from "react";

const avatarWidth = 128;
const avatarHeight = 128;

export default function AvatarZoom(props: {src: File|undefined, onSubmit: ()=>void, onCancel: (err: string|undefined)=>void}) {

    const [image, setImage] = useState<HTMLImageElement>();
    const [update, setUpdate] = useState<number>(0);

    const canvas = useRef<HTMLCanvasElement>(null);
    const container = useRef<HTMLDivElement>(null);

    const dragging = useRef(false);
    const zoom = useRef(1);
    const lastX = useRef(0);
    const lastY = useRef(0);
    const x = useRef(0);
    const y = useRef(0);

    useEffect(()=>{
        if (!props.src) return;
        const img = new Image();
        img.onload = ()=>{
            if (img.width < avatarWidth || img.height < avatarHeight) return props.onCancel("Avatar must be at least 128x128 pixels");
            if (!canvas.current) return;
            //setZoom(Math.max(1, Math.min(avatarWidth / img.width, avatarHeight / img.height)));
            if (img.width > img.height) {
                zoom.current = avatarWidth / img.width;
            } else {
                zoom.current = avatarHeight / img.height;
            }
            x.current = (0.5*canvas.current.width - 0.5*img.width);
            y.current = (0.5*canvas.current.height - 0.5*img.height);
            setImage(img);
        }
        img.src = URL.createObjectURL(props.src);
    }, [props.src]);

    useEffect(()=>{
        if (!image || !canvas.current) return;
        const ctx = canvas.current.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
        // var realX = x.current - (image.width * zoom - image.width) / 2;
        // var realY = y.current - (image.height * zoom - image.height) / 2;
        x.current = Math.max(Math.min(x.current, canvas.current.width/2 - avatarWidth/2), canvas.current.width/2 + avatarWidth/2 - image.width * zoom.current);
        y.current = Math.max(Math.min(y.current, canvas.current.height/2 - avatarHeight/2), canvas.current.height/2 + avatarHeight/2 - image.height * zoom.current);
        console.log(`x: ${x.current}, y: ${y.current}, zoom: ${zoom}`);
        ctx.drawImage(image, x.current, y.current, image.width * zoom.current, image.height * zoom.current);
    }, [image, zoom, update, x.current, y.current]);

    const onMouseDown = (e: MouseEvent)=>{
        e.preventDefault();
        dragging.current = true;
        lastX.current = e.clientX;
        lastY.current = e.clientY;
    }

    const onTouchStart = (e: TouchEvent)=>{
        e.preventDefault();
        e.stopPropagation();
        dragging.current = true;
        lastX.current = e.touches[0].clientX;
        lastY.current = e.touches[0].clientY;
    }

    const onMouseUp = (e: MouseEvent|TouchEvent)=>{
        e.preventDefault();
        dragging.current = false;
    }

    const onMouseMove = (e: MouseEvent)=>{
        if (!dragging.current) return;
        e.preventDefault();
        x.current += e.clientX - lastX.current;
        y.current += e.clientY - lastY.current;
        setUpdate(Date.now());
        lastX.current = e.clientX;
        lastY.current = e.clientY;
    }

    const onTouchMove = (e: TouchEvent)=>{
        if (!dragging.current) return;
        e.preventDefault();
        x.current += e.touches[0].clientX - lastX.current;
        y.current += e.touches[0].clientY - lastY.current;
        setUpdate(Date.now());
        lastX.current = e.touches[0].clientX;
        lastY.current = e.touches[0].clientY;
    }

    useEffect(()=>{
        container.current?.addEventListener("mousedown", onMouseDown, {passive: false});
        container.current?.addEventListener("touchstart", onTouchStart, {passive: false});
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchend", onMouseUp);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchmove", onTouchMove);
        return ()=>{
            container.current?.removeEventListener("mousedown", onMouseDown);
            container.current?.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchend", onMouseUp);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("touchmove", onTouchMove);
        }
    }, []);

    return (
        <>
            <div ref={container} className="relative w-full h-96 overflow-hidden bg-black">
                <canvas ref={canvas} width={512} height={384} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150"></canvas>
                <div className="absolute top-0 right-0 left-0 bottom-0 flex justify-center items-center">
                    <div className="w-32 h-32 rounded-full bg-black bg-opacity-0 outline outline-slate-200 outline-4 scale-150" style={{boxShadow: "0px 0px 0px 9999px rgba(0,0,0,0.5)"}}></div>
                </div>
            </div>

        </>
    )
}