const PaginationSkeleton = ({ pages = 3 }: { pages?: number }) => (
    <div className="flex items-center justify-center gap-1 mt-4">
        {/* Prev button */}
        <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm skeleton-shimmer"
            style={{
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                opacity: 0.6
            }}
        >
            <svg viewBox="0 0 24 24" className="h-4 w-4" style={{ color: 'var(--color-text-secondary)', opacity: 0.3 }} fill="currentColor">
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
        </div>

        {/* Page buttons */}
        {Array.from({ length: pages }).map((_, i) => {
            const isFirst = i === 0;
            return (
                <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium skeleton-shimmer"
                    style={{
                        backgroundColor: isFirst ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                        border: `1px solid ${isFirst ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        opacity: isFirst ? 0.7 : 0.6
                    }}
                >
                    <span style={{ color: isFirst ? 'var(--color-text-on-primary)' : 'var(--color-text-secondary)', opacity: 0.3 }}>
                        {i + 1}
                    </span>
                </div>
            )
        })}

        {/* Next button */}
        <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm skeleton-shimmer"
            style={{
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                opacity: 0.6
            }}
        >
            <svg viewBox="0 0 24 24" className="h-4 w-4" style={{ color: 'var(--color-text-secondary)', opacity: 0.3 }} fill="currentColor">
                <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
        </div>
    </div>
)

export default PaginationSkeleton
