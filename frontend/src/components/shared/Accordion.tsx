import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type AccordionItem = {
  question: string
  answer: string
}

type AccordionProps = {
  items: AccordionItem[]
}

const Accordion = ({ items }: AccordionProps) => {
  const [active, setActive] = useState(0)

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = active === i
        return (
          <motion.div
            key={item.question}
            layout
            style={{
              backgroundColor: isOpen ? 'var(--color-surface)' : 'var(--color-surface)',
              border: `1px solid ${isOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: '1rem',
              overflow: 'hidden',
              transition: 'border-color 250ms ease',
            }}
          >
            {/* Question row */}
            <button
              onClick={() => setActive(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span
                className="text-base font-semibold"
                style={{ color: isOpen ? 'var(--color-primary)' : 'var(--color-text)' }}
              >
                {item.question}
              </span>

              {/* Arrow icon */}
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: isOpen ? 'var(--color-primary)' : 'var(--color-primary-ghost)',
                  color: isOpen ? 'var(--color-text-on-primary)' : 'var(--color-primary)',
                }}
              >
                +
              </motion.span>
            </button>

            {/* Answer */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <p
                    className="px-6 pb-5 text-sm leading-7"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

export default Accordion
