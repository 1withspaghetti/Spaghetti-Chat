import { NotificationContext } from "@/context/NotificationContext";
import { useContext, useEffect, useRef, useState } from "react";

const avatarWidth = 192;
const avatarHeight = 192;

export default function AvatarZoom(props: {src: File|undefined, onSubmit: (img: Blob)=>void, onCancel: (err?: string)=>void}) {

    const notify = useContext(NotificationContext);

    const [image, setImage] = useState<HTMLImageElement>();
    const [update, setUpdate] = useState<number>(0);
    const [minZoom, setMinZoom] = useState<number>(1);
    const [maxZoom, setMaxZoom] = useState<number>(1);

    const [isLowQuality, setIsLowQuality] = useState<boolean>(false);

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
            if (img.width < 128 || img.height < 128) return props.onCancel("Avatar must be at least 128x128 pixels");
            if (!canvas.current) return;
            if (img.width < img.height) {
                zoom.current = avatarWidth / img.width;
                setMinZoom(avatarWidth / img.width);
                setMaxZoom(Math.min(img.width / avatarWidth, 7.5 * avatarWidth / img.height));
            } else {
                zoom.current = avatarHeight / img.height;
                setMinZoom(avatarHeight / img.height);
                setMaxZoom(Math.min(img.height / avatarHeight, 7.5 * avatarHeight / img.width));
            }
            x.current = (0.5*canvas.current.width - 0.5*img.width);
            y.current = (0.5*canvas.current.height - 0.5*img.height);
            setImage(img);
        }
        img.src = URL.createObjectURL(props.src);
    }, [props.src]);

    useEffect(()=>{
        setIsLowQuality(maxZoom - minZoom < 0.1);
    }, [minZoom, maxZoom]);

    useEffect(()=>{
        if (!image || !canvas.current) return;
        const ctx = canvas.current.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
        x.current = Math.max(Math.min(x.current, canvas.current.width/2 - avatarWidth/2), canvas.current.width/2 + avatarWidth/2 - image.width * zoom.current);
        y.current = Math.max(Math.min(y.current, canvas.current.height/2 - avatarHeight/2), canvas.current.height/2 + avatarHeight/2 - image.height * zoom.current);
        ctx.drawImage(image, x.current, y.current, image.width * zoom.current, image.height * zoom.current);
    }, [image, update]);

    function onSubmit() {
        if (!image || !canvas.current) return;
        
        const toExport = document.createElement("canvas");
        toExport.width = avatarWidth;
        toExport.height = avatarHeight;
        const ctx = toExport.getContext("2d");
        if (!ctx) return notify("Error", "Could not get render context, please update your browser", true);
        ctx.drawImage(canvas.current, canvas.current.width/2 - avatarWidth/2, canvas.current.height/2 - avatarHeight/2, avatarWidth, avatarHeight, 0, 0, avatarWidth, avatarHeight);
        toExport.toBlob((blob)=>{
            if (!blob) return notify("Error", "Failed to export avatar", true);;
            props.onSubmit(blob);
        });
    }

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

    function onZoom(e: React.ChangeEvent<HTMLInputElement>) {
        if (!image || !canvas.current) return;
        let before = zoom.current;
        zoom.current = parseFloat(e.target.value);
        x.current -= (image.width * (zoom.current - before)) * (canvas.current.width/2 - x.current) / (image.width * before);
        y.current -= (image.height * (zoom.current - before)) * (canvas.current.height/2 - y.current) / (image.height * before);

        setUpdate(Date.now());
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
                <canvas ref={canvas} width={512} height={384} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></canvas>
                <div className="absolute top-0 right-0 left-0 bottom-0 flex justify-center items-center">
                    <div className="avatar-outline" style={{width: avatarWidth, height: avatarHeight}}></div>
                </div>
            </div>
            <input type="range" min={minZoom} max={maxZoom} step="0.01" value={zoom.current} onChange={onZoom} title="Adjust Zoom" className="zoom-slider my-4 gradient bg-opacity-100 rounded-full" />
            {isLowQuality && <p className="mb-2 text-sm text-center text-gray-400">This image is low quality, the ability to zoom has been limited to prevent blurry images.</p>}
            <div className="flex gap-2 mt-2">
                <button onClick={()=>props.onCancel()} onTouchStart={()=>props.onCancel()} className="w-min rounded-lg shadow font-semibold mx-1 px-2 py-1 transition-all text-navy-50 bg-slate-400 dark:bg-slate-500 hover:shadow-lg hover:scale-105">Cancel</button>
                <button onClick={onSubmit} onTouchStart={onSubmit} className="w-min rounded-lg shadow font-semibold mx-1 px-4 py-1 transition-all text-navy-50 bg-blue-500 dark:bg-blue-700 hover:shadow-lg hover:scale-105">Save</button>
            </div>
        </>
    )
}