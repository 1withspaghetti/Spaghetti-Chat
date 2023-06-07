
export default function SkeletonText(props: {className?: string, width?: number, faint?: boolean}) {
    return (
        <div className={`skeleton-pfp ${props.faint ? 'faint' : ''} ${props.className || ''}`} style={props.width ? {width: `${props.width}px`, height: `${props.width}px`} : {}}></div>
    )
}