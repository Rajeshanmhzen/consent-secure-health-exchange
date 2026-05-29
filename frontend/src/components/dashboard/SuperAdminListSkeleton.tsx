import PaginationSkeleton from '../shared/PaginationSkeleton'

const SuperAdminListSkeleton = () => (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        {/* Header removed to match UI */}
        {/* Table header */}
        <div className="grid grid-cols-5 px-5 py-2" style={{ backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 w-16 rounded skeleton-shimmer" />
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 items-center px-5 py-4 gap-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg skeleton-shimmer shrink-0" />
                    <div className="h-3 w-28 rounded skeleton-shimmer" />
                </div>
                <div className="h-3 w-36 rounded skeleton-shimmer" />
                <div className="h-3 w-20 rounded skeleton-shimmer" />
                <div className="h-5 w-16 rounded-full skeleton-shimmer" />
                <div className="h-3 w-24 rounded skeleton-shimmer" />
            </div>
        ))}
        {/* Pagination */}
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <PaginationSkeleton pages={3} />
        </div>
    </div>
)

export default SuperAdminListSkeleton
