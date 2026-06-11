import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { AuthUser } from '../../types/auth.types'
import ConfirmDialog from './ConfirmDialog'
import Avatar from './Avatar'
import { useToast } from '../../Context/ToastContext'
import { tenantApi } from '../../services/tenant.service'
import { authApi } from '../../services/auth.service'

type Props = {
    user: AuthUser
    onClose: () => void
    onLogout: () => void
    onOpenPreferences: () => void
}

const ProfileDropdown = ({ user, onClose, onLogout, onOpenPreferences }: Props) => {
    const navigate     = useNavigate()
    const { showToast } = useToast()
    const ref          = useRef<HTMLDivElement>(null)
    const [deleting, setDeleting] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)

    // close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose()
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [onClose])

    // close on ESC
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    const handleDeleteAccount = async () => {
        setDeleting(true)
        try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
                try { await authApi.logout({ refreshToken }) } catch { /* silent */ }
            }
            if (user.id) {
                await tenantApi.deleteUser(user.id)
            }
            showToast('Account deactivated successfully', 'info')
            onLogout()
            navigate('/login')
        } catch (err: any) {
            showToast(err.message ?? 'Failed to delete account', 'error')
        } finally {
            setDeleting(false)
            setConfirmOpen(false)
        }
    }

    const displayName = user.name || user.email?.split('@')[0] || '—'

    return (
        <>
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: 'spring', duration: 0.3, damping: 24 }}
                className="absolute bottom-full left-2 right-2 mb-2 rounded-2xl shadow-2xl z-[200] overflow-hidden flex flex-col"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    backdropFilter: 'blur(20px)',
                    maxHeight: '480px',
                }}
            >
                {/* Avatar + Name header */}
                <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <Avatar name={displayName} image={user.profileImageUrl} />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text)' }}>{displayName}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{user.email}</p>
                    </div>
                </div>

                <div className="p-2 flex flex-col gap-1">
                    {[
                        { label: 'Open Profile', path: '/dashboard/profile' },
                        { label: 'Change Password', path: '/dashboard/change-password' },
                        { label: 'Settings', path: '/dashboard/settings' },
                    ].map(item => (
                        <button
                            key={`${item.label}-${item.path}`}
                            type="button"
                            onClick={() => { navigate(item.path); onClose() }}
                            className="w-full rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-all"
                            style={{ color: 'var(--color-text)', backgroundColor: 'transparent' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-primary-ghost)'; e.currentTarget.style.color = 'var(--color-primary)' }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text)' }}
                        >
                            {item.label}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => { onOpenPreferences(); onClose() }}
                        className="w-full rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-all"
                        style={{ color: 'var(--color-text)', backgroundColor: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-primary-ghost)'; e.currentTarget.style.color = 'var(--color-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text)' }}
                    >
                        Preferences
                    </button>

                    <button
                        type="button"
                        onClick={() => { navigate('/dashboard/notifications'); onClose() }}
                        className="w-full rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-all"
                        style={{ color: 'var(--color-text)', backgroundColor: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-primary-ghost)'; e.currentTarget.style.color = 'var(--color-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text)' }}
                    >
                        Notifications
                    </button>

                    <div className="mt-1 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <button
                            type="button"
                            onClick={() => setConfirmOpen(true)}
                            className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-left transition-all"
                            style={{ color: 'var(--color-error)', backgroundColor: 'transparent' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-error-light)' }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </motion.div>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDeleteAccount}
                type="danger"
                title="Delete Account"
                description="Are you sure you want to permanently delete your account? This action is irreversible and will deactivate your access immediately."
                confirmLabel="Delete Account"
                cancelLabel="Cancel"
                isLoading={deleting}
            />
        </>
    )
}

export default ProfileDropdown
