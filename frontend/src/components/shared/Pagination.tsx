type PaginationProps = {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
        <div className="flex items-center justify-center gap-1 mt-4">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
            </button>

            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors"
                    style={{
                        backgroundColor: p === page ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                        color: p === page ? 'var(--color-text-on-primary)' : 'var(--color-text-secondary)',
                        border: `1px solid ${p === page ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    }}
                >
                    {p}
                </button>
            ))}

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            </button>
        </div>
    )
}
export default Pagination
