import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../Context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pagination from '../../components/shared/Pagination'
import TenantListSkeleton from '../../components/dashboard/TenantListSkeleton'
import Button from '../../components/shared/Button'
import AddTenantModal from '../../components/dashboard/AddTenantModal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useToast } from '../../Context/ToastContext'
import { tenantApi, type Tenant } from '../../services/tenant.service'

type TabProps = {
    value: 'all' | 'active' | 'inactive'
    onChange: (val: 'all' | 'active' | 'inactive') => void
}

const FilterTabs = ({ value, onChange }: TabProps) => {
    const tabs = [
        { key: 'all', label: 'All Tenants' },
        { key: 'active', label: 'Active Tenants' },
        { key: 'inactive', label: 'Inactive Tenants' }
    ] as const

    return (
        <div className="flex border-b w-full mt-2" style={{ borderColor: 'var(--color-border)' }}>
            {tabs.map(t => {
                const isActive = value === t.key
                return (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => onChange(t.key)}
                        className="relative py-3 px-5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none outline-none"
                        style={{
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        }}
                    >
                        {t.label}
                        {isActive && (
                            <motion.div
                                layoutId="activeTenantTabUnderline"
                                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}

const TenantsPage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [tenants, setTenants] = useState<Tenant[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

    // Modal state triggers
    const [showAddModal, setShowAddModal] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const { showToast } = useToast()

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        tenantId: string;
        tenantName: string;
    }>({ isOpen: false, tenantId: '', tenantName: '' })
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteConfirm = async () => {
        setIsDeleting(true)
        try {
            showToast(`Tenant "${confirmDialog.tenantName}" has been successfully deleted`, 'success')
            setConfirmDialog(p => ({ ...p, isOpen: false }))
            setRefreshTrigger(prev => prev + 1)
        } catch (err: any) {
            showToast(err.message ?? 'Failed to delete tenant', 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        if (user.role !== 'SUPER_ADMIN') navigate('/dashboard')
    }, [user, navigate])

    useEffect(() => {
        setLoading(true)
        tenantApi.list({
            page,
            limit: 10,
            search: search || undefined,
            isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        })
            .then(res => {
                setTenants(res.data.hospitals)
                setTotalPages(res.data.pagination.totalPages)
                setTotal(res.data.pagination.total)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [page, search, statusFilter, refreshTrigger])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        setSearch(searchInput)
    }

    const clearSearch = () => {
        setSearchInput('')
        setSearch('')
        setPage(1)
    }

    const handleStatusChange = (val: 'all' | 'active' | 'inactive') => {
        setStatusFilter(val)
        setPage(1)
    }

    if (!user) return null

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col gap-6"
            >
                {/* Page header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Tenants List</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                            {total} tenant{total !== 1 ? 's' : ''} registered
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => setShowAddModal(true)}
                        leftIcon={<span className="text-lg font-bold leading-none">+</span>}
                    >
                        Tenant
                    </Button>
                </div>

                {/* Search bar row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" style={{ color: 'var(--color-text-secondary)' }}>
                            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none"
                            style={{ color: 'var(--color-text)' }}
                        />
                        {searchInput && (
                            <button type="button" onClick={clearSearch} style={{ color: 'var(--color-text-secondary)' }}>
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        )}
                    </form>
                </div>

                {/* Filter Tabs row */}
                <FilterTabs value={statusFilter} onChange={handleStatusChange} />

                {/* Table */}
                {loading ? <TenantListSkeleton /> : (
                    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div className="grid grid-cols-5 px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                            <span>Name</span>
                            <span>Type</span>
                            <span>Status</span>
                            <span>Created</span>
                            <span className="text-right">Actions</span>
                        </div>

                        {tenants.length === 0 ? (
                            <div className="px-5 py-16 text-center">
                                <svg viewBox="0 0 24 24" className="h-10 w-10 mx-auto mb-3" fill="currentColor" style={{ color: 'var(--color-text-tertiary)' }}>
                                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                                </svg>
                                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No tenants found</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Try adjusting your search or filters</p>
                            </div>
                        ) : tenants.map((t, i) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.25 }}
                                className="grid grid-cols-5 items-center px-5 py-3.5 text-sm cursor-pointer transition-colors"
                                style={{ borderTop: '1px solid var(--color-border)' }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-table-hover)')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                                        {t.name[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium truncate" style={{ color: 'var(--color-text)' }}>{t.name}</p>
                                        {t.hospital?.email && (
                                            <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{t.hospital.email}</p>
                                        )}
                                    </div>
                                </div>
                                <span style={{ color: 'var(--color-text-secondary)' }}>{t.type}</span>
                                <span>
                                    <span
                                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                        style={{
                                            backgroundColor: t.isActive ? 'var(--color-success-light)' : 'var(--color-error-light)',
                                            color: t.isActive ? 'var(--color-success)' : 'var(--color-error)',
                                        }}
                                    >
                                        {t.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>
                                    {new Date(t.createdAt).toLocaleDateString()}
                                </span>
                                <div className="flex items-center justify-end gap-2 pr-1">
                                    {/* Info Tooltip Button */}
                                    <div className="relative group">
                                        <button
                                            type="button"
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                // Future view detail logic
                                            }}
                                            title="View Details"
                                        >
                                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="16" x2="12" y2="12" />
                                                <line x1="12" y1="8" x2="12.01" y2="8" />
                                            </svg>
                                        </button>
                                        <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/95 text-[10px] text-white px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-50 shadow-md">
                                            View Details
                                        </span>
                                    </div>

                                    {/* Edit Tooltip Button */}
                                    <div className="relative group">
                                        <button
                                            type="button"
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                // Future edit logic
                                            }}
                                            title="Edit Tenant"
                                        >
                                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 20h9" />
                                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                            </svg>
                                        </button>
                                        <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/95 text-[10px] text-white px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-50 shadow-md">
                                            Edit Tenant
                                        </span>
                                    </div>

                                    {/* Delete Tooltip Button */}
                                    <div className="relative group">
                                        <button
                                            type="button"
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setConfirmDialog({
                                                    isOpen: true,
                                                    tenantId: t.id,
                                                    tenantName: t.name
                                                })
                                            }}
                                            title="Delete Tenant"
                                        >
                                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18" />
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                            </svg>
                                        </button>
                                        <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/95 text-[10px] text-white px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-50 shadow-md">
                                            Delete Tenant
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Modular Add Tenant Modal */}
            <AddTenantModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setShowAddModal(false)
                    setRefreshTrigger(prev => prev + 1)
                }}
            />

            {/* Premium Confirm Dialog Modal */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
                onConfirm={handleDeleteConfirm}
                type="danger"
                title="Delete Tenant Account"
                description={`Are you sure you want to delete the tenant "${confirmDialog.tenantName}"? This action is permanent and all associated hospital records and administrative accounts will be permanently deleted.`}
                confirmLabel="Delete Tenant"
                cancelLabel="Cancel"
                isLoading={isDeleting}
            />
        </DashboardLayout>
    )
}

export default TenantsPage
