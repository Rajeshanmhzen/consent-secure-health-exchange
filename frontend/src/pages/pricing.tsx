import Button from '../components/shared/Button'
import TestimonialSlider from '../components/shared/TestimonialSlider'

const plans = [
  {
    name: 'Starter',
    badge: null,
    description: 'For small clinics getting started with secure health data exchange.',
    price: '$49',
    period: '/month',
    cta: 'Get Started',
    features: [
      'Up to 3 doctors',
      'Basic consent workflows',
      'Patient record management',
      'OTP-based verification',
      'Audit logs (30 days)',
      'Email notifications',
      'Standard support',
    ],
  },
  {
    name: 'Professional',
    badge: 'POPULAR',
    description: 'For growing hospitals managing multi-doctor consent workflows.',
    price: '$149',
    period: '/month',
    cta: 'Get Started',
    features: [
      'Everything in Starter, plus:',
      'Unlimited doctors',
      'Emergency access workflows',
      'Cross-hospital data sharing',
      'Audit logs (1 year)',
      'SMS & in-app notifications',
      'Role-based access control',
      'Priority support with SLA',
    ],
  },
  {
    name: 'Enterprise',
    badge: null,
    description: 'For large hospital networks with complex compliance requirements.',
    price: 'Custom',
    period: '',
    cta: 'Contact Us',
    features: [
      'Everything in Professional, plus:',
      'Unlimited tenants & hospitals',
      'Custom subscription plans',
      'Dedicated infrastructure',
      'Advanced audit & compliance',
      'Custom email templates',
      'API access',
      'Dedicated account manager',
    ],
  },
]

const testimonials = [
  {
    quote: '"Moniveo transformed how our hospital manages patient consent. The dual-approval workflow gives our patients full control while keeping our staff compliant."',
    name: 'Dr. Priya Sharma',
    role: 'Chief Medical Officer, CityMed Hospital',
    initial: 'P',
  },
  {
    quote: '"The emergency access workflow saved critical time during an urgent case. Fully audited and compliant — exactly what we needed."',
    name: 'Dr. Arjun Mehta',
    role: 'Head of Emergency, Mercy Health',
    initial: 'A',
  },
  {
    quote: '"Setting up cross-hospital data sharing used to take weeks. With Moniveo it took a day, and patients stay in control throughout."',
    name: 'Sarah Collins',
    role: 'IT Director, LifePoint Network',
    initial: 'S',
  },
]

const Pricing = () => {
  return (
    <main className="pt-24 pb-16" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Header */}
      <section className="mx-auto w-[82%] max-w-4xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--color-primary)' }}>
          Pricing
        </p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl" style={{ color: 'var(--color-text)' }}>
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
          From single clinics to large hospital networks, find the plan that fits your scale.
          All plans include consent-first workflows and full audit logging.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto mt-14 w-[82%] max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isPopular = plan.badge === 'POPULAR'
            return (
              <article
                key={plan.name}
                className="relative flex flex-col rounded-3xl p-7"
                style={{
                  backgroundColor: isPopular ? 'var(--color-primary)' : 'var(--color-surface)',
                  border: `1px solid ${isPopular ? 'transparent' : 'var(--color-border)'}`,
                  boxShadow: isPopular ? '0 8px 32px rgba(139,124,246,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {/* Badge */}
                {isPopular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest"
                    style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-primary)' }}
                  >
                    Popular
                  </span>
                )}

                {/* Plan name & description */}
                <p
                  className="text-xl font-bold"
                  style={{ color: isPopular ? 'var(--color-text-on-primary)' : 'var(--color-text)' }}
                >
                  {plan.name}
                </p>
                <p
                  className="mt-2 text-sm leading-6"
                  style={{ color: isPopular ? 'rgba(255,255,255,0.75)' : 'var(--color-text-secondary)' }}
                >
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-6 flex items-end gap-1">
                  <span
                    className="text-5xl font-black"
                    style={{ color: isPopular ? 'var(--color-text-on-primary)' : 'var(--color-text)' }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className="mb-2 text-sm"
                      style={{ color: isPopular ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)' }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-6">
                  <Button
                    variant={isPopular ? 'default' : 'primary'}
                    size="md"
                    className="w-full rounded-xl"
                  >
                    {plan.cta}
                  </Button>
                </div>

                {/* Divider */}
                <div
                  className="my-6 h-px w-full"
                  style={{ backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : 'var(--color-border)' }}
                />

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : 'var(--color-primary-ghost)',
                          color: isPopular ? 'var(--color-text-on-primary)' : 'var(--color-primary)',
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ color: isPopular ? 'rgba(255,255,255,0.85)' : 'var(--color-text-secondary)' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      {/* Testimonial Slider */}
      <section className="mx-auto mt-20 w-[82%] max-w-3xl px-6 text-center">
        <TestimonialSlider testimonials={testimonials} interval={3000} />
      </section>

    </main>
  )
}

export default Pricing
