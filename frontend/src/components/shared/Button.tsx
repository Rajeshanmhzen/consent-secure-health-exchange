import React, { useState } from 'react'
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion'

type Ripple = { id: number; x: number; y: number }

type Variant = 'default' | 'primary' | 'outline' | 'ghost' | 'danger' | 'success'

const variantStyles: Record<Variant, string> = {
  default: 'bg-[var(--color-surface-elevated)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
  primary: 'bg-[var(--color-primary)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-primary-dark)]',
  outline: 'bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary-ghost)]',
  ghost:   'bg-[var(--color-primary-ghost)] text-[var(--color-primary)] hover:bg-[var(--color-primary-ghost)]',
  danger:  'bg-[var(--color-error)] text-white hover:opacity-90',
  success: 'bg-[var(--color-success)] text-white hover:opacity-90',
}

type Size = 'sm' | 'md' | 'lg' | 'icon'

const sizeStyles: Record<Size, string> = {
  sm:   'px-3 py-1.5 text-xs rounded-md font-medium',
  md:   'px-5 py-2.5 text-sm rounded-lg font-semibold',
  lg:   'px-7 py-3 text-base rounded-xl font-semibold',
  icon: 'p-2 rounded-lg',
}

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'onClick' | 'children'> & {
  children?: React.ReactNode
  variant?: Variant
  size?: Size
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  rippleColor?: string
  rippleBg?: string
  isLoading?: boolean
  loadingText?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const Button = ({
  children,
  variant,
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  rippleColor,
  rippleBg,
  isLoading = false,
  loadingText,
  onClick,
  disabled,
  ...rest
}: ButtonProps) => {
  const resolvedRippleColor = rippleBg ?? rippleColor ?? (['outline', 'ghost', 'default'].includes(variant ?? '') ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.3)')
  const [ripples, setRipples] = useState<Ripple[]>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples((p) => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 600)
    onClick?.(e)
  }

  return (
    <motion.button
      {...rest}
      disabled={disabled || isLoading}
      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 ${variantStyles[variant ?? 'default']} ${sizeStyles[size]} ${className} ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      whileHover={isLoading ? undefined : { scale: 1.03 }}
      whileTap={isLoading ? undefined : { scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <AnimatePresence>
        {!isLoading && ripples.map((r) => (
          <motion.span
            key={r.id}
            style={{ left: r.x, top: r.y, translateX: '-50%', translateY: '-50%', backgroundColor: resolvedRippleColor, position: 'absolute', borderRadius: '9999px', pointerEvents: 'none' }}
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
          />
        ))}
      </AnimatePresence>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
          <span>{loadingText ?? children}</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0 inline-flex">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0 inline-flex">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  )
}

export default Button
