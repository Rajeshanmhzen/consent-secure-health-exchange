export type PaginationProps = {
    page: number
    totalPages: number
    totalItems?: number
    itemsPerPage?: number
    onPageChange: (page: number) => void
}

const Pagination = ({ page, totalPages, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
    // Determine the array of pages to show
    const getVisiblePages = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }
        if (page <= 3) {
            return [1, 2, 3, '...', totalPages]
        }
        if (page >= totalPages - 2) {
            return [1, '...', totalPages - 2, totalPages - 1, totalPages]
        }
        return [1, '...', page - 1, page, page + 1, '...', totalPages]
    }

    const pages = getVisiblePages()

    // Compute the compact "showing X of N" text dynamically
    const showingText = () => {
        if (totalItems !== undefined && itemsPerPage !== undefined) {
            const start = Math.min((page - 1) * itemsPerPage + 1, totalItems)
            return `showing ${start} of ${totalItems} · page ${page} of ${totalPages}`
        }
        if (totalItems !== undefined) {
            return `showing ${totalItems} items · page ${page} of ${totalPages}`
        }
        return `page ${page} of ${totalPages}`
    }

    return (
        <div className="flex w-full items-center justify-between py-2">
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {showingText()}
            </div>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
                >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                {pages.map((p, i) => (
                    p === '...' ? (
                        <div key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            ...
                        </div>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: p === page ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                                color: p === page ? '#ffffff' : 'var(--color-text-secondary)',
                                border: `1px solid ${p === page ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            }}
                        >
                            {p}
                        </button>
                    )
                ))}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
                >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
export default Pagination
