type AvatarProps = {
    name?: string
    image?: string
    size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
    sm: { box: 'h-7 w-7', text: 'text-xs' },
    md: { box: 'h-9 w-9', text: 'text-sm' },
    lg: { box: 'h-11 w-11', text: 'text-base' },
}

const getInitials = (name?: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const Avatar = ({ name, image, size = 'md' }: AvatarProps) => {
    const { box, text } = sizeMap[size]

    if (image) {
        return (
            <img
                src={image}
                alt={name ?? 'avatar'}
                className={`${box} rounded-full object-cover shrink-0`}
            />
        )
    }

    return (
        <div
            className={`${box} ${text} rounded-full shrink-0 flex items-center justify-center font-bold select-none`}
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
        >
            {getInitials(name)}
        </div>
    )
}

export default Avatar
