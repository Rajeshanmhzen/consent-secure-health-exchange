import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Testimonial = {
  quote: string
  name: string
  role: string
  initial: string
}

type TestimonialSliderProps = {
  testimonials: Testimonial[]
  interval?: number
}

const TestimonialSlider = ({ testimonials, interval = 3000 }: TestimonialSliderProps) => {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setActive((prev) => (prev + 1) % testimonials.length)
    }, interval)
    return () => clearInterval(timer)
  }, [testimonials.length, interval])

  const goTo = (index: number) => {
    setDirection(index > active ? 1 : -1)
    setActive(index)
  }

  const current = testimonials[active]

  return (
    <div
      className="mx-auto w-full max-w-3xl rounded-3xl px-8 py-10 text-center overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Avatar */}
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
        style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}
      >
        {current.initial}
      </div>

      {/* Quote */}
      <div className="relative mt-5 h-32">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.p
            key={active}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center text-lg font-medium leading-8"
            style={{ color: 'var(--color-text)' }}
          >
            {current.quote}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Name & Role */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`meta-${active}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
            {current.name}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {current.role}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              height: '6px',
              width: i === active ? '28px' : '8px',
              borderRadius: '9999px',
              backgroundColor: i === active ? 'var(--color-primary)' : 'var(--color-border-strong)',
              border: 'none',
              cursor: 'pointer',
              transition: 'width 300ms ease, background-color 300ms ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default TestimonialSlider
