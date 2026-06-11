const resolveImageUrl = (path?: string | null) => {
    if (!path) return undefined
    if (path.startsWith('http')) return path
    const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1').replace(/\/api\/v\d+$/, '')
    return `${base}${path}`
}

type AvatarProps = {
    name?: string
    image?: string | null
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
    sm: { box: 'h-7 w-7', text: 'text-xs' },
    md: { box: 'h-9 w-9', text: 'text-sm' },
    lg: { box: 'h-11 w-11', text: 'text-base' },
    xl: { box: 'h-20 w-20', text: 'text-2xl' },
}

const getInitials = (name?: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const Avatar = ({ name, image, size = 'md' }: AvatarProps) => {
    const { box, text } = sizeMap[size]
    const resolvedImage = resolveImageUrl(image)

    if (resolvedImage) {
        return (
            <img
                src={resolvedImage}
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
export { resolveImageUrl }
