import { motion } from 'framer-motion'
import Button from '../components/shared/Button'
import ScrollReveal from '../components/shared/ScrollReveal'

const capabilityCards = [
  {
    title: 'Consent-Based Sharing',
    description: 'Dual-consent flow (patient + doctor) before any data is shared across tenants.',
  },
  {
    title: 'Medical Records',
    description: 'Manage diagnosis, prescriptions, notes, and attached files with soft delete support.',
  },
  {
    title: 'Emergency Access',
    description: 'Time-limited, heavily audited emergency access workflows for critical care.',
  },
  {
    title: 'Multi-Tenant',
    description: 'Isolated hospital tenants with subscription management via Super Admin.',
  },
  {
    title: 'Audit Logging',
    description: 'Every critical action is immutably logged with user, metadata, and IP address.',
  },
  {
    title: 'Robust Security',
    description: 'JWT Auth, OTP verification, bcrypt hashing, and refresh token rotation.',
  },
]

const featureSections = [
  {
    badge: 'Consent Management',
    title: 'Dual-Consent Flow',
    description:
      'A secure handshake between doctors and patients ensures data is only shared when explicitly approved by both parties.',
    button: 'Explore Consent UI',
    imageLabel: 'Patient Consent Dashboard Screen',
    reverse: false,
  },
  {
    badge: 'Clinical Tools',
    title: 'Rich Medical Records',
    description:
      'Doctors can seamlessly create and manage detailed diagnoses, prescriptions, and file attachments, complete with soft-delete tracking.',
    button: 'View Records UI',
    imageLabel: 'Medical Records Editor',
    reverse: true,
  },
]

const FeaturePage = () => {
  return (
    <main className="pt-24 pb-16" style={{ backgroundColor: 'var(--color-background)' }}>
      <section className="mx-auto w-[82%] max-w-7xl px-6 py-10 text-center">
        <h1 className="text-4xl font-black leading-tight md:text-5xl" style={{ color: 'var(--color-text)' }}>
          Everything you need to exchange data safely.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
          A complete suite of tools designed for doctors, patients, and hospital administrators.
        </p>
      </section>

      <section className="border-y py-14" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mx-auto w-[82%] max-w-7xl px-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-black" style={{ color: 'var(--color-text)' }}>Core Capabilities</h2>
            <p className="mt-3 text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              Designed for compliance, transparency, and security in health data exchange.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {capabilityCards.map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 0.08}>
                <motion.article
                  className="rounded-2xl p-6 shadow-sm h-full cursor-default"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(139,124,246,0.18)', borderColor: 'var(--color-primary)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div
                    className="h-9 w-9 rounded-lg"
                    style={{ backgroundColor: 'var(--color-background-alt)', border: '1px solid var(--color-border)' }}
                  />
                  <h3 className="mt-5 text-base font-bold" style={{ color: 'var(--color-text)' }}>{card.title}</h3>
                  <p className="mt-3 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                    {card.description}
                  </p>
                </motion.article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-[82%] max-w-7xl px-6 py-14">
        <div className="space-y-10">
          {featureSections.map((section, i) => (
            <div
              key={section.title}
              className={`grid items-center gap-14 ${section.reverse ? 'lg:grid-cols-[1.1fr_0.9fr]' : 'lg:grid-cols-[0.9fr_1.1fr]'}`}
            >
              <ScrollReveal delay={0.1} className={section.reverse ? 'order-2 lg:order-1' : ''}>
                <div
                  className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}
                >
                  {section.badge}
                </div>
                <h3 className="mt-5 text-3xl font-black" style={{ color: 'var(--color-text)' }}>{section.title}</h3>
                <p className="mt-4 max-w-md text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
                  {section.description}
                </p>
                <Button variant="default" size="md" className="mt-6 rounded-full px-5">
                  {section.button}
                </Button>
              </ScrollReveal>

              <ScrollReveal delay={0.2} className={section.reverse ? 'order-1 lg:order-2' : ''}>
                <div
                  className="flex h-64 items-center justify-center rounded-2xl text-xs"
                  style={{
                    backgroundColor: 'var(--color-background-alt)',
                    border: '1px dashed var(--color-border-strong)',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  {section.imageLabel}
                </div>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default FeaturePage
