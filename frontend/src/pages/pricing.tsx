import { useState, useEffect } from 'react'
import Button from '../components/shared/Button'
import TestimonialSlider from '../components/shared/TestimonialSlider'
import { pricingApi, type Plan } from '../services/pricing.service'

const staticPlans = [
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
  const [dbPlans, setDbPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isYearly, setIsYearly] = useState(false)

  useEffect(() => {
    pricingApi.listPlans({ limit: 100 })
      .then(res => {
        setDbPlans(res.data.plans.filter(p => p.isActive))
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  // Map static plans to uniform structure
  const staticMapped = staticPlans.map(p => {
    const isCustom = p.price === 'Custom'
    const num = isCustom ? 0 : parseFloat(p.price.replace('$', ''))
    return {
      id: p.name,
      name: p.name,
      badge: p.badge,
      description: p.description,
      monthlyPrice: num,
      yearlyPrice: isCustom ? 0 : Math.round(num * 10), // 2 months free discount
      currency: 'USD',
      cta: p.cta,
      features: p.features
    }
  })

  // Unified plans array
  const activePlans = dbPlans.length > 0
    ? dbPlans.map((p, idx) => ({
        id: p.id,
        name: p.name,
        badge: idx === 1 ? 'POPULAR' : null,
        description: p.description ?? '',
        monthlyPrice: Number(p.monthlyPrice),
        yearlyPrice: Number(p.yearlyPrice) || Math.round(Number(p.monthlyPrice) * 10),
        currency: p.currency,
        cta: 'Get Started',
        features: p.features ?? []
      }))
    : staticMapped

  return (
    <main className="pt-24 pb-16 min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>

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

        {/* Billing Switcher Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span 
            className="text-sm font-semibold transition-colors duration-200 cursor-pointer select-none"
            style={{ color: !isYearly ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
            onClick={() => setIsYearly(false)}
          >
            Monthly Billing
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            style={{ backgroundColor: isYearly ? 'var(--color-primary)' : 'var(--color-border)' }}
          >
            <span
              className="pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out"
              style={{
                backgroundColor: 'var(--color-background)',
                transform: isYearly ? 'translateX(20px)' : 'translateX(0px)'
              }}
            />
          </button>
          <span 
            className="text-sm font-semibold flex items-center gap-1.5 transition-colors duration-200 cursor-pointer select-none"
            style={{ color: isYearly ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
            onClick={() => setIsYearly(true)}
          >
            Yearly Billing
            <span className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase text-emerald-500 bg-[rgba(16,185,129,0.1)]">
              Save ~17%
            </span>
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto mt-14 w-[82%] max-w-7xl px-6">
        {loading && dbPlans.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" style={{ color: 'var(--color-primary)' }} />
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-3">
          {activePlans.map((plan) => {
            const isPopular = plan.badge === 'POPULAR'
            const isCustom = plan.monthlyPrice === 0
            
            const displayPrice = isCustom 
              ? 'Custom' 
              : `${plan.currency === 'USD' ? '$' : plan.currency + ' '}${isYearly ? plan.yearlyPrice : plan.monthlyPrice}`
            
            const displayPeriod = isCustom 
              ? '' 
              : (isYearly ? '/year' : '/month')

            return (
              <article
                key={plan.id}
                className="relative flex flex-col rounded-3xl p-7 transition-all duration-300 hover:translate-y-[-4px]"
                style={{
                  backgroundColor: isPopular ? 'var(--color-primary)' : 'var(--color-surface)',
                  border: `1px solid ${isPopular ? 'transparent' : 'var(--color-border)'}`,
                  boxShadow: isPopular ? '0 8px 32px rgba(139,124,246,0.35)' : '0 2px 8px rgba(0,0,0,0.04)',
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
                <div className="mt-6 flex flex-col gap-0.5">
                  <div className="flex items-end gap-1">
                    <span
                      className="text-5xl font-black"
                      style={{ color: isPopular ? 'var(--color-text-on-primary)' : 'var(--color-text)' }}
                    >
                      {displayPrice}
                    </span>
                    {displayPeriod && (
                      <span
                        className="mb-2 text-sm"
                        style={{ color: isPopular ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)' }}
                      >
                        {displayPeriod}
                      </span>
                    )}
                  </div>
                  {isYearly && !isCustom && (
                    <span 
                      className="text-xs" 
                      style={{ color: isPopular ? 'rgba(255,255,255,0.6)' : 'var(--color-text-secondary)' }}
                    >
                      Billed annually
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
