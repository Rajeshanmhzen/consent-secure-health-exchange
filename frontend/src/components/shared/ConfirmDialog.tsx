import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

type DialogType = 'danger' | 'warning' | 'info' | 'success'

type ConfirmDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  type?: DialogType
  isLoading?: boolean
}

const typeConfig = {
  danger: {
    iconBg: 'rgba(239, 68, 68, 0.1)',
    iconColor: 'rgb(239, 68, 68)',
    buttonBg: 'rgba(239, 68, 68, 0.12)',
    buttonHoverBg: 'rgba(239, 68, 68, 0.2)',
    buttonTextColor: 'rgb(239, 68, 68)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    )
  },
  warning: {
    iconBg: 'rgba(245, 158, 11, 0.1)',
    iconColor: 'rgb(245, 158, 11)',
    buttonBg: 'rgba(245, 158, 11, 0.12)',
    buttonHoverBg: 'rgba(245, 158, 11, 0.2)',
    buttonTextColor: 'rgb(245, 158, 11)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  },
  success: {
    iconBg: 'rgba(16, 185, 129, 0.1)',
    iconColor: 'rgb(16, 185, 129)',
    buttonBg: 'rgba(16, 185, 129, 0.12)',
    buttonHoverBg: 'rgba(16, 185, 129, 0.2)',
    buttonTextColor: 'rgb(16, 185, 129)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  },
  info: {
    iconBg: 'rgba(99, 102, 241, 0.1)',
    iconColor: 'rgb(99, 102, 241)',
    buttonBg: 'rgba(99, 102, 241, 0.12)',
    buttonHoverBg: 'rgba(99, 102, 241, 0.2)',
    buttonTextColor: 'rgb(99, 102, 241)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    )
  }
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'warning',
  isLoading = false
}: ConfirmDialogProps) => {
  const config = typeConfig[type]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={() => { if (!isLoading) onClose() }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-text)'
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full mb-4 shrink-0"
                style={{
                  backgroundColor: config.iconBg,
                  color: config.iconColor
                }}
              >
                {config.icon}
              </div>

              <h3 className="text-lg font-bold mb-2 leading-snug" style={{ color: 'var(--color-text)' }}>
                {title}
              </h3>

              <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                {description}
              </p>

              <div className="flex gap-3 w-full justify-end">
                <Button
                  type="button"
                  variant="default"
                  onClick={onClose}
                  disabled={isLoading}
                  className="rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  {cancelLabel}
                </Button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none"
                  style={{
                    backgroundColor: config.buttonBg,
                    color: config.buttonTextColor
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = config.buttonHoverBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = config.buttonBg
                  }}
                >
                  {isLoading ? 'Processing...' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog
