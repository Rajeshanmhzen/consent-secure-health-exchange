import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../hooks/useTheme'
import type { ThemePreference, DarkVariant } from '../../types/theme.types'
import Button from './Button'

type PreferencesModalProps = {
  isOpen: boolean
  onClose: () => void
}

const PreferencesModal = ({ isOpen, onClose }: PreferencesModalProps) => {
  const { theme, themePreference, setThemePreference, darkVariant, setDarkVariant } = useTheme()

  const modes: { key: ThemePreference; label: string; icon: React.ReactNode }[] = [
    {
      key: 'light',
      label: 'Light Mode',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )
    },
    {
      key: 'dark',
      label: 'Dark Mode',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )
    },
    {
      key: 'system',
      label: 'System',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      )
    }
  ]

  const darkAccents: { key: DarkVariant; label: string; color: string; bg: string }[] = [
    {
      key: 'classic',
      label: 'Classic Indigo',
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.15)'
    },
    {
      key: 'emerald',
      label: 'Emerald Green',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.15)'
    },
    {
      key: 'ocean',
      label: 'Ocean Blue',
      color: '#0EA5E9',
      bg: 'rgba(14, 165, 233, 0.15)'
    }
  ]

  const isDarkModeActive = theme.mode === 'dark'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'color-mix(in srgb, var(--color-surface) 82%, transparent)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-text)'
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M7.5 10.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                  <path d="M11.5 7.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                  <path d="M16.5 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                  <path d="M15.5 14.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>UI Preferences</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Personalize your dashboard appearance</p>
              </div>
            </div>

            {/* Mode Section */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider block mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Theme Mode
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {modes.map(mode => {
                  const isActive = themePreference === mode.key
                  return (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setThemePreference(mode.key)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all duration-200 select-none ${isActive ? 'scale-102 shadow-sm' : 'opacity-70 hover:opacity-100'}`}
                      style={{
                        backgroundColor: isActive ? 'var(--color-primary-ghost)' : 'transparent',
                        borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                        color: isActive ? 'var(--color-primary)' : 'var(--color-text)'
                      }}
                    >
                      <div className="mb-1.5">{mode.icon}</div>
                      {mode.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Dark Variant Section */}
            <AnimatePresence>
              {isDarkModeActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="mb-6 overflow-hidden"
                >
                  <label className="text-xs font-bold uppercase tracking-wider block mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    Dark Theme Accent Color
                  </label>
                  <div className="flex flex-col gap-2">
                    {darkAccents.map(accent => {
                      const isActive = darkVariant === accent.key
                      return (
                        <button
                          key={accent.key}
                          type="button"
                          onClick={() => setDarkVariant(accent.key)}
                          className="flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all duration-150 select-none"
                          style={{
                            backgroundColor: isActive ? accent.bg : 'transparent',
                            borderColor: isActive ? accent.color : 'var(--color-border)',
                            color: 'var(--color-text)'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-3.5 w-3.5 rounded-full block border" style={{ backgroundColor: accent.color, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                            <span>{accent.label}</span>
                          </div>
                          {isActive && (
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={accent.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <Button type="button" variant="primary" size="md" onClick={onClose} className="rounded-xl px-5 py-2 font-bold">
                Done
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PreferencesModal
