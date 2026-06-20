import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../Context/AuthContext'
import { useToast } from '../../Context/ToastContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Pagination from '../../components/shared/Pagination'
import Button from '../../components/shared/Button'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { pricingApi, type Plan } from '../../services/pricing.service'
import FilterTabs from '../../components/shared/FilterTabs'

const planTabs = [
    { key: 'all', label: 'All Plans' },
    { key: 'active', label: 'Active Tiers' },
    { key: 'inactive', label: 'Inactive Tiers' }
] as const

const PlanListSkeleton = () => (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 0.8fr 2fr 1fr', alignItems: 'center', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 w-16 rounded bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
            ))}
            <div className="h-3 w-12 justify-self-end rounded bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 0.8fr 2fr 1fr', alignItems: 'center' }} className="px-5 py-4 gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="h-4 w-24 rounded bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
                        <div className="h-3 w-12 rounded-full bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="h-4 w-16 rounded bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
                        <div className="h-3 w-12 rounded bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
                    </div>
                    <div className="h-3 w-10 rounded bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
                    <div className="h-3 w-32 rounded bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
                    <div className="flex items-center justify-end gap-2">
                        <div className="h-8 w-8 rounded-lg bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
                        <div className="h-8 w-8 rounded-lg bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)]" />
                    </div>
                </div>
            ))}
        </div>
    </div>
)

const PlansPage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [plans, setPlans] = useState<Plan[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

    // Modal state triggers
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean
        mode: 'add' | 'edit'
        planId?: string
    }>({ isOpen: false, mode: 'add' })

    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Form inputs state
    const [formData, setFormData] = useState<{
        name: string
        monthlyPrice: string
        yearlyPrice: string
        currency: string
        description: string
        features: string[]
        isActive: boolean
    }>({
        name: '',
        monthlyPrice: '',
        yearlyPrice: '',
        currency: 'USD',
        description: '',
        features: [],
        isActive: true
    })

    const [newFeatureText, setNewFeatureText] = useState('')
    const [formLoading, setFormLoading] = useState(false)

    // Confirm Delete Dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean
        planId: string
        planName: string
    }>({ isOpen: false, planId: '', planName: '' })
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        if (user.role !== 'SUPER_ADMIN') navigate('/dashboard')
    }, [user, navigate])

    useEffect(() => {
        const fetchPlans = async () => {
            setLoading(true)
            try {
                const res = await pricingApi.listPlans({ page, limit: 8, search: search || undefined })
                const fetched = res.data.plans
                const filtered = fetched.filter(p => {
                    if (statusFilter === 'active') return p.isActive
                    if (statusFilter === 'inactive') return !p.isActive
                    return true
                })
                setPlans(filtered)
                setTotalPages(res.data.pagination.totalPages)
                setTotal(filtered.length)
            } catch {
                // silent
            } finally {
                setLoading(false)
            }
        }
        fetchPlans()
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

    const handleOpenAddModal = () => {
        setFormData({
            name: '',
            monthlyPrice: '',
            yearlyPrice: '',
            currency: 'USD',
            description: '',
            features: [],
            isActive: true
        })
        setModalConfig({ isOpen: true, mode: 'add' })
    }

    const handleOpenEditModal = (plan: Plan) => {
        setFormData({
            name: plan.name,
            monthlyPrice: String(plan.monthlyPrice),
            yearlyPrice: String(plan.yearlyPrice || '0'),
            currency: plan.currency,
            description: plan.description ?? '',
            features: plan.features ?? [],
            isActive: plan.isActive
        })
        setModalConfig({ isOpen: true, mode: 'edit', planId: plan.id })
    }

    const handleAddFeature = () => {
        if (!newFeatureText.trim()) return
        setFormData(p => ({
            ...p,
            features: [...p.features, newFeatureText.trim()]
        }))
        setNewFeatureText('')
    }

    const handleRemoveFeature = (index: number) => {
        setFormData(p => ({
            ...p,
            features: p.features.filter((_, i) => i !== index)
        }))
    }

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim() || !formData.monthlyPrice.trim() || !formData.yearlyPrice.trim()) {
            showToast('Please fill out all required fields', 'error')
            return
        }

        setFormLoading(true)
        try {
            const payload = {
                name: formData.name.trim(),
                monthlyPrice: parseFloat(formData.monthlyPrice),
                yearlyPrice: parseFloat(formData.yearlyPrice),
                currency: formData.currency,
                description: formData.description.trim() || undefined,
                features: formData.features,
                isActive: formData.isActive
            }

            if (modalConfig.mode === 'add') {
                await pricingApi.addPlan(payload)
                showToast('Subscription pricing plan added successfully', 'success')
            } else {
                await pricingApi.editPlan(modalConfig.planId!, payload)
                showToast('Pricing plan updated successfully', 'success')
            }

            setModalConfig(p => ({ ...p, isOpen: false }))
            setRefreshTrigger(prev => prev + 1)
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'An error occurred during submission', 'error')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeletePlanConfirm = async () => {
        setIsDeleting(true)
        try {
            await pricingApi.deletePlan(confirmDialog.planId)
            showToast(`Pricing plan "${confirmDialog.planName}" deleted successfully`, 'success')
            setConfirmDialog(p => ({ ...p, isOpen: false }))
            setRefreshTrigger(prev => prev + 1)
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : 'Failed to delete pricing plan', 'error')
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
                {/* Page header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Subscription Plans</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                            {total} plan tier{total !== 1 ? 's' : ''} active in platform billing
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleOpenAddModal}
                        leftIcon={<span className="text-lg font-bold leading-none">+</span>}
                    >
                        Create Plan
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
                            placeholder="Search pricing tiers by name or feature..."
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
                <FilterTabs tabs={planTabs} value={statusFilter} onChange={handleStatusChange} layoutId="activePlanTabUnderline" />

                {/* Table list */}
                {loading ? <PlanListSkeleton /> : (
                    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 0.8fr 2fr 1fr', alignItems: 'center', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">
                            <span>Tier Name</span>
                            <span>Monthly / Yearly</span>
                            <span>Currency</span>
                            <span>Features List</span>
                            <span className="text-right">Actions</span>
                        </div>

                        {plans.length === 0 ? (
                            <div className="px-5 py-16 text-center">
                                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>No subscription plans found matching filters.</p>
                            </div>
                        ) : (
                            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                                {plans.map(plan => (
                                    <div key={plan.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 0.8fr 2fr 1fr', alignItems: 'center' }} className="px-5 py-4 text-sm hover:bg-[rgba(0,0,0,0.01)] transition-colors duration-150">
                                        <div className="flex flex-col gap-1 pr-2">
                                            <span className="font-bold block" style={{ color: 'var(--color-text)' }}>{plan.name}</span>
                                            <div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${plan.isActive ? 'bg-[rgba(16,185,129,0.1)] text-emerald-500' : 'bg-[rgba(0,0,0,0.05)] text-gray-500'}`}>
                                                    {plan.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                                                ${plan.monthlyPrice}<span className="text-xs font-normal opacity-70">/mo</span>
                                            </span>
                                            <span className="font-mono font-bold text-xs" style={{ color: 'var(--color-primary)' }}>
                                                ${plan.yearlyPrice}<span className="text-[10px] font-normal opacity-70">/yr</span>
                                            </span>
                                        </div>
                                        <span className="text-xs uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                                            {plan.currency}
                                        </span>
                                        <div className="text-xs pr-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                            {(!plan.features || plan.features.length === 0) ? (
                                                <span className="italic">No custom features listed</span>
                                            ) : (
                                                plan.features.join(', ')
                                            )}
                                        </div>
                                        <div className="flex items-center justify-end gap-2.5">
                                            <div className="relative group">
                                                <button type="button" onClick={() => handleOpenEditModal(plan)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer">
                                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                                </button>
                                                <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/95 text-[10px] text-white px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-50 shadow-md">Edit Plan</span>
                                            </div>
                                            <div className="relative group">
                                                <button type="button" onClick={() => setConfirmDialog({ isOpen: true, planId: plan.id, planName: plan.name })} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer">
                                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </button>
                                                <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/95 text-[10px] text-white px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-50 shadow-md">Delete Plan</span>
                                            </div>
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
                onConfirm={handleDeletePlanConfirm}
                type="danger"
                isLoading={isDeleting}
                title="Confirm Pricing Plan Deletion"
                description={`Are you absolutely sure you want to permanently delete pricing tier "${confirmDialog.planName}"? This action cannot be undone and is guarded against active subscribers.`}
                confirmLabel="Delete Pricing Tier"
                cancelLabel="Cancel"
            />

            {/* Add / Edit modal */}
            <AnimatePresence>
                {modalConfig.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setModalConfig(p => ({ ...p, isOpen: false }))}
                        className="fixed inset-0 z-99 flex items-center justify-center p-4 backdrop-blur-md"
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
                                        {modalConfig.mode === 'add' ? 'Create Pricing Plan' : 'Edit Pricing Plan'}
                                    </h3>
                                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                        {modalConfig.mode === 'add' ? 'Define a new subscription level for hospital tenants' : 'Update the metadata for this billing tier'}
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
                                        Plan Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Premium Tier, Advanced Plus"
                                        value={formData.name}
                                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                        className="w-full rounded-2xl px-4 py-3 text-sm outline-none border transition-all"
                                        style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                            Monthly ($) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="e.g. 19.99"
                                            value={formData.monthlyPrice}
                                            onChange={e => setFormData(p => ({ ...p, monthlyPrice: e.target.value }))}
                                            className="w-full rounded-2xl px-3 py-3 text-xs sm:text-sm outline-none border transition-all"
                                            style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                            Yearly ($) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="e.g. 199.99"
                                            value={formData.yearlyPrice}
                                            onChange={e => setFormData(p => ({ ...p, yearlyPrice: e.target.value }))}
                                            className="w-full rounded-2xl px-3 py-3 text-xs sm:text-sm outline-none border transition-all"
                                            style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                            Currency
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="USD, EUR"
                                            value={formData.currency}
                                            onChange={e => setFormData(p => ({ ...p, currency: e.target.value.toUpperCase() }))}
                                            className="w-full rounded-2xl px-3 py-3 text-xs sm:text-sm outline-none border transition-all"
                                            style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Brief summary of what this tier offers and target audience..."
                                        value={formData.description}
                                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                        className="w-full rounded-2xl px-4 py-3 text-sm outline-none border transition-all resize-none"
                                        style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                        Plan Features Checklist
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g. 24/7 Priority Support, HIPAA Compliant..."
                                            value={newFeatureText}
                                            onChange={e => setNewFeatureText(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature() } }}
                                            className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none border transition-all"
                                            style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddFeature}
                                            className="px-4 rounded-2xl text-xs font-bold cursor-pointer select-none transition-all"
                                            style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Features bullets */}
                                    <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-32 overflow-y-auto p-1 rounded-xl" style={{ border: formData.features.length > 0 ? '1px dashed var(--color-border)' : 'none' }}>
                                        {formData.features.map((feature, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text)' }}>
                                                {feature}
                                                <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer">
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                        {formData.features.length === 0 && (
                                            <span className="text-xs italic p-1" style={{ color: 'var(--color-text-secondary)' }}>No features added yet. Add items above.</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 py-2">
                                    <input
                                        type="checkbox"
                                        id="isActiveCheckbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))}
                                        className="h-4 w-4 rounded cursor-pointer accent-violet-500"
                                    />
                                    <label htmlFor="isActiveCheckbox" className="text-xs font-bold select-none cursor-pointer" style={{ color: 'var(--color-text)' }}>
                                        Make this billing plan active for new tenant subscriptions
                                    </label>
                                </div>

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
                                        {formLoading ? 'Saving...' : 'Save Plan'}
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

export default PlansPage
