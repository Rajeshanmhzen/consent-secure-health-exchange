import React from 'react'
import Pagination, { type PaginationProps } from './Pagination'

export type TableColumn = {
    label: React.ReactNode
    key?: string
    className?: string
}

type TableProps<T> = {
    columns: TableColumn[]
    data: T[]
    renderRow: (item: T, index: number) => React.ReactNode
    emptyState?: React.ReactNode
    footer?: React.ReactNode
    pagination?: PaginationProps
    loading?: boolean
    loadingRows?: number
}

export const Table = <T,>({ columns, data, renderRow, emptyState, footer, pagination, loading = false, loadingRows = 5 }: TableProps<T>) => {
    const resolvedLoadingRows = Math.max(1, loadingRows)
    const shouldShowPagination = Boolean(pagination)

    return (
        <div className="rounded-2xl overflow-hidden shadow-sm flex flex-col" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left" style={{ borderCollapse: 'collapse', backgroundColor: 'var(--color-surface)' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                            {columns.map((col, idx) => (
                                <th key={col.key || idx} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider ${col.className || ''}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody style={{ backgroundColor: 'var(--color-surface)' }}>
                        {loading ? Array.from({ length: resolvedLoadingRows }).map((_, rowIndex) => (
                            <tr key={`loading-${rowIndex}`} style={{ borderTop: '1px solid var(--color-border)' }}>
                                {columns.map((col, colIndex) => (
                                    <td key={`loading-${rowIndex}-${col.key || colIndex}`} className={`px-5 py-4 ${col.className || ''}`}>
                                        <div
                                            className="h-4 rounded animate-pulse"
                                            style={{
                                                width: colIndex === 0 ? '60%' : colIndex === columns.length - 1 ? '45%' : '80%',
                                                backgroundColor: 'rgba(148, 163, 184, 0.16)',
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        )) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-5 py-16 text-center">
                                    {emptyState || (
                                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                            No records found.
                                        </p>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => renderRow(item, index))
                        )}
                    </tbody>
                </table>
            </div>
            
            {(footer || shouldShowPagination || loading) && (
                <div className="border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                    {loading ? (
                        <div className="flex min-h-14 items-center justify-between gap-4 px-5 py-3">
                            <div className="h-4 w-40 max-w-full rounded animate-pulse" style={{ backgroundColor: 'rgba(148, 163, 184, 0.16)' }} />
                            <div className="flex items-center gap-1.5">
                                <div className="h-8 w-8 rounded-lg animate-pulse" style={{ backgroundColor: 'rgba(148, 163, 184, 0.16)' }} />
                                <div className="h-8 w-8 rounded-lg animate-pulse" style={{ backgroundColor: 'rgba(148, 163, 184, 0.16)' }} />
                                <div className="h-8 w-8 rounded-lg animate-pulse" style={{ backgroundColor: 'rgba(148, 163, 184, 0.16)' }} />
                            </div>
                        </div>
                    ) : (
                        <div className="px-5 py-3">
                            {footer}
                            {pagination && (
                                <Pagination {...pagination} />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Table
