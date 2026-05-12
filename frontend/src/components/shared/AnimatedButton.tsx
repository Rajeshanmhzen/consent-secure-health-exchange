import React, { useState } from 'react'
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion'

type Ripple = { id: number; x: number; y: number }

type AnimatedButtonProps = Omit<HTMLMotionProps<'button'>, 'onClick' | 'children'> & {
  children?:React.ReactNode
  rippleColor?: string
  rippleBg?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const AnimatedButton = ({ children, className = '', rippleColor = 'rgba(255,255,255,0.3)', rippleBg, onClick, ...rest }: AnimatedButtonProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples((p) => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 600)
    onClick?.(e)
  }

  return (
    <motion.button
      {...rest}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            style={{ left: r.x, top: r.y, translateX: '-50%', translateY: '-50%', backgroundColor: rippleBg ?? rippleColor, position: 'absolute', borderRadius: '9999px', pointerEvents: 'none' }}
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
          />
        ))}
      </AnimatePresence>
      {children}
    </motion.button>
  )
}

export default AnimatedButton
