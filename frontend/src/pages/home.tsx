import { motion } from 'framer-motion'
import Button from '../components/shared/Button'
import ScrollReveal from '../components/shared/ScrollReveal'
import Accordion from '../components/shared/Accordion'

const capabilityCards = [
  {
    title: 'Protected Health Data',
    description: 'Granular, role-based access controls for consented patient records.',
  },
  {
    title: 'Secure Sharing',
    description: 'End-to-end encrypted exchange between providers, labs, and payers.',
  },
  {
    title: 'Privacy Rules',
    description: 'Built-in consent validation aligned with healthcare privacy workflows.',
  },
  {
    title: 'Audit Trail',
    description: 'Immutable logs that show who accessed what, when, and why.',
  },
  {
    title: 'API Access',
    description: 'Fast integration with hospital systems and third-party health tools.',
  },
  {
    title: 'Alert Security',
    description: 'Immediate notifications for unusual access attempts and policy mismatches.',
  },
]

const faqs = [
  {
    question: 'How does Moniveo protect patient privacy?',
    answer: 'We apply consent-aware access rules, encrypted exchange, and complete audit visibility across every interaction.',
  },
  {
    question: 'What systems can integrate?',
    answer: 'The platform is designed to connect with EHRs, internal hospital applications, and secure third-party data services.',
  },
  {
    question: 'Can patients control their data sharing preferences?',
    answer: 'Yes. Patients can define, review, and update sharing permissions so organizations follow their approved consent settings.',
  },
]

const Home = () => {
  return (
    <main className="pt-24 pb-16" style={{ backgroundColor: 'var(--color-background)' }}>
      <section className="mx-auto grid w-[82%] max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-xl">
          <div
            className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}
          >
            Healthcare Data Exchange
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl" style={{ color: 'var(--color-text)' }}>
            Empowering Patients.
            <br />
            <span style={{ color: 'var(--color-primary)' }}>Securing Records.</span>
            <br />
            Enabling Trusted Care.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
            Consent-based secure health information exchange built to modernize how hospitals share sensitive data.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" className="rounded-full px-7">
              Get Started
            </Button>
            <Button variant="default" size="lg" className="rounded-full px-7">
              Watch Demo
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span>Trusted by hospitals</span>
            <span>Consent-first workflow</span>
            <span>Auditable access</span>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute -left-8 top-10 h-24 w-24 rounded-full blur-2xl"
            style={{ backgroundColor: 'var(--color-primary-ghost)' }}
          />
          <div
            className="absolute -right-6 bottom-6 h-28 w-28 rounded-full blur-2xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 25%, transparent)' }}
          />
          <div
            className="relative rounded-4xl p-5 shadow-2xl"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="rounded-3xl p-4" style={{ backgroundColor: 'var(--color-background-alt)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-primary)' }}>
                    Exchange Request
                  </p>
                  <h3 className="mt-1 text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                    Hospital-to-Lab Transfer
                  </h3>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}
                >
                  Active
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  ['Patient', 'Sarah K.'],
                  ['Data Type', 'Radiology Reports'],
                  ['Consent Status', 'Verified'],
                  ['Destination', 'Metro Diagnostics'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl px-4 py-3"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex gap-3">
                <Button variant="primary" size="md" className="flex-1 rounded-xl">
                  Approve
                </Button>
                <Button variant="default" size="md" className="flex-1 rounded-xl">
                  Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 w-full overflow-hidden">
        <div className="border-y py-6" style={{ borderColor: 'var(--color-border)' }}>
          <div className="marquee-wrapper">
            <div className="marquee-track">
              {[...['Mercy Health', 'CityMed', 'LifePoint', 'HealthOne', 'BlueCross', 'LabNetwork', 'MedCore', 'VitalSync'], ...['Mercy Health', 'CityMed', 'LifePoint', 'HealthOne', 'BlueCross', 'LabNetwork', 'MedCore', 'VitalSync']].map((brand, i) => (
                <span
                  key={i}
                  className="mx-10 text-sm font-bold uppercase tracking-[0.2em] whitespace-nowrap"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-18 w-[82%] max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-primary)' }}>
            Core Capabilities
          </p>
          <h2 className="mt-3 text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Core Capabilities
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {capabilityCards.map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 0.08}>
              <motion.article
                className="rounded-3xl p-6 shadow-sm h-full cursor-default"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(139,124,246,0.18)', borderColor: 'var(--color-primary)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold"
                  style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}
                >
                  +
                </div>
                <h3 className="mt-4 text-lg font-bold" style={{ color: 'var(--color-text)' }}>{card.title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                  {card.description}
                </p>
              </motion.article>
            </ScrollReveal>
          ))}
        </div>
      </section>


      <section className="mx-auto mt-18 w-[82%] max-w-5xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-primary)' }}>
            Frequently Asked Questions
          </p>
          <h2 className="mt-3 text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mt-10">
          <Accordion items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-18 w-[82%] max-w-7xl px-6">
        <ScrollReveal>
          <div
            className="relative overflow-hidden rounded-3xl px-10 py-16 text-center"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {/* Background blobs */}
            <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />

            <p className="relative text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Get Started Today
            </p>
            <h2 className="relative mt-3 text-3xl font-black md:text-4xl" style={{ color: 'var(--color-text-on-primary)' }}>
              Ready to secure your health data exchange?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base leading-7" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Join hospitals already using Moniveo to manage patient consent, share records securely, and stay fully auditable.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="default"
                size="lg"
                className="rounded-full px-8"
              >
                Get Started Free
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full px-8"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'var(--color-text-on-primary)' }}
              >
                Book a Demo
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  )
}

export default Home
