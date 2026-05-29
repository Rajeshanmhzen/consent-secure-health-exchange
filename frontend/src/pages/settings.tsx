import { useCallback, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import { userApi } from '../services/user.service'
import { createRealtimeConnection } from '../services/realtime.service'
import DashboardLayout from '../components/layout/DashboardLayout'

const SettingsPage = () => {
    const { user } = useAuth()
    const { showToast } = useToast()
    const [preferences, setPreferences] = useState({
        emailEnabled: true,
        smsEnabled: false,
        inAppEnabled: true
    })
    const [savingStatus, setSavingStatus] = useState<'saved' | 'waiting' | 'saving' | 'error'>('saved')

    const debounceTimeoutRef = useRef<any>(null)

    const loadPreferences = useCallback((showError = true) => {
        if (!user) return
        userApi.getPreferences()
            .then(res => {
                setPreferences({
                    emailEnabled: res.data.emailEnabled,
                    smsEnabled: res.data.smsEnabled,
                    inAppEnabled: res.data.inAppEnabled
                })
                setSavingStatus('saved')
            })
            .catch(() => {
                if (showError) showToast('Failed to load notification settings', 'error')
            })
    }, [showToast, user])

    useEffect(() => {
        loadPreferences(true)
    }, [loadPreferences])

    useEffect(() => {
        if (!user) return
        const handleRefresh = () => loadPreferences(false)
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') loadPreferences(false)
        }
        const closeRealtime = createRealtimeConnection((event) => {
            if (event.type === 'NOTIFICATION_PREFERENCES_CHANGED' && event.payload.userId === user.id) {
                loadPreferences(false)
            }
        })
        window.addEventListener('focus', handleRefresh)
        document.addEventListener('visibilitychange', handleVisibility)
        return () => {
            closeRealtime()
            window.removeEventListener('focus', handleRefresh)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [loadPreferences, user])

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [])

    const handleToggle = (key: 'emailEnabled' | 'smsEnabled' | 'inAppEnabled') => {
        const previousState = preferences
        const nextState = {
            ...preferences,
            [key]: !preferences[key]
        }

        setPreferences(nextState)
        setSavingStatus('waiting')

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
        }

        debounceTimeoutRef.current = setTimeout(() => {
            setSavingStatus('saving')
            userApi.updatePreferences(nextState)
                .then((res) => {
                    setPreferences({
                        emailEnabled: res.data.emailEnabled,
                        smsEnabled: res.data.smsEnabled,
                        inAppEnabled: res.data.inAppEnabled
                    })
                    setSavingStatus('saved')
                    showToast('Settings saved successfully!', 'success')
                })
                .catch(() => {
                    setPreferences(previousState)
                    setSavingStatus('error')
                    showToast('Failed to save settings. Please try again.', 'error')
                })
        }, 600)
    }

    if (!user) return null

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="max-w-2xl flex flex-col gap-6"
            >
                <div className="flex flex-col gap-1 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
                        Settings & Preferences
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Configure your secure health exchange real-time notification alerts.
                    </p>
                </div>

                <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                    <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.91V4a1 1 0 0 0-2 0v1.09A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Notifications</h3>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Configure real-time alerts</p>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {savingStatus === 'saved' && (
                                <motion.span
                                    key="saved"
                                    initial={{ opacity: 0, x: 8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs font-bold text-emerald-500 bg-[rgba(16,185,129,0.1)] px-2.5 py-0.5 rounded-full flex items-center gap-1"
                                >
                                    ✓ Saved
                                </motion.span>
                            )}
                            {savingStatus === 'waiting' && (
                                <motion.span
                                    key="waiting"
                                    initial={{ opacity: 0, x: 8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs font-bold text-amber-500 bg-[rgba(245,158,11,0.1)] px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                                    Waiting to save...
                                </motion.span>
                            )}
                            {savingStatus === 'saving' && (
                                <motion.span
                                    key="saving"
                                    initial={{ opacity: 0, x: 8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs font-bold text-blue-500 bg-[rgba(59,130,246,0.1)] px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
                                >
                                    <svg className="animate-spin h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving to server...
                                </motion.span>
                            )}
                            {savingStatus === 'error' && (
                                <motion.span
                                    key="error"
                                    initial={{ opacity: 0, x: 8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs font-bold text-red-500 bg-[rgba(239,68,68,0.1)] px-2.5 py-0.5 rounded-full flex items-center gap-1"
                                >
                                    ⚠ Error
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        Toggling settings debounces communication to reduce instantaneous server request traffic and database lock queues.
                    </p>

                    <div className="flex flex-col gap-3.5 mt-2">
                        <div className="flex items-center justify-between p-3.5 rounded-xl border transition-all hover:scale-[1.01]" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}>
                            <div className="flex flex-col gap-0.5 pr-4">
                                <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Email Notifications</span>
                                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Receive exchange requests, consents, and account updates in inbox.</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle('emailEnabled')}
                                className="h-6 w-11 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center cursor-pointer select-none focus:outline-none shrink-0"
                                style={{ backgroundColor: preferences.emailEnabled ? 'var(--color-primary)' : 'rgba(0,0,0,0.2)' }}
                            >
                                <motion.span
                                    layout
                                    className="h-5 w-5 rounded-full bg-white shadow-md block"
                                    animate={{ x: preferences.emailEnabled ? 20 : 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl border transition-all hover:scale-[1.01]" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}>
                            <div className="flex flex-col gap-0.5 pr-4">
                                <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>SMS Notifications</span>
                                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Get instant text message notifications for critical emergency database events.</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle('smsEnabled')}
                                className="h-6 w-11 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center cursor-pointer select-none focus:outline-none shrink-0"
                                style={{ backgroundColor: preferences.smsEnabled ? 'var(--color-primary)' : 'rgba(0,0,0,0.2)' }}
                            >
                                <motion.span
                                    layout
                                    className="h-5 w-5 rounded-full bg-white shadow-md block"
                                    animate={{ x: preferences.smsEnabled ? 20 : 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl border transition-all hover:scale-[1.01]" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}>
                            <div className="flex flex-col gap-0.5 pr-4">
                                <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>In-App Alerts</span>
                                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Show interactive badge and modal notices directly inside the platform workspace.</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle('inAppEnabled')}
                                className="h-6 w-11 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center cursor-pointer select-none focus:outline-none shrink-0"
                                style={{ backgroundColor: preferences.inAppEnabled ? 'var(--color-primary)' : 'rgba(0,0,0,0.2)' }}
                            >
                                <motion.span
                                    layout
                                    className="h-5 w-5 rounded-full bg-white shadow-md block"
                                    animate={{ x: preferences.inAppEnabled ? 20 : 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    )
}

export default SettingsPage
