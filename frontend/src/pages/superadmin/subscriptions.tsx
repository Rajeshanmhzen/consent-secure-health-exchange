import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../Context/AuthContext'
import { useToast } from '../../Context/ToastContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pagination from '../../components/shared/Pagination'
import Button from '../../components/shared/Button'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { pricingApi, type Subscription, type Plan } from '../../services/pricing.service'
import { tenantApi, type Tenant } from '../../services/tenant.service'

type TabProps = {
    value: 'all' | 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'EXPIRED'
    onChange: (val: 'all' | 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'EXPIRED') => void
}

const FilterTabs = ({ value, onChange }: TabProps) => {
    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'ACTIVE', label: 'Active' },
        { key: 'TRIALING', label: 'Trialing' },
        { key: 'CANCELED', label: 'Canceled' },
        { key: 'EXPIRED', label: 'Expired' }
    ] as const

    return (
        <div className="flex border-b w-full mt-2 overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
            {tabs.map(t => {
                const isActive = value === t.key
                return (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => onChange(t.key)}
                        className="relative py-3 px-5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none outline-none whitespace-nowrap"
                        style={{
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        }}
                    >
                        {t.label}
                        {isActive && (
                            <motion.div
                                layoutId="activeSubscriptionTabUnderline"
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

const SubscriptionListSkeleton = () => (
    <div className="flex flex-col gap-3 animate-pulse">
        <div className="h-12 w-full rounded-2xl bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
        <div className="h-16 w-full rounded-2xl bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
        <div className="h-16 w-full rounded-2xl bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
        <div className="h-16 w-full rounded-2xl bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
    </div>
)

const SubscriptionsPage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'EXPIRED'>('all')

    // Modal lookup dataset states
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [plans, setPlans] = useState<Plan[]>([])

    // Modal state triggers
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean
        mode: 'add' | 'edit'
        subscriptionId?: string
    }>({ isOpen: false, mode: 'add' })

    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Form inputs state
    const [formData, setFormData] = useState<{
        tenantId: string
        planId: string
        status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'
        billingCycle: 'MONTHLY' | 'YEARLY'
        startsAt: string
        endsAt: string
        trialEndsAt: string
    }>({
        tenantId: '',
        planId: '',
        status: 'TRIALING',
        billingCycle: 'MONTHLY',
        startsAt: new Date().toISOString().substring(0, 10),
        endsAt: '',
        trialEndsAt: ''
    })

    const [formLoading, setFormLoading] = useState(false)

    // Confirm Delete Dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean
        subscriptionId: string
        tenantName: string
    }>({ isOpen: false, subscriptionId: '', tenantName: '' })
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        if (user.role !== 'SUPER_ADMIN') navigate('/dashboard')
    }, [user, navigate])

    // Load tenants and plans lookups for select dropdowns
    useEffect(() => {
        if (modalConfig.isOpen) {
            tenantApi.list({ limit: 100 })
                .then(res => setTenants(res.data.hospitals))
                .catch(() => { })

            pricingApi.listPlans({ limit: 100 })
                .then(res => setPlans(res.data.plans.filter(p => p.isActive)))
                .catch(() => { })
        }
    }, [modalConfig.isOpen])

    useEffect(() => {
        setLoading(true)
        pricingApi.listSubscriptions({
            page,
            limit: 8,
            search: search || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter
        })
            .then(res => {
                setSubscriptions(res.data.subscriptions)
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

    const handleStatusChange = (val: 'all' | 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'EXPIRED') => {
        setStatusFilter(val)
        setPage(1)
    }

    const handleOpenAddModal = () => {
        setFormData({
            tenantId: '',
            planId: '',
            status: 'TRIALING',
            billingCycle: 'MONTHLY',
            startsAt: new Date().toISOString().substring(0, 10),
            endsAt: '',
            trialEndsAt: ''
        })
        setModalConfig({ isOpen: true, mode: 'add' })
    }

    const handleOpenEditModal = (sub: Subscription) => {
        setFormData({
            tenantId: sub.tenantId,
            planId: sub.planId,
            status: sub.status,
            billingCycle: sub.billingCycle || 'MONTHLY',
            startsAt: sub.startsAt.substring(0, 10),
            endsAt: sub.endsAt ? sub.endsAt.substring(0, 10) : '',
            trialEndsAt: sub.trialEndsAt ? sub.trialEndsAt.substring(0, 10) : ''
        })
        setModalConfig({ isOpen: true, mode: 'edit', subscriptionId: sub.id })
    }

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.tenantId || !formData.planId) {
            showToast('Please select a hospital tenant and billing plan tier', 'error')
            return
        }

        setFormLoading(true)
        try {
            const payload = {
                tenantId: formData.tenantId,
                planId: formData.planId,
                status: formData.status,
                billingCycle: formData.billingCycle,
                startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
                endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
                trialEndsAt: formData.trialEndsAt ? new Date(formData.trialEndsAt).toISOString() : null
            }

            if (modalConfig.mode === 'add') {
                await pricingApi.addSubscription(payload)
                showToast('Hospital subscription package created successfully', 'success')
            } else {
                await pricingApi.editSubscription(modalConfig.subscriptionId!, payload)
                showToast('Hospital subscription details updated successfully', 'success')
            }

            setModalConfig(p => ({ ...p, isOpen: false }))
            setRefreshTrigger(prev => prev + 1)
        } catch (err: any) {
            showToast(err.message ?? 'An error occurred during submission', 'error')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeleteSubscriptionConfirm = async () => {
        setIsDeleting(true)
        try {
            await pricingApi.deleteSubscription(confirmDialog.subscriptionId)
            showToast(`Subscription record deleted successfully`, 'success')
            setConfirmDialog(p => ({ ...p, isOpen: false }))
            setRefreshTrigger(prev => prev + 1)
        } catch (err: any) {
            showToast(err.message ?? 'Failed to delete subscription tier', 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-[rgba(16,185,129,0.1)] text-emerald-500'
            case 'TRIALING':
                return 'bg-[rgba(99,102,241,0.1)] text-indigo-500'
            case 'CANCELED':
                return 'bg-[rgba(239,68,68,0.1)] text-rose-500'
            case 'EXPIRED':
                return 'bg-[rgba(0,0,0,0.05)] text-gray-500'
            case 'PAST_DUE':
                return 'bg-[rgba(245,158,11,0.1)] text-amber-500'
            default:
                return 'bg-[rgba(0,0,0,0.05)] text-gray-500'
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
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Hospital Subscriptions</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                            {total} tenant contract{total !== 1 ? 's' : ''} registered
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleOpenAddModal}
                        leftIcon={<span className="text-lg font-bold leading-none">+</span>}
                    >
                        New Contract
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
                            placeholder="Search subscriptions by hospital or pricing tier name..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none"
                            style={{ color: 'var(--color-text)' }}
                        />
                        {searchInput && (
                            <button type="button" onClick={clearSearch} style={{ color: 'var(--color-text-secondary)' }} className="cursor-pointer select-none">
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                                    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        )}
                    </form>
                </div>

                {/* Filter Tabs */}
                <FilterTabs value={statusFilter} onChange={handleStatusChange} />

                {/* Table list */}
                {loading ? <SubscriptionListSkeleton /> : (
                    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 1fr', alignItems: 'center', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                            <span>Hospital Tenant</span>
                            <span>Selected Plan</span>
                            <span>Status</span>
                            <span>Starts At</span>
                            <span>Ends At</span>
                            <span className="text-right">Actions</span>
                        </div>

                        {subscriptions.length === 0 ? (
                            <div className="px-5 py-16 text-center">
                                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>No active subscription records found.</p>
                            </div>
                        ) : (
                            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                                {subscriptions.map(sub => (
                                    <div key={sub.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1.2fr 1.2fr 1fr', alignItems: 'center' }} className="px-5 py-4 text-sm hover:bg-[rgba(0,0,0,0.01)] transition-colors duration-150">
                                        <div className="flex flex-col gap-1 pr-2">
                                            <span className="font-bold block" style={{ color: 'var(--color-text)' }}>{sub.tenant?.name ?? 'Unknown Hospital'}</span>
                                            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{sub.tenantId}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold" style={{ color: 'var(--color-text)' }}>{sub.plan?.name ?? 'Unknown Tier'}</span>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs font-semibold font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                                                    {sub.billingCycle === 'YEARLY'
                                                        ? `$${sub.plan?.yearlyPrice || 0}/yr`
                                                        : `$${sub.plan?.monthlyPrice || 0}/mo`}
                                                </span>
                                                <span className={`text-[10px] font-extrabold uppercase px-1 rounded border tracking-wider`}
                                                    style={{
                                                        borderColor: sub.billingCycle === 'YEARLY' ? 'var(--color-primary)' : 'var(--color-border)',
                                                        color: sub.billingCycle === 'YEARLY' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                                        backgroundColor: sub.billingCycle === 'YEARLY' ? 'var(--color-primary-ghost)' : 'transparent'
                                                    }}>
                                                    {sub.billingCycle}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getStatusStyles(sub.status)}`}>
                                                {sub.status}
                                            </span>
                                        </div>
                                        <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                            {sub.startsAt.substring(0, 10)}
                                        </span>
                                        <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                            {sub.endsAt ? sub.endsAt.substring(0, 10) : 'Ongoing'}
                                        </span>
                                        <div className="flex items-center justify-end gap-2.5">
                                            {/* Edit Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditModal(sub)}
                                                className="h-8 w-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer select-none group relative"
                                                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                                            >
                                                <svg viewBox="0 0 24 24" className="h-4 w-4 group-hover:scale-105" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 20h9" />
                                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                                </svg>
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow">
                                                    Edit Contract
                                                </span>
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                type="button"
                                                onClick={() => setConfirmDialog({ isOpen: true, subscriptionId: sub.id, tenantName: sub.tenant?.name ?? 'this tenant' })}
                                                className="h-8 w-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer select-none group relative"
                                                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                                            >
                                                <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-500 group-hover:scale-105" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18" />
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                </svg>
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-white bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow">
                                                    Delete Record
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-end">
                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                )}
            </motion.div>

            {/* Deletion confirmation dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
                onConfirm={handleDeleteSubscriptionConfirm}
                type="danger"
                isLoading={isDeleting}
                title="Confirm Subscription Record Removal"
                description={`Are you absolutely sure you want to permanently delete the subscription contract for "${confirmDialog.tenantName}"? This action cannot be undone and deletes transaction histories.`}
                confirmLabel="Delete Contract"
                cancelLabel="Cancel"
            />

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {modalConfig.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setModalConfig(p => ({ ...p, isOpen: false }))}
                        className="fixed inset-0 z-[99] flex items-center justify-center p-4 backdrop-blur-md"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 15, opacity: 0 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-lg rounded-3xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]"
                            style={{
                                background: 'color-mix(in srgb, var(--color-surface) 82%, transparent)',
                                backdropFilter: 'blur(24px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'var(--color-text)'
                            }}
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                                        {modalConfig.mode === 'add' ? 'New Subscription Contract' : 'Edit Subscription Details'}
                                    </h3>
                                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                        {modalConfig.mode === 'add' ? 'Bind a hospital tenant to a selected billing plan tier' : 'Update the timing scopes or active states for this hospital'}
                                    </p>
                                </div>
                                <button type="button" onClick={() => setModalConfig(p => ({ ...p, isOpen: false }))} className="h-8 w-8 rounded-full border flex items-center justify-center transition-all cursor-pointer opacity-70 hover:opacity-100" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}>
                                    ✕
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                        Hospital Tenant <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        disabled={modalConfig.mode === 'edit'}
                                        value={formData.tenantId}
                                        onChange={e => setFormData(p => ({ ...p, tenantId: e.target.value }))}
                                        className="w-full rounded-2xl px-4 py-3 text-sm outline-none border transition-all cursor-pointer"
                                        style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    >
                                        <option value="">-- Choose Hospital --</option>
                                        {tenants.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                        Pricing Plan Tier <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.planId}
                                        onChange={e => setFormData(p => ({ ...p, planId: e.target.value }))}
                                        className="w-full rounded-2xl px-4 py-3 text-sm outline-none border transition-all cursor-pointer"
                                        style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    >
                                        <option value="">-- Select Billing Package --</option>
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (${p.monthlyPrice}/mo, ${p.yearlyPrice}/yr)</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                        Billing Cycle / Interval <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.billingCycle}
                                        onChange={e => setFormData(p => ({ ...p, billingCycle: e.target.value as any }))}
                                        className="w-full rounded-2xl px-4 py-3 text-sm outline-none border transition-all cursor-pointer"
                                        style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    >
                                        <option value="MONTHLY">MONTHLY BILLING</option>
                                        <option value="YEARLY">YEARLY BILLING</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                        Subscription Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))}
                                        className="w-full rounded-2xl px-4 py-3 text-sm outline-none border transition-all cursor-pointer"
                                        style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    >
                                        <option value="TRIALING">TRIALING (In-Trial Period)</option>
                                        <option value="ACTIVE">ACTIVE (Fully Subscribed)</option>
                                        <option value="PAST_DUE">PAST DUE (Outstanding Invoice)</option>
                                        <option value="CANCELED">CANCELED (Manually Stopped)</option>
                                        <option value="EXPIRED">EXPIRED (Past End Bounds)</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                        Starts At Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startsAt}
                                        onChange={e => setFormData(p => ({ ...p, startsAt: e.target.value }))}
                                        className="w-full rounded-2xl px-4 py-3 text-sm outline-none border transition-all cursor-pointer"
                                        style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                            Trial Ends At
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.trialEndsAt}
                                            onChange={e => setFormData(p => ({ ...p, trialEndsAt: e.target.value }))}
                                            className="w-full rounded-2xl px-4 py-3 text-sm outline-none border transition-all cursor-pointer"
                                            style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                            Contract Ends At
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.endsAt}
                                            onChange={e => setFormData(p => ({ ...p, endsAt: e.target.value }))}
                                            className="w-full rounded-2xl px-4 py-3 text-sm outline-none border transition-all cursor-pointer"
                                            style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        />
                                    </div>
                                </div>

                                {modalConfig.mode === 'add' && (
                                    <p className="text-[11px] leading-relaxed italic opacity-85" style={{ color: 'var(--color-text-secondary)' }}>
                                        ⚠️ Note: Hospital tenants are restricted to exactly one active/trialing package. Saving this will automatically cancel or expire any existing subscription active for this tenant.
                                    </p>
                                )}

                                {/* Modal Actions */}
                                <div className="flex justify-end gap-3 mt-4 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                                    <Button
                                        type="button"
                                        variant="default"
                                        size="md"
                                        onClick={() => setModalConfig(p => ({ ...p, isOpen: false }))}
                                        disabled={formLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="md"
                                        disabled={formLoading}
                                    >
                                        {formLoading ? 'Saving...' : 'Save Contract'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}

export default SubscriptionsPage
