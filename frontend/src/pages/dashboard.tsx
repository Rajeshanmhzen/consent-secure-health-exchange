import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import StatCard from '../components/dashboard/StatCard'
import Pagination from '../components/shared/Pagination'
import TenantListSkeleton from '../components/dashboard/TenantListSkeleton'
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton'
import { tenantApi, type Tenant } from '../services/tenant.service'
import { dashboardApi, type SuperAdminDashboardStats } from '../services/dashboard.service'
import { createRealtimeConnection } from '../services/realtime.service'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

type Stat = { label: string; value: string; color: string; icon: React.ReactNode }

const icons = {
    records:   <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM11 13h2v2h2v2h-2v2h-2v-2H9v-2h2v-2z" /></svg>,
    requests:  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>,
    shared:    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 0 0 0-6 3 3 0 0 0-3 3c0 .24.04.47.09.7L8.04 9.81A2.99 2.99 0 0 0 6 9a3 3 0 0 0 0 6c.79 0 1.5-.31 2.04-.81l7.12 4.15c-.05.21-.08.43-.08.66a2.92 2.92 0 0 0 5.84 0 2.92 2.92 0 0 0-2.92-2.92z" /></svg>,
    emergency: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z" /></svg>,
    tenants:   <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" /></svg>,
    plans:     <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>,
    staff:     <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>,
    patients:  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>,
    consent:   <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 1 3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5l-9-4Zm-1 14-3-3 1.4-1.4 1.6 1.6 4.6-4.6L17 9l-6 6Z" /></svg>,
    schedule:  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" /></svg>,
    inquiry:   <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" /></svg>,
}

const ROLE_STATS: Record<string, Stat[]> = {
    SUPER_ADMIN: [
        { label: 'Total Tenants',       value: '0', color: 'var(--color-primary)', icon: icons.tenants },
        { label: 'Total Plans',         value: '0', color: 'var(--color-success)', icon: icons.plans },
        { label: 'Total Subscriptions', value: '0', color: 'var(--color-accent)',  icon: icons.consent },
        { label: 'Total Users',         value: '0', color: 'var(--color-info)',    icon: icons.staff },
        { label: 'Audit Events',        value: '0', color: 'var(--color-warning)', icon: icons.records },
        { label: 'Total Inquiries',     value: '0', color: 'var(--color-accent)',  icon: icons.inquiry },
    ],
    HOSPITAL_ADMIN: [
        { label: 'Total Staff',       value: '0', color: 'var(--color-primary)', icon: icons.staff },
        { label: 'Total Patients',    value: '0', color: 'var(--color-success)', icon: icons.patients },
        { label: 'Active Doctors',    value: '0', color: 'var(--color-info)',    icon: icons.staff },
        { label: 'Audit Events',      value: '0', color: 'var(--color-warning)', icon: icons.records },
        { label: 'Total Inquiries',   value: '0', color: 'var(--color-accent)',  icon: icons.inquiry },
    ],
    DOCTOR: [
        { label: 'Medical Records',   value: '0', color: 'var(--color-primary)', icon: icons.records },
        { label: 'Pending Requests',  value: '0', color: 'var(--color-warning)', icon: icons.requests },
        { label: 'Shared Records',    value: '0', color: 'var(--color-success)', icon: icons.shared },
        { label: 'Emergency Access',  value: '0', color: 'var(--color-error)',   icon: icons.emergency },
        { label: 'Total Inquiries',   value: '0', color: 'var(--color-accent)',  icon: icons.inquiry },
    ],
    RECEPTIONIST: [
        { label: 'Total Patients',    value: '0', color: 'var(--color-primary)', icon: icons.patients },
        { label: 'Scheduled Today',   value: '0', color: 'var(--color-success)', icon: icons.schedule },
        { label: 'Pending Check-in',  value: '0', color: 'var(--color-warning)', icon: icons.requests },
        { label: 'New Registrations', value: '0', color: 'var(--color-info)',    icon: icons.staff },
        { label: 'Total Inquiries',   value: '0', color: 'var(--color-accent)',  icon: icons.inquiry },
    ],
    PATIENT: [
        { label: 'My Records',        value: '0', color: 'var(--color-primary)', icon: icons.records },
        { label: 'Pending Consents',  value: '0', color: 'var(--color-warning)', icon: icons.consent },
        { label: 'Shared With',       value: '0', color: 'var(--color-success)', icon: icons.shared },
        { label: 'Data Requests',     value: '0', color: 'var(--color-info)',    icon: icons.requests },
        { label: 'Total Inquiries',   value: '0', color: 'var(--color-accent)',  icon: icons.inquiry },
    ],
}

const ROLE_DESCRIPTION: Record<string, string> = {
    SUPER_ADMIN:    'Manage tenants, plans, and platform-wide settings.',
    HOSPITAL_ADMIN: 'Manage your hospital staff, patients, and subscriptions.',
    DOCTOR:         'View and manage patient records, handle data requests.',
    RECEPTIONIST:   'Register patients and manage appointment schedules.',
    PATIENT:        'View your medical records and manage data sharing consent.',
}

// Static chart data — replace with real API data when available
const CHART_DATA = [
    { month: 'Jan', tenants: 2, users: 8 },
    { month: 'Feb', tenants: 3, users: 14 },
    { month: 'Mar', tenants: 5, users: 22 },
    { month: 'Apr', tenants: 4, users: 18 },
    { month: 'May', tenants: 7, users: 35 },
    { month: 'Jun', tenants: 9, users: 48 },
    { month: 'Jul', tenants: 11, users: 60 },
]

const DashboardPage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [tenants, setTenants] = useState<Tenant[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loadingTenants, setLoadingTenants] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)

    const [stats, setStats] = useState<Stat[]>(() => {
        const r = user?.role ?? 'PATIENT'
        return ROLE_STATS[r] ?? ROLE_STATS['PATIENT']
    })

    const applySuperAdminStats = (data: SuperAdminDashboardStats) => {
        const values: Record<string, number> = {
            'Total Tenants': data.totalTenants,
            'Total Plans': data.totalPlans,
            'Total Subscriptions': data.totalSubscriptions,
            'Total Users': data.totalUsers,
            'Audit Events': data.auditEvents,
            'Total Inquiries': data.totalInquiries,
        }
        setStats(prev => prev.map(stat => values[stat.label] !== undefined ? { ...stat, value: String(values[stat.label]) } : stat))
    }

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    useEffect(() => {
        // Simulate initial page loading to showcase the gorgeous skeleton animation
        const timer = setTimeout(() => {
            setPageLoading(false)
        }, 700)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!user) return
        const r = user.role ?? 'PATIENT'
        setStats(ROLE_STATS[r] ?? ROLE_STATS['PATIENT'])

        if (r === 'SUPER_ADMIN') {
            setLoadingTenants(true)
            tenantApi.list({ page, limit: 8 })
                .then(res => {
                    setTenants(res.data.hospitals)
                    setTotalPages(res.data.pagination.totalPages)

                    // Also update the Total Tenants stat count dynamically
                    const tenantCount = res.data.pagination.total
                    setStats(prev => prev.map(s => s.label === 'Total Tenants' ? { ...s, value: String(tenantCount) } : s))
                })
                .catch(() => {})
                .finally(() => setLoadingTenants(false))
        }
    }, [user, page])

    useEffect(() => {
        if (!user) return

        let isMounted = true
        const fetchStats = () => {
            if (user.role === 'SUPER_ADMIN') {
                dashboardApi.superAdminStats()
                    .then(res => {
                        if (isMounted) applySuperAdminStats(res.data)
                    })
                    .catch(() => {})
            } else if (user.role === 'HOSPITAL_ADMIN') {
                dashboardApi.hospitalAdminStats().then(res => {
                    if (isMounted) setStats(prev => prev.map(s => res.data[s.label] !== undefined ? { ...s, value: String(res.data[s.label]) } : s))
                }).catch(() => {})
            } else if (user.role === 'DOCTOR') {
                dashboardApi.doctorStats().then(res => {
                    if (isMounted) setStats(prev => prev.map(s => res.data[s.label] !== undefined ? { ...s, value: String(res.data[s.label]) } : s))
                }).catch(() => {})
            } else if (user.role === 'RECEPTIONIST') {
                dashboardApi.receptionistStats().then(res => {
                    if (isMounted) setStats(prev => prev.map(s => res.data[s.label] !== undefined ? { ...s, value: String(res.data[s.label]) } : s))
                }).catch(() => {})
            } else if (user.role === 'PATIENT') {
                dashboardApi.patientStats().then(res => {
                    if (isMounted) setStats(prev => prev.map(s => res.data[s.label] !== undefined ? { ...s, value: String(res.data[s.label]) } : s))
                }).catch(() => {})
            }
        }

        fetchStats()
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') fetchStats()
        }
        const closeRealtime = createRealtimeConnection((event) => {
            if (event.type === 'DASHBOARD_STATS_CHANGED' || event.type === 'INQUIRY_CHANGED') fetchStats()
        })
        window.addEventListener('focus', fetchStats)
        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            isMounted = false
            closeRealtime()
            window.removeEventListener('focus', fetchStats)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [user])

    if (pageLoading) return <DashboardSkeleton />
    if (!user) return null

    const role = user.role ?? 'PATIENT'
    const description = ROLE_DESCRIPTION[role] ?? ''
    const displayName = user.name || user.email.split('@')[0]

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col gap-6"
            >
                {/* Welcome banner */}
                <div className="rounded-2xl px-6 py-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-primary)' }}>
                        {role.replace('_', ' ')}
                    </p>
                    <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>
                        Hello, {displayName} 👋
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
                </div>

                {/* Stats */}
                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4`}>
                    {stats.map((s, i) => (
                        <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} index={i} />
                    ))}
                </div>

                {/* Graph */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <p className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                        {role === 'SUPER_ADMIN' ? 'Tenant & User Growth' : 'Activity Overview'}
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={CHART_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTenants" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 12 }}
                                labelStyle={{ color: 'var(--color-text)' }}
                            />
                            <Area type="monotone" dataKey="tenants" stroke="#8B5CF6" strokeWidth={2} fill="url(#colorTenants)" name="Tenants" />
                            <Area type="monotone" dataKey="users" stroke="#60A5FA" strokeWidth={2} fill="url(#colorUsers)" name="Users" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Tenant list — SUPER_ADMIN only */}
                {role === 'SUPER_ADMIN' && (
                    loadingTenants ? <TenantListSkeleton /> : (
                        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Recent Tenants</p>
                            </div>
                            {tenants.length === 0 ? (
                                <div className="px-5 py-10 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    No tenants found.
                                </div>
                            ) : (
                                <div>
                                    {/* Table header */}
                                    <div className="grid grid-cols-4 px-5 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)' }}>
                                        <span>Name</span>
                                        <span>Type</span>
                                        <span>Status</span>
                                        <span>Created</span>
                                    </div>
                                    {tenants.map((t) => (
                                        <div
                                            key={t.id}
                                            className="grid grid-cols-4 items-center px-5 py-3 text-sm transition-colors"
                                            style={{ borderTop: '1px solid var(--color-border)' }}
                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-table-hover)')}
                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                                                    {t.name[0].toUpperCase()}
                                                </div>
                                                <span className="font-medium truncate" style={{ color: 'var(--color-text)' }}>{t.name}</span>
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
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="px-5 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                            </div>
                        </div>
                    )
                )}
            </motion.div>
        </DashboardLayout>
    )
}

export default DashboardPage
