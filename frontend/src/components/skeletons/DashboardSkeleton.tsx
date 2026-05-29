import PaginationSkeleton from '../shared/PaginationSkeleton'

const S = ({ className = '' }: { className?: string }) => (
    <div className={`skeleton-shimmer rounded-xl ${className}`} />
)

const DashboardSkeleton = () => (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Sidebar skeleton */}
        <div className="flex flex-col w-64 shrink-0 h-full" style={{ backgroundColor: 'var(--color-sidebar)', borderRight: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3 px-5 h-16 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <S className="h-8 w-8 rounded-lg" />
                <S className="h-4 w-28" />
            </div>
            <div className="flex-1 px-3 py-4 flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                        <S className="h-5 w-5 rounded-md shrink-0" />
                        <S className="h-3 w-24" />
                    </div>
                ))}
            </div>
            <div className="px-3 py-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-3 rounded-xl px-2 py-2" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                    <S className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <S className="h-3 w-24" />
                        <S className="h-2.5 w-32" />
                    </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5">
                    <S className="h-5 w-5 rounded-md shrink-0" />
                    <S className="h-3 w-14" />
                </div>
            </div>
        </div>

        {/* Main area skeleton */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {/* Topbar */}
            <div className="flex items-center justify-between px-4 h-16 shrink-0" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <S className="h-9 w-9 rounded-xl" />
                <S className="h-9 w-9 rounded-xl" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {/* Welcome banner */}
                <div className="rounded-2xl px-6 py-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <S className="h-3 w-24 mb-2" />
                    <S className="h-6 w-48 mb-2" />
                    <S className="h-3 w-72" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <S className="h-8 w-8 rounded-lg shrink-0" />
                                <S className="h-3 w-20" />
                            </div>
                            <S className="h-8 w-12" />
                        </div>
                    ))}
                </div>

                {/* Chart */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <S className="h-4 w-40 mb-4" />
                    <S className="h-[220px] w-full rounded-2xl" />
                </div>

                {/* Tenant list */}
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <S className="h-4 w-32" />
                    </div>
                    <div className="grid grid-cols-4 px-5 py-2" style={{ backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                        {Array.from({ length: 4 }).map((_, i) => <S key={i} className="h-3 w-16" />)}
                    </div>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-4 items-center px-5 py-4 gap-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-3">
                                <S className="h-8 w-8 rounded-lg shrink-0" />
                                <S className="h-3 w-28" />
                            </div>
                            <S className="h-3 w-16" />
                            <S className="h-5 w-16 rounded-full" />
                            <S className="h-3 w-20" />
                        </div>
                    ))}
                    <div className="px-5 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <PaginationSkeleton pages={3} />
                    </div>
                </div>
            </div>
        </div>
    </div>
)

export default DashboardSkeleton
