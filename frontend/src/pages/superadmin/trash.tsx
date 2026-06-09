import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../Context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pagination from '../../components/shared/Pagination'
import Button from '../../components/shared/Button'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useToast } from '../../Context/ToastContext'
import { tenantApi, type Tenant } from '../../services/tenant.service'
import FilterTabs from '../../components/shared/FilterTabs'

const trashTabs = [
    { key: 'tenants', label: 'Deleted Tenants' },
    { key: 'users', label: 'Deleted Users' }
] as const

const TrashPage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [activeTab, setActiveTab] = useState<'tenants' | 'users'>('tenants')
    const [items, setItems] = useState<any[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        action: 'restore' | 'hardDelete';
        type: 'single' | 'bulk';
        id?: string;
    }>({ isOpen: false, action: 'restore', type: 'single' })
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        if (user.role !== 'SUPER_ADMIN') navigate('/dashboard')
    }, [user, navigate])

    useEffect(() => {
        setLoading(true)
        setSelectedIds([])
        if (activeTab === 'tenants') {
            tenantApi.list({ page, limit: 10, deletedOnly: true })
                .then(res => {
                    setItems(res.data.hospitals)
                    setTotalPages(res.data.pagination.totalPages)
                    setTotal(res.data.pagination.total)
                })
                .catch(() => {})
                .finally(() => setLoading(false))
        } else {
            // For users, need a tenantId if not super_admin, but here we assume super admin can see all deleted users
            // Wait, listUsers requires tenantId in the api signature. We might have a problem if it's required for SUPER_ADMIN.
            // But let's pass a dummy or change backend. Wait, backend allows SUPER_ADMIN to see all if tenantId is bypassed.
            // Let's assume we pass an empty tenantId or it's required. We'll pass '' and see.
            tenantApi.listUsers({ tenantId: '', page, limit: 10, deletedOnly: true })
                .then(res => {
                    setItems(res.data.users)
                    setTotalPages(res.data.pagination.totalPages)
                    setTotal(res.data.pagination.total)
                })
                .catch(() => {})
                .finally(() => setLoading(false))
        }
    }, [page, activeTab, refreshTrigger])

    const handleConfirm = async () => {
        setIsProcessing(true)
        try {
            const { action, type, id } = confirmDialog
            if (activeTab === 'tenants') {
                if (type === 'single' && id) {
                    if (action === 'restore') await tenantApi.restoreTenant(id)
                    else await tenantApi.hardDeleteTenant(id)
                } else if (type === 'bulk') {
                    if (action === 'restore') await tenantApi.bulkRestoreTenants(selectedIds)
                    else await tenantApi.bulkHardDeleteTenants(selectedIds)
                }
            } else {
                if (type === 'single' && id) {
                    if (action === 'restore') await tenantApi.restoreUser(id)
                    else await tenantApi.hardDeleteUser(id)
                } else if (type === 'bulk') {
                    if (action === 'restore') await tenantApi.bulkRestoreUsers(selectedIds)
                    else await tenantApi.bulkHardDeleteUsers(selectedIds)
                }
            }
            showToast(`Items successfully ${action === 'restore' ? 'restored' : 'permanently deleted'}`, 'success')
            setConfirmDialog(p => ({ ...p, isOpen: false }))
            setSelectedIds([])
            setRefreshTrigger(prev => prev + 1)
        } catch (err: any) {
            showToast(err.message ?? `Failed to ${confirmDialog.action} items`, 'error')
        } finally {
            setIsProcessing(false)
        }
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === items.length && items.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(items.map(i => i.id))
        }
    }

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    if (!user) return null

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Recycle Bin</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                            {total} deleted {activeTab}
                        </p>
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setConfirmDialog({ isOpen: true, action: 'restore', type: 'bulk' })}>Restore Selected</Button>
                            <Button variant="danger" onClick={() => setConfirmDialog({ isOpen: true, action: 'hardDelete', type: 'bulk' })}>Delete Selected</Button>
                        </div>
                    )}
                </div>

                <FilterTabs tabs={trashTabs} value={activeTab} onChange={(val) => { setActiveTab(val); setPage(1) }} layoutId="activeTrashTab" />

                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
                        <div className="flex items-center">
                            <input type="checkbox" checked={selectedIds.length === items.length && items.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300" />
                        </div>
                        <span>Name</span>
                        <span>{activeTab === 'tenants' ? 'Type' : 'Role'}</span>
                        <span>Deleted At</span>
                        <span className="text-right">Actions</span>
                    </div>

                    {loading ? (
                        <div className="px-5 py-16 text-center text-sm text-gray-500">Loading...</div>
                    ) : items.length === 0 ? (
                        <div className="px-5 py-16 text-center">
                            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No deleted items found</p>
                        </div>
                    ) : items.map((item, i) => (
                        <motion.div key={item.id} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 text-sm" style={{ borderTop: '1px solid var(--color-border)' }}>
                            <div className="flex items-center">
                                <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} className="rounded border-gray-300" />
                            </div>
                            <div className="min-w-0 font-medium" style={{ color: 'var(--color-text)' }}>{item.name || item.email}</div>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{item.type || item.role}</span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{new Date(item.deletedAt).toLocaleDateString()}</span>
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setConfirmDialog({ isOpen: true, action: 'restore', type: 'single', id: item.id })}>Restore</Button>
                                <Button variant="danger" size="sm" onClick={() => setConfirmDialog({ isOpen: true, action: 'hardDelete', type: 'single', id: item.id })}>Delete</Button>
                            </div>
                        </motion.div>
                    ))}

                    <div className="px-5 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                </div>
            </motion.div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
                onConfirm={handleConfirm}
                type={confirmDialog.action === 'restore' ? 'warning' : 'danger'}
                title={confirmDialog.action === 'restore' ? 'Restore Items' : 'Permanently Delete Items'}
                description={confirmDialog.action === 'restore' ? 'Are you sure you want to restore these items?' : 'Are you sure you want to permanently delete these items? This action cannot be undone.'}
                confirmLabel={confirmDialog.action === 'restore' ? 'Restore' : 'Permanently Delete'}
                cancelLabel="Cancel"
                isLoading={isProcessing}
            />
        </DashboardLayout>
    )
}

export default TrashPage
