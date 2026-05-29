import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../Context/AuthContext'
import { useToast } from '../../Context/ToastContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pagination from '../../components/shared/Pagination'
import FilterTabs from '../../components/shared/FilterTabs'
import { inquiryApi, type Inquiry, type InquiryStatus } from '../../services/inquiry.service'
import { createRealtimeConnection } from '../../services/realtime.service'

const inquiryTabs = [
    { key: 'ALL', label: 'All Statuses' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' }
] as const

const statusStyles: Record<InquiryStatus, { label: string; bg: string; color: string }> = {
    PENDING: { label: 'Pending', bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706' },
    IN_PROGRESS: { label: 'In Progress', bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' },
    RESOLVED: { label: 'Resolved', bg: 'rgba(16, 185, 129, 0.12)', color: '#059669' },
}

const InquiriesPage = () => {
    const { user } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [inquiries, setInquiries] = useState<Inquiry[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<InquiryStatus | 'ALL'>('ALL')
    const [counts, setCounts] = useState({ pending: 0, inProgress: 0, resolved: 0 })

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        if (user.role !== 'SUPER_ADMIN') navigate('/dashboard')
    }, [user, navigate])

    const fetchInquiries = useCallback((showLoader = false) => {
        if (!user || user.role !== 'SUPER_ADMIN') return
        if (showLoader) setLoading(true)

        inquiryApi.list({
            page,
            limit: 10,
            search: search || undefined,
            status: status === 'ALL' ? undefined : status,
        })
            .then(res => {
                setInquiries(res.data.inquiries)
                setTotalPages(res.data.pagination.totalPages)
                setTotal(res.data.pagination.total)
            })
            .catch(error => showToast(error instanceof Error ? error.message : 'Unable to load inquiries', 'error'))
            .finally(() => {
                if (showLoader) setLoading(false)
            })

        inquiryApi.stats({ search: search || undefined })
            .then(res => setCounts({
                pending: res.data.pending,
                inProgress: res.data.inProgress,
                resolved: res.data.resolved,
            }))
            .catch(() => {})
    }, [page, search, status, showToast, user])

    useEffect(() => {
        fetchInquiries(true)
    }, [fetchInquiries])

    useEffect(() => {
        if (!user || user.role !== 'SUPER_ADMIN') return
        const handleRefresh = () => fetchInquiries(false)
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') fetchInquiries(false)
        }
        const closeRealtime = createRealtimeConnection((event) => {
            if (event.type === 'INQUIRY_CHANGED') fetchInquiries(false)
        })
        window.addEventListener('focus', handleRefresh)
        document.addEventListener('visibilitychange', handleVisibility)
        return () => {
            closeRealtime()
            window.removeEventListener('focus', handleRefresh)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [fetchInquiries, user])

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault()
        setPage(1)
        setSearch(searchInput.trim())
    }

    const handleStatusUpdate = async (id: string, nextStatus: InquiryStatus) => {
        try {
            const res = await inquiryApi.updateStatus(id, nextStatus)
            setInquiries(prev => prev.map(item => item.id === id ? res.data : item))
            fetchInquiries(false)
            showToast('Inquiry status updated', 'success')
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Unable to update inquiry', 'error')
        }
    }

    if (!user) return null

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col gap-6">
                <div>
                    <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Inquiries</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {total} contact request{total !== 1 ? 's' : ''} from hospitals and partners
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        { label: 'Pending', value: counts.pending, color: '#d97706' },
                        { label: 'In Progress', value: counts.inProgress, color: '#2563eb' },
                        { label: 'Resolved', value: counts.resolved, color: '#059669' },
                    ].map(card => (
                        <div key={card.label} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>{card.label}</p>
                            <p className="mt-2 text-2xl font-black" style={{ color: card.color }}>{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search name, email, organization..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--color-text)' }} />
                        <button type="submit" className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>Search</button>
                    </form>
                </div>

                <FilterTabs
                    tabs={inquiryTabs}
                    value={status}
                    onChange={(val) => { setStatus(val as InquiryStatus | 'ALL'); setPage(1) }}
                    layoutId="activeInquiryTabUnderline"
                />

                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="grid grid-cols-[1.1fr_1fr_1fr_1.4fr_0.8fr] gap-3 px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                        <span>Contact</span><span>Organization</span><span>Type</span><span>Message</span><span>Status</span>
                    </div>
                    {loading ? (
                        <div className="px-5 py-16 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading inquiries...</div>
                    ) : inquiries.length === 0 ? (
                        <div className="px-5 py-16 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>No inquiries found</div>
                    ) : inquiries.map((inquiry, index) => (
                        <motion.div key={inquiry.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="grid grid-cols-[1.1fr_1fr_1fr_1.4fr_0.8fr] gap-3 px-5 py-4 text-sm" style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <div className="min-w-0">
                                <p className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>{inquiry.firstName} {inquiry.lastName}</p>
                                <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{inquiry.workEmail}</p>
                                {inquiry.phoneNumber && <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{inquiry.phoneNumber}</p>}
                            </div>
                            <span className="truncate" style={{ color: 'var(--color-text-secondary)' }}>{inquiry.organization || '—'}</span>
                            <span className="truncate" style={{ color: 'var(--color-text-secondary)' }}>{inquiry.inquiryType}</span>
                            <span className="line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{inquiry.message}</span>
                            <div className="flex flex-col gap-2">
                                <span className="w-fit rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: statusStyles[inquiry.status].bg, color: statusStyles[inquiry.status].color }}>{statusStyles[inquiry.status].label}</span>
                                <select value={inquiry.status} onChange={e => handleStatusUpdate(inquiry.id, e.target.value as InquiryStatus)} className="rounded-lg px-2 py-1 text-xs outline-none" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                </select>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </motion.div>
        </DashboardLayout>
    )
}

export default InquiriesPage
