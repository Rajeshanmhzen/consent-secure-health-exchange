import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../Context/AuthContext'
import { useToast } from '../../Context/ToastContext'
import { authApi } from '../../services/auth.service'
import Avatar from '../shared/Avatar'
import ConfirmDialog from '../shared/ConfirmDialog'
import PreferencesModal from '../shared/PreferencesModal'
import ProfileDropdown from '../shared/ProfileDropdown'

type NavLink = { label: string; to: string; icon: React.ReactNode }

const ICONS = {
    dashboard:  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>,
    records:    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM11 13h2v2h2v2h-2v2h-2v-2H9v-2h2v-2z" /></svg>,
    requests:   <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>,
    patients:   <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>,
    tenants:    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" /></svg>,
    plans:      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>,
    subscriptions: <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
    staff:      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>,
    emergency:  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z" /></svg>,
    consent:    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M12 1 3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5l-9-4Zm-1 14-3-3 1.4-1.4 1.6 1.6 4.6-4.6L17 9l-6 6Z" /></svg>,
    audit:      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>,
    schedule:   <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" /></svg>,
    settings:   <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.01 7.01 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54a7.3 7.3 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a7.3 7.3 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z" /></svg>,
    trash:      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
}

const ROLE_NAV: Record<string, { label: string; to: string; icon: React.ReactNode }[]> = {
    SUPER_ADMIN: [
        { label: 'Dashboard',     to: '/dashboard',           icon: ICONS.dashboard },
        { label: 'Tenants',       to: '/dashboard/tenants',   icon: ICONS.tenants },
        { label: 'Admins',        to: '/dashboard/superadmins', icon: ICONS.staff },
        { label: 'Plans',         to: '/dashboard/plans',     icon: ICONS.plans },
        { label: 'Subscriptions', to: '/dashboard/subscriptions', icon: ICONS.subscriptions },
        { label: 'Audit Logs',    to: '/dashboard/audit',     icon: ICONS.audit },
        { label: 'Inquiries',     to: '/dashboard/inquiries', icon: ICONS.consent },
        { label: 'Recycle Bin',   to: '/dashboard/trash',  icon: ICONS.trash },
    ],
    HOSPITAL_ADMIN: [
        { label: 'Dashboard',     to: '/dashboard',           icon: ICONS.dashboard },
        { label: 'Staff',         to: '/dashboard/staff',     icon: ICONS.staff },
        { label: 'Patients',      to: '/dashboard/patients',  icon: ICONS.patients },
        { label: 'Audit Logs',    to: '/dashboard/audit',     icon: ICONS.audit },
    ],
    DOCTOR: [
        { label: 'Dashboard',     to: '/dashboard',           icon: ICONS.dashboard },
        { label: 'Medical Records', to: '/dashboard/records', icon: ICONS.records },
        { label: 'Data Requests', to: '/dashboard/requests',  icon: ICONS.requests },
        { label: 'Patients',      to: '/dashboard/patients',  icon: ICONS.patients },
        { label: 'Emergency',     to: '/dashboard/emergency', icon: ICONS.emergency },
    ],
    RECEPTIONIST: [
        { label: 'Dashboard',     to: '/dashboard',           icon: ICONS.dashboard },
        { label: 'Patients',      to: '/dashboard/patients',  icon: ICONS.patients },
        { label: 'Schedule',      to: '/dashboard/schedule',  icon: ICONS.schedule },
    ],
    PATIENT: [
        { label: 'Dashboard',     to: '/dashboard',           icon: ICONS.dashboard },
        { label: 'My Records',    to: '/dashboard/records',   icon: ICONS.records },
        { label: 'Consent',       to: '/dashboard/consent',   icon: ICONS.consent },
        { label: 'Data Requests', to: '/dashboard/requests',  icon: ICONS.requests },
    ],
}

const MenuOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-right-icon lucide-panel-right">
        <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>
    </svg>
)

const MenuCloseIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left-icon lucide-panel-left">
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>
    </svg>
)

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, logout } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState(false)
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showPrefModal, setShowPrefModal] = useState(false)
    const [notificationsCount, setNotificationsCount] = useState(3)
    const [layoutLoading, setLayoutLoading] = useState(true)

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLayoutLoading(false)
        }, 650)
        return () => clearTimeout(timer)
    }, [])

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
            try { await authApi.logout({ refreshToken }) } catch { /* silent */ }
        }
        showToast('Logged out successfully!', 'info')
        logout()
        navigate('/login')
    }

    const navLinks = ROLE_NAV[user?.role ?? ''] ?? ROLE_NAV['PATIENT']

    const displayName = user?.name || user?.email?.split('@')[0] || '—'

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>

            {/* ── Sidebar ── */}
            <motion.aside
                animate={{ width: collapsed ? 68 : 256 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex flex-col h-screen shrink-0 overflow-hidden"
                style={{ backgroundColor: 'var(--color-sidebar)', borderRight: '1px solid var(--color-border)' }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2 px-3.5 h-16 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white">
                            <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 3a1 1 0 0 1 1 1v3h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3H8a1 1 0 0 1 0-2h3V7a1 1 0 0 1 1-1z" />
                        </svg>
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm font-bold whitespace-nowrap overflow-hidden"
                                style={{ color: 'var(--color-text)' }}
                            >
                                HealthExchange
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 flex flex-col gap-1 min-h-0">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/dashboard'}
                            title={collapsed ? link.label : undefined}
                            className="flex items-center gap-3 rounded-xl transition-all duration-150 overflow-hidden"
                            style={({ isActive }) => ({
                                padding: collapsed ? '10px 14px' : '10px 12px',
                                backgroundColor: isActive ? 'var(--color-primary-ghost)' : 'transparent',
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '0.875rem',
                            })}
                        >
                            {link.icon}
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        {link.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    ))}
                </nav>

                {/* User info + logout */}
                <div className="px-2 py-3 flex flex-col gap-2 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
                    {/* User row */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowProfileMenu(prev => !prev)}
                            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 overflow-hidden text-left cursor-pointer"
                            style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                            title={collapsed ? `${displayName}\n${user?.email}` : undefined}
                        >
                            <Avatar name={displayName} size="md" image={user?.profileImageUrl} />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex-1 min-w-0 overflow-hidden"
                                    >
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                                            {displayName}
                                        </p>
                                        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                                            {user?.email}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        <AnimatePresence>
                            {showProfileMenu && user && (
                                <ProfileDropdown
                                    user={user}
                                    onClose={() => setShowProfileMenu(false)}
                                    onLogout={handleLogout}
                                    onOpenPreferences={() => {
                                        setShowPrefModal(true)
                                        setShowProfileMenu(false)
                                    }}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Logout row */}
                    <button
                        onClick={() => setLogoutConfirmOpen(true)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 w-full"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'var(--color-error-light)'
                            e.currentTarget.style.color = 'var(--color-error)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = 'var(--color-text-secondary)'
                        }}
                        title={collapsed ? 'Logout' : undefined}
                    >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4V5z" />
                        </svg>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="whitespace-nowrap overflow-hidden"
                                >
                                    Logout
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>

            {/* ── Main area ── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

                {/* Topbar */}
                <header
                    className="flex items-center justify-between px-4 h-16 shrink-0"
                    style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
                >
                    {/* Toggle button */}
                    <button
                        onClick={() => setCollapsed(p => !p)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                        style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <MenuCloseIcon /> : <MenuOpenIcon />}
                    </button>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Notification bell */}
                        <button
                            onClick={() => {
                                if (notificationsCount > 0) {
                                    setNotificationsCount(0)
                                    showToast('Notifications marked as read', 'success')
                                } else {
                                    showToast('No new notifications', 'info')
                                }
                            }}
                            className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
                            style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                            title="Notifications"
                        >
                            <motion.div
                                animate={notificationsCount > 0 ? {
                                    rotate: [0, -12, 12, -12, 12, -8, 8, 0]
                                } : {}}
                                transition={notificationsCount > 0 ? {
                                    duration: 0.65,
                                    repeat: Infinity,
                                    repeatDelay: 3.5,
                                    ease: 'easeInOut'
                                } : {}}
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                    <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z" />
                                </svg>
                            </motion.div>
                            {notificationsCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm border border-(--color-surface)" style={{ backgroundColor: 'var(--color-error)' }}>
                                    {notificationsCount}
                                </span>
                            )}
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {layoutLoading ? (
                        <div className="flex flex-col gap-6 w-full h-full">
                            {/* Header Skeleton */}
                            <div className="flex justify-between items-center w-full">
                                <div className="space-y-2">
                                    <div className="skeleton-shimmer h-6 w-48 rounded-lg animate-pulse" />
                                    <div className="skeleton-shimmer h-4 w-72 rounded-lg animate-pulse" />
                                </div>
                                <div className="skeleton-shimmer h-10 w-32 rounded-xl animate-pulse" />
                            </div>

                            {/* Main Body Skeleton */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="skeleton-shimmer h-44 rounded-2xl w-full animate-pulse" />
                                ))}
                            </div>
                        </div>
                    ) : children}
                </main>
            </div>

            {/* Confirm Logout Dialog */}
            <ConfirmDialog
                isOpen={logoutConfirmOpen}
                onClose={() => setLogoutConfirmOpen(false)}
                onConfirm={handleLogout}
                type="warning"
                title="Confirm Logout"
                description="Are you sure you want to log out of your session? You will need to sign in again to access patient records and exchange transactions."
                confirmLabel="Log Out"
                cancelLabel="Cancel"
            />

            <PreferencesModal
                isOpen={showPrefModal}
                onClose={() => setShowPrefModal(false)}
            />
        </div>
    )
}

export default DashboardLayout
