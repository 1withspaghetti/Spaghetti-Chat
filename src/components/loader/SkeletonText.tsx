
export default function SkeletonText(props: {className?: string, width: number, faint?: boolean}) {
    return (
        <div className={`skeleton-text ${props.faint ? 'faint ' : ''}${props.className || ''}`} style={{maxWidth: `${props.width}px`}}>x</div>
    )
}