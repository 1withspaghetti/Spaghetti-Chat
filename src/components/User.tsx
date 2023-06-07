import SkeletonProfile from "./loader/SkeletonProfile";

export default function User(props: {id: number, username: string, avatar?: number, color?: number, meta: number, children?: any}) {
    return (
        <div className="flex items-center gap-2 py-1 px-2 w-full group" tabIndex={props.children ? 0 : undefined}>
            <SkeletonProfile/>
            <div className="text-lg font-bold whitespace-nowrap overflow-hidden text-ellipsis">{props.username}</div>
            {!!props.children && <div className="hidden group-hover:block group-focus:block group-focus-within:block flex-shrink-0 ml-auto">{props.children}</div>}
        </div>
    );
}