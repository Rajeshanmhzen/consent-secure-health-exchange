import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

type ScrollRevealProps = {
  children: ReactNode
  delay?: number
  className?: string
}

const ScrollReveal = ({ children, delay = 0, className = '' }: ScrollRevealProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36, scale: 0.97, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

export default ScrollReveal
