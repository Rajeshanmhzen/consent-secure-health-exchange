import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../Context/AuthContext'
import { useToast } from '../../Context/ToastContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pagination from '../../components/shared/Pagination'
import Button from '../../components/shared/Button'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import SuperAdminListSkeleton from '../../components/dashboard/SuperAdminListSkeleton'
import { superAdminApi, type SuperAdmin } from '../../services/superadmin.service'
import FilterTabs from '../../components/shared/FilterTabs'

const superAdminTabs = [
    { key: 'all', label: 'All Admins' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' }
] as const

const EMPTY_FORM = { fullName: '', email: '', password: '', phone: '', isActive: true }

const SuperAdminsPage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Modal state
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | null>(null)
    const [selectedAdmin, setSelectedAdmin] = useState<SuperAdmin | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [formLoading, setFormLoading] = useState(false)

    // Delete dialog
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' })
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        if (user.role !== 'SUPER_ADMIN') navigate('/dashboard')
    }, [user, navigate])

    useEffect(() => {
        setLoading(true)
        superAdminApi.list({ page, limit: 10, search: search || undefined })
            .then(res => {
                setSuperAdmins(res.data.superAdmins)
                setTotalPages(res.data.pagination.totalPages)
                setTotal(res.data.pagination.total)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [page, search, refreshTrigger])

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); setSearch(searchInput) }
    const clearSearch = () => { setSearchInput(''); setSearch(''); setPage(1) }

    const filteredAdmins = superAdmins.filter(a => {
        if (statusFilter === 'all') return true
        return statusFilter === 'active' ? a.user.isActive : !a.user.isActive
    })

    const openAdd = () => { setForm(EMPTY_FORM); setSelectedAdmin(null); setModalMode('add') }
    const openEdit = (a: SuperAdmin) => {
        setSelectedAdmin(a)
        setForm({ fullName: a.fullName, email: a.user.email, password: '', phone: a.user.phone || '', isActive: a.user.isActive })
        setModalMode('edit')
    }
    const openView = (a: SuperAdmin) => { setSelectedAdmin(a); setModalMode('view') }
    const closeModal = () => { setModalMode(null); setSelectedAdmin(null) }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)
        try {
            if (modalMode === 'add') {
                await superAdminApi.add({ fullName: form.fullName, email: form.email, password: form.password, phone: form.phone || undefined })
                showToast('Super admin created successfully', 'success')
            } else if (modalMode === 'edit' && selectedAdmin) {
                await superAdminApi.edit(selectedAdmin.id, { fullName: form.fullName, email: form.email, password: form.password || undefined, phone: form.phone || undefined, isActive: form.isActive })
                showToast('Super admin updated successfully', 'success')
            }
            closeModal()
            setRefreshTrigger(p => p + 1)
        } catch (err: any) {
            showToast(err.message ?? 'An error occurred', 'error')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await superAdminApi.delete(deleteDialog.id)
            showToast(`"${deleteDialog.name}" deleted successfully`, 'success')
            setDeleteDialog({ isOpen: false, id: '', name: '' })
            setRefreshTrigger(p => p + 1)
        } catch (err: any) {
            showToast(err.message ?? 'Failed to delete', 'error')
        } finally {
            setIsDeleting(false)
        }
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
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Administrators</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                            {total} super administrator{total !== 1 ? 's' : ''} registered
                        </p>
                    </div>
                    <Button variant="primary" size="md" onClick={openAdd} leftIcon={<span className="text-lg font-bold leading-none">+</span>}>
                        Add Admin
                    </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" style={{ color: 'var(--color-text-secondary)' }}>
                        <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                    <input type="text" placeholder="Search by name or email..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--color-text)' }} />
                    {searchInput && (
                        <button type="button" onClick={clearSearch} style={{ color: 'var(--color-text-secondary)' }}>
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                        </button>
                    )}
                </form>

                {/* Filter Tabs */}
                <FilterTabs tabs={superAdminTabs} value={statusFilter} onChange={val => { setStatusFilter(val); setPage(1) }} layoutId="activeSuperAdminTabUnderline" />

                {/* Table */}
                {loading ? <SuperAdminListSkeleton /> : (
                    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 0.6fr', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                            {['Name', 'Email', 'Phone', 'Status', 'Created', 'Actions'].map((h, i) => (
                                <span key={h} className={i === 5 ? 'text-right' : ''}>{h}</span>
                            ))}
                        </div>

                        {filteredAdmins.length === 0 ? (
                            <div className="px-5 py-16 text-center">
                                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No admins found</p>
                            </div>
                        ) : filteredAdmins.map((admin, i) => (
                            <motion.div
                                key={admin.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.25 }}
                                style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 0.6fr', borderTop: '1px solid var(--color-border)' }}
                                className="items-center px-5 py-4 text-sm transition-colors"
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-table-hover)')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                                        {admin.fullName[0].toUpperCase()}
                                    </div>
                                    <span className="font-medium truncate" style={{ color: 'var(--color-text)' }}>{admin.fullName}</span>
                                </div>
                                <span className="truncate" style={{ color: 'var(--color-text-secondary)' }}>{admin.user.email}</span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>{admin.user.phone || '—'}</span>
                                <span>
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: admin.user.isActive ? 'var(--color-success-light)' : 'var(--color-error-light)', color: admin.user.isActive ? 'var(--color-success)' : 'var(--color-error)' }}>
                                        {admin.user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>{new Date(admin.user.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center justify-end gap-2">
                                    {/* View */}
                                    <button type="button" onClick={() => openView(admin)} className="h-8 w-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer group relative" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-secondary)' }}>
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                        </svg>
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">View</span>
                                    </button>
                                    {/* Edit */}
                                    <button type="button" onClick={() => openEdit(admin)} className="h-8 w-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer group relative" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-secondary)' }}>
                                            <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                        </svg>
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">Edit</span>
                                    </button>
                                    {/* Delete */}
                                    <button type="button" onClick={() => setDeleteDialog({ isOpen: true, id: admin.id, name: admin.fullName })} className="h-8 w-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer group relative" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        </svg>
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-white bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">Delete</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {(modalMode === 'add' || modalMode === 'edit') && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 z-[99] flex items-center justify-center p-4 backdrop-blur-md" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 15, opacity: 0 }} transition={{ type: 'spring', duration: 0.4 }} onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-3xl p-6 shadow-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{modalMode === 'add' ? 'Add Super Admin' : 'Edit Super Admin'}</h3>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{modalMode === 'add' ? 'Create a new platform administrator' : 'Update administrator details'}</p>
                                </div>
                                <button type="button" onClick={closeModal} className="h-8 w-8 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}>✕</button>
                            </div>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                {[
                                    { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'e.g. John Smith', required: true },
                                    { label: 'Email', key: 'email', type: 'email', placeholder: 'admin@example.com', required: true },
                                    { label: `Password${modalMode === 'edit' ? ' (leave blank to keep)' : ''}`, key: 'password', type: 'password', placeholder: 'Min 6 characters', required: modalMode === 'add' },
                                    { label: 'Phone', key: 'phone', type: 'text', placeholder: '+1 234 567 8900', required: false },
                                ].map(f => (
                                    <div key={f.key} className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{f.label}{f.required && <span className="text-red-500 ml-1">*</span>}</label>
                                        <input type={f.type} required={f.required} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full rounded-2xl px-4 py-3 text-sm outline-none border" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} />
                                    </div>
                                ))}
                                {modalMode === 'edit' && (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded accent-violet-500" />
                                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Active Account</span>
                                    </label>
                                )}
                                <div className="flex justify-end gap-3 mt-2 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <Button type="button" variant="default" size="md" onClick={closeModal} disabled={formLoading}>Cancel</Button>
                                    <Button type="submit" variant="primary" size="md" isLoading={formLoading} loadingText="Saving...">{modalMode === 'add' ? 'Create Admin' : 'Save Changes'}</Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {modalMode === 'view' && selectedAdmin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 z-[99] flex items-center justify-center p-4 backdrop-blur-md" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <motion.div initial={{ scale: 0.95, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 15, opacity: 0 }} transition={{ type: 'spring', duration: 0.4 }} onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-3xl p-6 shadow-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Admin Details</h3>
                                <button type="button" onClick={closeModal} className="h-8 w-8 rounded-full border flex items-center justify-center opacity-70 hover:opacity-100" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}>✕</button>
                            </div>
                            <div className="flex flex-col gap-3 text-sm">
                                {[
                                    ['Full Name', selectedAdmin.fullName],
                                    ['Email', selectedAdmin.user.email],
                                    ['Phone', selectedAdmin.user.phone || '—'],
                                    ['Status', selectedAdmin.user.isActive ? 'Active' : 'Inactive'],
                                    ['Verified', selectedAdmin.user.isVerified ? 'Yes' : 'No'],
                                    ['Joined', new Date(selectedAdmin.user.createdAt).toLocaleDateString()],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between items-center py-2.5 px-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                                        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-5">
                                <Button variant="default" onClick={closeModal}>Close</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, id: '', name: '' })} onConfirm={handleDelete} type="danger" isLoading={isDeleting} title="Delete Super Admin" description={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`} confirmLabel="Delete" cancelLabel="Cancel" />
        </DashboardLayout>
    )
}

export default SuperAdminsPage
