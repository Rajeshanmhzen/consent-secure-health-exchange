import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Table from '../../components/shared/Table'
import { useAuth } from '../../Context/AuthContext'
import { dashboardApi, type ApiPerformanceData, type ApiPerformanceStatus } from '../../services/dashboard.service'

const statusStyles: Record<ApiPerformanceStatus, { color: string; background: string }> = {
    LOW: { color: 'var(--color-success)', background: 'var(--color-success-light)' },
    MEDIUM: { color: 'var(--color-warning)', background: 'var(--color-warning-light)' },
    HIGH: { color: 'var(--color-accent)', background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' },
    CRITICAL: { color: 'var(--color-error)', background: 'var(--color-error-light)' },
}

const ApiPerformancePage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [performance, setPerformance] = useState<ApiPerformanceData | null>(null)
    const [page, setPage] = useState(1)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        if (user.role !== 'SUPER_ADMIN') navigate('/dashboard')
    }, [user, navigate])

    useEffect(() => {
        if (!user || user.role !== 'SUPER_ADMIN') return

        let isMounted = true
        const fetchPerformance = () => {
            dashboardApi.apiPerformance({ page, limit: 8 })
                .then(res => {
                    if (isMounted) setPerformance(res.data)
                })
                .catch(() => {})
        }

        fetchPerformance()
        const interval = window.setInterval(fetchPerformance, 15_000)
        return () => {
            isMounted = false
            window.clearInterval(interval)
        }
    }, [user, page])

    if (!user || user.role !== 'SUPER_ADMIN') return null

    const status = performance?.overall.status

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col gap-6"
            >
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>API Performance</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Monitor API latency and server errors over the last {performance?.windowMinutes ?? 5} minutes.
                    </p>
                </div>

                {performance ? (
                    <>
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {[
                                ['Requests', performance.overall.requests.toLocaleString()],
                                ['Errors', performance.overall.errors.toLocaleString()],
                                ['Average latency', `${Math.round(performance.overall.averageLatencyMs)} ms`],
                                ['Error rate', `${(performance.overall.errorRate * 100).toFixed(1)}%`],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
                                    <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Overall API health</h2>
                                    <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>Status is calculated from latency and 5xx response rate.</p>
                                </div>
                                {status && (
                                    <span className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold" style={{ color: statusStyles[status].color, backgroundColor: statusStyles[status].background }}>
                                        {status}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-3 px-1 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Endpoint performance</h2>
                            <Table
                                columns={[
                                    { label: 'Endpoint' },
                                    { label: 'Requests' },
                                    { label: 'Average latency' },
                                    { label: 'Errors' },
                                    { label: 'Status' },
                                ]}
                                data={performance.endpoints}
                                emptyState={
                                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Collecting API performance data...</p>
                                }
                                pagination={{
                                    page: performance.pagination.page,
                                    totalPages: performance.pagination.totalPages,
                                    totalItems: performance.pagination.total,
                                    itemsPerPage: performance.pagination.limit,
                                    onPageChange: setPage,
                                }}
                                renderRow={endpoint => (
                                    <tr key={endpoint.route} style={{ borderTop: '1px solid var(--color-border)' }}>
                                        <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>{endpoint.route}</td>
                                        <td className="px-5 py-4 text-sm" style={{ color: 'var(--color-text)' }}>{endpoint.requests.toLocaleString()}</td>
                                        <td className="px-5 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{Math.round(endpoint.averageLatencyMs)} ms</td>
                                        <td className="px-5 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{(endpoint.errorRate * 100).toFixed(1)}%</td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: statusStyles[endpoint.status].color, backgroundColor: statusStyles[endpoint.status].background }}>
                                                {endpoint.status}
                                            </span>
                                        </td>
                                    </tr>
                                )}
                            />
                        </div>
                    </>
                ) : (
                    <div className="rounded-2xl p-10 text-center text-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        Loading API performance data...
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    )
}

export default ApiPerformancePage