import DashboardLayout from '../layout/DashboardLayout'
import { Skeleton } from '@mantine/core'

type AuthSplitSkeletonProps = {
  variant?: 'login' | 'register'
}

const SkeletonBlock = ({ className = '', style }: { className?: string, style?: React.CSSProperties }) => (
  <Skeleton className={`rounded-2xl ${className}`} style={style} />
)

/* ============================================================
   REUSABLE: Dashboard table skeleton shell
   header -> search bar -> filter tabs -> table header -> rows
   ============================================================ */
const DashTableSkeleton = ({
  headerWidth = 'w-48',
  subtitleWidth = 'w-64',
  showButton = false,
  tabCount = 3,
  columns,
  rows = 5,
  showStats = false,
  statsCount = 3,
}: {
  headerWidth?: string
  subtitleWidth?: string
  showButton?: boolean
  tabCount?: number
  columns: { span: string; width: string }[]
  rows?: number
  showStats?: boolean
  statsCount?: number
}) => (
  <DashboardLayout>
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <div>
          <SkeletonBlock className={`h-6 ${headerWidth} rounded-full`} />
          <SkeletonBlock className={`mt-2 h-4 ${subtitleWidth} rounded-full`} />
        </div>
        {showButton && <SkeletonBlock className="h-10 w-32 rounded-xl" />}
      </div>

      {/* Optional stat cards */}
      {showStats && (
        <div className={`grid gap-4 sm:grid-cols-${statsCount}`}>
          {Array.from({ length: statsCount }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <SkeletonBlock className="h-3 w-20 rounded-full" />
              <SkeletonBlock className="mt-3 h-7 w-14 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <SkeletonBlock className="h-4 w-4 rounded-full shrink-0" />
        <SkeletonBlock className="h-4 flex-1 max-w-sm rounded-full" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-4 border-b pb-2" style={{ borderColor: 'var(--color-border)' }}>
        {Array.from({ length: tabCount }).map((_, i) => (
          <SkeletonBlock key={i} className={`h-4 ${i === 0 ? 'w-20' : 'w-16'} rounded-full`} />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3.5" style={{ backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
          {columns.map((col, i) => (
            <div key={i} className={col.span}>
              <SkeletonBlock className={`h-3 ${col.width} rounded-full`} />
            </div>
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            {columns.map((col, j) => (
              <div key={j} className={`${col.span} flex flex-col gap-1.5`}>
                <SkeletonBlock className={`h-4 ${col.width} rounded-full`} />
                {j === 0 && <SkeletonBlock className="h-3 w-16 rounded-full" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
)

export const FeatureSkeleton = () => {
  return (
    <main className="pt-24 pb-16" style={{ backgroundColor: 'var(--color-background)' }}>
      <section className="mx-auto w-[82%] max-w-7xl px-6 py-10 text-center">
        <SkeletonBlock className="mx-auto h-12 w-full max-w-2xl rounded-3xl" />
        <SkeletonBlock className="mx-auto mt-4 h-4 w-full max-w-xl rounded-full" />
        <SkeletonBlock className="mx-auto mt-2 h-4 w-3/4 max-w-md rounded-full" />
      </section>

      <section className="border-y py-14" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mx-auto w-[82%] max-w-7xl px-6">
          <div className="max-w-xl">
            <SkeletonBlock className="h-9 w-56 rounded-2xl" />
            <SkeletonBlock className="mt-3 h-4 w-full max-w-lg rounded-full" />
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="rounded-2xl p-6"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <SkeletonBlock className="h-9 w-9 rounded-lg" />
                <SkeletonBlock className="mt-5 h-5 w-36 rounded-full" />
                <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />
                <SkeletonBlock className="mt-2 h-4 w-5/6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-[82%] max-w-7xl px-6 py-14">
        <div className="space-y-10">
          {[false, true].map((reverse, index) => (
            <div
              key={index}
              className={`grid items-center gap-14 ${reverse ? 'lg:grid-cols-[1.1fr_0.9fr]' : 'lg:grid-cols-[0.9fr_1.1fr]'}`}
            >
              <div className={reverse ? 'order-2 lg:order-1' : ''}>
                <SkeletonBlock className="h-6 w-36 rounded-full" />
                <SkeletonBlock className="mt-5 h-10 w-64 rounded-3xl" />
                <SkeletonBlock className="mt-4 h-4 w-full max-w-md rounded-full" />
                <SkeletonBlock className="mt-2 h-4 w-5/6 max-w-sm rounded-full" />
                <SkeletonBlock className="mt-6 h-10 w-32 rounded-full" />
              </div>
              <div className={reverse ? 'order-1 lg:order-2' : ''}>
                <div
                  className="rounded-2xl p-4"
                  style={{ backgroundColor: 'var(--color-background-alt)', border: '1px dashed var(--color-border-strong)' }}
                >
                  <SkeletonBlock className="h-64 w-full rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export const HomeSkeleton = () => {
  return (
    <main className="pt-24 pb-16" style={{ backgroundColor: 'var(--color-background)' }}>
      <section className="mx-auto grid w-[82%] max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-xl">
          <SkeletonBlock className="h-7 w-44 rounded-full" />
          <div className="mt-5 space-y-3">
            <SkeletonBlock className="h-14 w-full max-w-xl rounded-3xl" />
            <SkeletonBlock className="h-14 w-5/6 max-w-lg rounded-3xl" />
            <SkeletonBlock className="h-14 w-4/5 max-w-md rounded-3xl" />
          </div>
          <div className="mt-5 space-y-3">
            <SkeletonBlock className="h-4 w-full max-w-lg rounded-full" />
            <SkeletonBlock className="h-4 w-4/5 max-w-md rounded-full" />
          </div>
          <div className="mt-7 flex gap-3">
            <SkeletonBlock className="h-12 w-36 rounded-full" />
            <SkeletonBlock className="h-12 w-36 rounded-full" />
          </div>
          <div className="mt-8 flex flex-wrap gap-6">
            <SkeletonBlock className="h-4 w-32 rounded-full" />
            <SkeletonBlock className="h-4 w-36 rounded-full" />
            <SkeletonBlock className="h-4 w-28 rounded-full" />
          </div>
        </div>

        <div
          className="rounded-4xl p-5 shadow-xl"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="rounded-3xl p-4" style={{ backgroundColor: 'var(--color-background-alt)' }}>
            <div className="flex items-center justify-between">
              <div>
                <SkeletonBlock className="h-3 w-28 rounded-full" />
                <SkeletonBlock className="mt-3 h-7 w-52 rounded-2xl" />
              </div>
              <SkeletonBlock className="h-8 w-20 rounded-full" />
            </div>
            <div className="mt-5 grid gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl px-4 py-3"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <SkeletonBlock className="h-4 w-24 rounded-full" />
                  <SkeletonBlock className="h-4 w-32 rounded-full" />
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <SkeletonBlock className="h-10 flex-1 rounded-xl" />
              <SkeletonBlock className="h-10 flex-1 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 w-[82%] max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-y py-5" style={{ borderColor: 'var(--color-border)' }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <SkeletonBlock key={item} className="h-4 w-24 rounded-full" />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-18 w-[82%] max-w-7xl px-6">
        <div className="text-center">
          <SkeletonBlock className="mx-auto h-4 w-40 rounded-full" />
          <SkeletonBlock className="mx-auto mt-4 h-10 w-64 rounded-2xl" />
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="rounded-3xl p-6"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <SkeletonBlock className="h-11 w-11" />
              <SkeletonBlock className="mt-4 h-6 w-40" />
              <SkeletonBlock className="mt-3 h-4 w-full" />
              <SkeletonBlock className="mt-2 h-4 w-5/6" />
              <SkeletonBlock className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-18 w-[82%] max-w-7xl px-6">
        <div
          className="rounded-4xl px-6 py-10"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <SkeletonBlock className="mx-auto h-4 w-48 rounded-full" />
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="rounded-2xl px-4 py-5 text-center"
                style={{ backgroundColor: 'var(--color-background-alt)', border: '1px solid var(--color-border)' }}
              >
                <SkeletonBlock className="mx-auto h-10 w-10 rounded-full" />
                <SkeletonBlock className="mx-auto mt-3 h-4 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-18 w-[82%] max-w-5xl px-6">
        <div className="text-center">
          <SkeletonBlock className="mx-auto h-4 w-48 rounded-full" />
          <SkeletonBlock className="mx-auto mt-4 h-10 w-72 rounded-2xl" />
        </div>
        <div className="mt-10 space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-3xl p-6"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <SkeletonBlock className="h-5 w-3/4" />
              <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />
              <SkeletonBlock className="mt-2 h-4 w-5/6 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export const ContactSkeleton = () => {
  return (
    <div className="mx-auto w-[82%] max-w-7xl px-6 py-10">
      <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-md text-center lg:text-left">
          <SkeletonBlock className="h-6 w-28 rounded-full" />
          <div className="mt-4 space-y-3">
            <SkeletonBlock className="h-12 w-72 rounded-3xl" />
            <SkeletonBlock className="h-12 w-56 rounded-3xl" />
          </div>
          <div className="mt-4 space-y-2">
            <SkeletonBlock className="h-4 w-full rounded-full" />
            <SkeletonBlock className="h-4 w-5/6 rounded-full" />
          </div>
          <div className="mt-10 grid gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-y-2">
                <SkeletonBlock className="h-4 w-16 rounded-full" />
                <SkeletonBlock className="h-4 w-40 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div
          className="w-full max-w-xl rounded-4xl p-6 shadow-xl md:p-8"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-16 rounded-full" />
              <SkeletonBlock className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-16 rounded-full" />
              <SkeletonBlock className="h-10 rounded-lg" />
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="space-y-2">
                <SkeletonBlock className="h-3 w-24 rounded-full" />
                <SkeletonBlock className="h-10.5 rounded-lg" />
              </div>
            ))}
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-16 rounded-full" />
              <SkeletonBlock className="h-30 rounded-lg" />
            </div>
            <SkeletonBlock className="mt-2 h-12 rounded-xl" />
            <div className="flex justify-center">
              <SkeletonBlock className="h-8 w-4/5 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const PricingSkeleton = () => {
  return (
    <main className="pt-24 pb-16 min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <section className="mx-auto w-[82%] max-w-4xl px-6 text-center animate-pulse">
        <SkeletonBlock className="mx-auto h-4 w-16 rounded-full" />
        <SkeletonBlock className="mx-auto mt-4 h-12 w-full max-w-lg rounded-3xl" />
        <SkeletonBlock className="mx-auto mt-5 h-4 w-full max-w-xl rounded-full" />
        <SkeletonBlock className="mx-auto mt-2 h-4 w-3/4 max-w-md rounded-full" />

        {/* Billing Switcher Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <SkeletonBlock className="h-4 w-28 rounded-full" />
          <SkeletonBlock className="h-6 w-11 rounded-full" />
          <SkeletonBlock className="h-4 w-36 rounded-full" />
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto mt-14 w-[82%] max-w-7xl px-6 animate-pulse">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((item, index) => {
            const isPopular = index === 1

            return (
              <article
                key={item}
                className="relative flex flex-col rounded-3xl p-7"
                style={{
                  backgroundColor: isPopular ? 'var(--color-primary)' : 'var(--color-surface)',
                  border: `1px solid ${isPopular ? 'transparent' : 'var(--color-border)'}`,
                  boxShadow: isPopular ? '0 8px 32px rgba(139,124,246,0.35)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {/* Badge */}
                {isPopular && (
                  <SkeletonBlock 
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full h-6 w-20" 
                    style={{ backgroundColor: 'var(--color-background)' }}
                  />
                )}

                {/* Plan name & description */}
                <SkeletonBlock 
                  className="h-7 w-32 rounded-full" 
                  style={{ backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : undefined }}
                />
                <SkeletonBlock 
                  className="mt-3 h-4 w-full rounded-full" 
                  style={{ backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : undefined }}
                />
                <SkeletonBlock 
                  className="mt-2 h-4 w-4/5 rounded-full" 
                  style={{ backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : undefined }}
                />

                {/* Price */}
                <div className="mt-6 flex flex-col gap-0.5">
                  <div className="flex items-end gap-2">
                    <SkeletonBlock 
                      className="h-12 w-28 rounded-2xl" 
                      style={{ backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : undefined }}
                    />
                    <SkeletonBlock 
                      className="mb-2 h-4 w-14 rounded-full" 
                      style={{ backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : undefined }}
                    />
                  </div>
                  <SkeletonBlock 
                    className="mt-1 h-3 w-20 rounded-full" 
                    style={{ backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : undefined }}
                  />
                </div>

                {/* CTA */}
                <div className="mt-6">
                  <SkeletonBlock 
                    className="h-11 w-full rounded-xl" 
                    style={{ backgroundColor: isPopular ? 'rgba(255,255,255,0.3)' : undefined }}
                  />
                </div>

                {/* Divider */}
                <div
                  className="my-6 h-px w-full"
                  style={{ backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : 'var(--color-border)' }}
                />

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <SkeletonBlock 
                        className="h-5 w-5 shrink-0 rounded-full" 
                        style={{ backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : undefined }}
                      />
                      <SkeletonBlock 
                        className="h-4 w-full rounded-full" 
                        style={{ backgroundColor: isPopular ? 'rgba(255,255,255,0.2)' : undefined }}
                      />
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      {/* Testimonial Slider */}
      <section className="mx-auto mt-20 w-[82%] max-w-3xl px-6 animate-pulse">
        <div
          className="rounded-3xl px-8 py-10 text-center"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <SkeletonBlock className="mx-auto h-12 w-12 rounded-full" />
          <SkeletonBlock className="mx-auto mt-5 h-5 w-full max-w-lg rounded-full" />
          <SkeletonBlock className="mx-auto mt-3 h-5 w-5/6 max-w-md rounded-full" />
          <SkeletonBlock className="mx-auto mt-5 h-4 w-36 rounded-full" />
          <SkeletonBlock className="mx-auto mt-2 h-3 w-48 rounded-full" />
        </div>
      </section>
    </main>
  )
}

export const AuthSplitSkeleton = ({ variant = 'login' }: AuthSplitSkeletonProps) => {
  return (
    <main className="min-h-screen pt-24" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="mx-auto grid w-[82%] max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <div className="max-w-md">
          <SkeletonBlock className="h-7 w-36 rounded-full" />
          <div className="mt-4 space-y-3">
            <SkeletonBlock className="h-12 w-full max-w-md rounded-3xl" />
            <SkeletonBlock className="h-12 w-5/6 max-w-sm rounded-3xl" />
          </div>
          <div className="mt-4 space-y-2">
            <SkeletonBlock className="h-4 w-full max-w-lg rounded-full" />
            <SkeletonBlock className="h-4 w-5/6 max-w-md rounded-full" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="rounded-2xl p-4"
                style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}
              >
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <SkeletonBlock className="mt-3 h-5 w-24 rounded-full" />
                <SkeletonBlock className="mt-2 h-4 w-full rounded-full" />
                <SkeletonBlock className="mt-2 h-4 w-4/5 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div
          className="w-full max-w-lg justify-self-center rounded-3xl p-10 shadow-xl lg:justify-self-end"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <SkeletonBlock className="h-8 w-40" />
          <SkeletonBlock className="mt-3 h-4 w-56 rounded-full" />
          <div className="mt-8 space-y-4">
            {variant === 'register' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <SkeletonBlock className="h-14 rounded-xl" />
                <SkeletonBlock className="h-14 rounded-xl" />
              </div>
            )}
            <SkeletonBlock className="h-14 rounded-xl" />
            {variant === 'register' && <SkeletonBlock className="h-14 rounded-xl" />}
            <SkeletonBlock className="h-14 rounded-xl" />
            {variant === 'register' && <SkeletonBlock className="h-14 rounded-xl" />}
            <SkeletonBlock className="h-3 w-24 rounded-full" />
            <SkeletonBlock className="h-12 rounded-xl" />
            <div className="mt-4">
              <SkeletonBlock className="h-4 w-full rounded-full" />
              <div className="mt-4 flex gap-3">
                <SkeletonBlock className="h-11 flex-1 rounded-xl" />
                <SkeletonBlock className="h-11 flex-1 rounded-xl" />
              </div>
              <SkeletonBlock className="mx-auto mt-4 h-4 w-40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// ── RequestsSkeleton: rendered INSIDE the table div in requests.tsx ──
export const RequestsSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="grid grid-cols-12 items-center px-5 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="col-span-3 flex flex-col gap-1.5 pr-2">
          <SkeletonBlock className="h-4 w-28 rounded-full" />
          <SkeletonBlock className="h-3 w-20 rounded-full" />
        </div>
        <div className="col-span-3 flex flex-col gap-1.5 pr-2">
          <SkeletonBlock className="h-4 w-32 rounded-full" />
          <SkeletonBlock className="h-3 w-24 rounded-full" />
        </div>
        <SkeletonBlock className="col-span-2 h-3 w-20 rounded-full pr-2" />
        <div className="col-span-2 flex justify-center">
          <SkeletonBlock className="h-5 w-20 rounded-full" />
        </div>
        <div className="col-span-2 flex justify-end">
          <SkeletonBlock className="h-7 w-16 rounded-lg" />
        </div>
      </div>
    ))}
  </>
)

// ── ConsentSkeleton: rendered INSIDE the table div in consent.tsx ──
// export const ConsentSkeleton = () => (
//   <>
//     {[1, 2, 3, 4, 5].map(i => (
//       <div key={i} className="grid grid-cols-12 items-center px-5 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
//         <div className="col-span-3 flex flex-col gap-1.5 pr-2">
//           <SkeletonBlock className="h-4 w-32 rounded-full" />
//           <SkeletonBlock className="h-3 w-24 rounded-full" />
//         </div>
//         <SkeletonBlock className="col-span-3 h-4 w-36 rounded-full pr-2" />
//         <SkeletonBlock className="col-span-2 h-3 w-20 rounded-full pr-2" />
//         <div className="col-span-2 flex justify-center">
//           <SkeletonBlock className="h-5 w-20 rounded-full" />
//         </div>
//         <div className="col-span-2 flex justify-end">
//           <SkeletonBlock className="h-7 w-24 rounded-lg" />
//         </div>
//       </div>
//     ))}
//   </>
// )

// ── PatientsSkeleton: full page inside DashboardLayout ──
// export const PatientsSkeleton = () => (
//   <div className="flex flex-col gap-6">
//     <div className="flex justify-between items-center">
//       <div className="flex flex-col gap-2">
//         <SkeletonBlock className="h-6 w-36 rounded-full" />
//         <SkeletonBlock className="h-4 w-56 rounded-full" />
//       </div>
//       <SkeletonBlock className="h-10 w-32 rounded-xl" />
//     </div>
//     {/* Stats */}
//     <div className="grid grid-cols-3 gap-4">
//       {[1,2,3].map(i => (
//         <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//           <SkeletonBlock className="h-3 w-20 rounded-full" />
//           <SkeletonBlock className="mt-2 h-7 w-12 rounded-xl" />
//         </div>
//       ))}
//     </div>
//     {/* Search */}
//     <div className="flex items-center gap-2 rounded-xl px-3 py-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//       <SkeletonBlock className="h-4 w-4 rounded-full shrink-0" />
//       <SkeletonBlock className="h-4 flex-1 max-w-sm rounded-full" />
//     </div>
//     {/* Table */}
//     <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//       <div className="grid grid-cols-12 px-5 py-3.5 gap-4" style={{ backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
//         {['col-span-3','col-span-2','col-span-2','col-span-3','col-span-2'].map((c,i)=>(
//           <SkeletonBlock key={i} className={`${c} h-3 w-16 rounded-full`} />
//         ))}
//       </div>
//       {[1,2,3,4,5].map(i=>(
//         <div key={i} className="grid grid-cols-12 items-center px-5 py-4 gap-4" style={{ borderTop: '1px solid var(--color-border)' }}>
//           <div className="col-span-3 flex items-center gap-3">
//             <SkeletonBlock className="h-9 w-9 rounded-full shrink-0" />
//             <div className="flex flex-col gap-1.5">
//               <SkeletonBlock className="h-4 w-24 rounded-full" />
//               <SkeletonBlock className="h-3 w-16 rounded-full" />
//             </div>
//           </div>
//           <SkeletonBlock className="col-span-2 h-4 w-12 rounded-full" />
//           <SkeletonBlock className="col-span-2 h-4 w-20 rounded-full" />
//           <div className="col-span-3 flex flex-col gap-1.5">
//             <SkeletonBlock className="h-4 w-28 rounded-full" />
//             <SkeletonBlock className="h-3 w-32 rounded-full" />
//           </div>
//           <SkeletonBlock className="col-span-2 h-7 w-16 rounded-lg" />
//         </div>
//       ))}
//     </div>
//   </div>
// )

// ── RecordsSkeleton: full page inside DashboardLayout ──
// export const RecordsSkeleton = () => (
//   <div className="flex flex-col gap-6">
//     <div className="flex justify-between items-center">
//       <div className="flex flex-col gap-2">
//         <SkeletonBlock className="h-6 w-44 rounded-full" />
//         <SkeletonBlock className="h-4 w-64 rounded-full" />
//       </div>
//       <SkeletonBlock className="h-10 w-28 rounded-xl" />
//     </div>
//     <div className="flex items-center gap-2 rounded-xl px-3 py-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//       <SkeletonBlock className="h-4 w-4 rounded-full shrink-0" />
//       <SkeletonBlock className="h-4 flex-1 max-w-md rounded-full" />
//     </div>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       {[1,2,3,4].map(i => (
//         <div key={i} className="p-5 rounded-2xl flex flex-col gap-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//           <div className="flex justify-between items-start gap-2">
//             <div className="flex flex-col gap-1.5">
//               <SkeletonBlock className="h-4 w-20 rounded-full" />
//               <SkeletonBlock className="h-5 w-36 rounded-full" />
//             </div>
//             <div className="flex flex-col gap-1.5 text-right">
//               <SkeletonBlock className="h-4 w-28 rounded-full" />
//               <SkeletonBlock className="h-3 w-24 rounded-full" />
//             </div>
//           </div>
//           <div className="p-4 rounded-xl flex flex-col gap-2.5" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
//             <SkeletonBlock className="h-3 w-24 rounded-full" />
//             <SkeletonBlock className="h-4 w-full rounded-full" />
//             <SkeletonBlock className="h-3 w-20 rounded-full mt-2" />
//             <SkeletonBlock className="h-4 w-full rounded-full" />
//             <SkeletonBlock className="h-4 w-4/5 rounded-full" />
//           </div>
//           <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
//             <SkeletonBlock className="h-3 w-24 rounded-full" />
//             <SkeletonBlock className="h-5 w-20 rounded-full" />
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>
// )

// ── EmergencySkeleton: full page inside DashboardLayout ──
// export const EmergencySkeleton = () => (
//   <div className="flex flex-col gap-6">
//     <div>
//       <SkeletonBlock className="h-6 w-44 rounded-full" />
//       <SkeletonBlock className="mt-2 h-4 w-64 rounded-full" />
//     </div>
//     {/* Alert banner */}
//     <div className="p-4 rounded-2xl flex items-start gap-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//       <SkeletonBlock className="h-5 w-5 rounded-full shrink-0" />
//       <div className="flex flex-col gap-2 flex-1">
//         <SkeletonBlock className="h-4 w-36 rounded-full" />
//         <SkeletonBlock className="h-3 w-full rounded-full" />
//         <SkeletonBlock className="h-3 w-4/5 rounded-full" />
//         <SkeletonBlock className="h-3 w-5/6 rounded-full" />
//       </div>
//     </div>
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* Form side */}
//       <div className="lg:col-span-2 p-5 rounded-2xl flex flex-col gap-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//         <div>
//           <SkeletonBlock className="h-4 w-40 rounded-full" />
//           <SkeletonBlock className="mt-1.5 h-3 w-56 rounded-full" />
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <SkeletonBlock className="h-11 rounded-xl" />
//           <SkeletonBlock className="h-11 rounded-xl" />
//         </div>
//         <SkeletonBlock className="h-20 rounded-xl" />
//         <SkeletonBlock className="h-10 w-full rounded-xl" />
//       </div>
//       {/* History side */}
//       <div className="p-5 rounded-2xl flex flex-col gap-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//         <div>
//           <SkeletonBlock className="h-4 w-36 rounded-full" />
//           <SkeletonBlock className="mt-1.5 h-3 w-40 rounded-full" />
//         </div>
//         {[1,2,3].map(i => (
//           <div key={i} className="p-3.5 rounded-xl flex flex-col gap-1.5" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
//             <SkeletonBlock className="h-4 w-32 rounded-full" />
//             <SkeletonBlock className="h-3 w-40 rounded-full" />
//             <SkeletonBlock className="h-3 w-full rounded-full" />
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// )

// ── SettingsSkeleton: full page inside DashboardLayout ──
// export const SettingsSkeleton = () => (
//   <div className="max-w-2xl flex flex-col gap-6">
//     <div className="flex flex-col gap-1 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
//       <SkeletonBlock className="h-8 w-52 rounded-full" />
//       <SkeletonBlock className="mt-2 h-4 w-72 rounded-full" />
//     </div>
//     <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <SkeletonBlock className="h-9 w-9 rounded-xl shrink-0" />
//           <div className="flex flex-col gap-1.5">
//             <SkeletonBlock className="h-4 w-24 rounded-full" />
//             <SkeletonBlock className="h-3 w-32 rounded-full" />
//           </div>
//         </div>
//         <SkeletonBlock className="h-5 w-16 rounded-full" />
//       </div>
//       <SkeletonBlock className="h-4 w-full rounded-full" />
//       <SkeletonBlock className="h-3 w-5/6 rounded-full" />
//       <div className="flex flex-col gap-3.5 mt-2">
//         {[1,2,3].map(i => (
//           <div key={i} className="flex items-center justify-between p-3.5 rounded-xl" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}>
//             <div className="flex flex-col gap-1.5">
//               <SkeletonBlock className="h-4 w-36 rounded-full" />
//               <SkeletonBlock className="h-3 w-64 rounded-full" />
//             </div>
//             <SkeletonBlock className="h-6 w-11 rounded-full shrink-0" />
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// )

// ── StaffSkeleton: Suspense fallback wrapping DashboardLayout ──
// export const StaffSkeleton = () => (
//   <DashboardLayout>
//     <div className="flex flex-col gap-6">
//       <div className="flex justify-between items-center">
//         <div className="flex flex-col gap-2">
//           <SkeletonBlock className="h-6 w-40 rounded-full" />
//           <SkeletonBlock className="h-4 w-64 rounded-full" />
//         </div>
//         <SkeletonBlock className="h-10 w-32 rounded-xl" />
//       </div>
//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-4">
//         {[1,2,3].map(i => (
//           <div key={i} className="p-4 rounded-xl flex flex-col gap-2" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//             <SkeletonBlock className="h-3 w-20 rounded-full" />
//             <SkeletonBlock className="h-7 w-10 rounded-xl" />
//           </div>
//         ))}
//       </div>
//       {/* Filter bar */}
//       <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//         <div className="col-span-2 flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
//           <SkeletonBlock className="h-4 w-4 rounded-full shrink-0" />
//           <SkeletonBlock className="h-4 flex-1 rounded-full" />
//         </div>
//         <SkeletonBlock className="h-10 rounded-xl" />
//       </div>
//       {/* Card grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {[1,2,3,4].map(i => (
//           <div key={i} className="p-5 rounded-2xl flex flex-col gap-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//             <div className="flex justify-between items-start">
//               <div className="flex items-center gap-3">
//                 <SkeletonBlock className="h-10 w-10 rounded-xl shrink-0" />
//                 <div className="flex flex-col gap-1.5">
//                   <SkeletonBlock className="h-4 w-32 rounded-full" />
//                   <SkeletonBlock className="h-4 w-16 rounded-full" />
//                 </div>
//               </div>
//               <SkeletonBlock className="h-6 w-16 rounded-full" />
//             </div>
//             <div className="p-3.5 rounded-xl flex flex-col gap-2" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
//               <SkeletonBlock className="h-3 w-28 rounded-full" />
//               <SkeletonBlock className="h-3 w-48 rounded-full" />
//               <SkeletonBlock className="h-3 w-40 rounded-full" />
//             </div>
//             <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
//               <SkeletonBlock className="h-3 w-24 rounded-full" />
//               <SkeletonBlock className="h-4 w-24 rounded-full" />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   </DashboardLayout>
// )

// ── ScheduleSkeleton: Suspense fallback — 3-col kanban board ──
// export const ScheduleSkeleton = () => (
//   <DashboardLayout>
//     <div className="flex flex-col gap-6">
//       <div className="flex justify-between items-center">
//         <div className="flex flex-col gap-2">
//           <SkeletonBlock className="h-6 w-44 rounded-full" />
//           <SkeletonBlock className="h-4 w-64 rounded-full" />
//         </div>
//         <SkeletonBlock className="h-10 w-36 rounded-xl" />
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {['Scheduled Today', 'With Doctor', 'Completed Today'].map((col, ci) => (
//           <div key={ci} className="flex flex-col gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
//             <div className="flex items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
//               <SkeletonBlock className="h-4 w-32 rounded-full" />
//               <SkeletonBlock className="h-5 w-5 rounded-full shrink-0" />
//             </div>
//             <div className="flex flex-col gap-3">
//               {[1,2].map(i => (
//                 <div key={i} className="p-4 rounded-xl flex flex-col gap-3" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
//                   <div className="flex justify-between items-start">
//                     <SkeletonBlock className="h-4 w-28 rounded-full" />
//                     <SkeletonBlock className="h-5 w-16 rounded-md shrink-0" />
//                   </div>
//                   <SkeletonBlock className="h-3 w-40 rounded-full" />
//                   <SkeletonBlock className="h-3 w-32 rounded-full" />
//                   <div className="flex justify-between items-center pt-2.5" style={{ borderTop: '1px solid var(--color-border)' }}>
//                     <SkeletonBlock className="h-5 w-12 rounded-full" />
//                     <SkeletonBlock className="h-7 w-20 rounded-lg" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   </DashboardLayout>
// )

// export const TenantsSkeleton = () => (
//   <DashTableSkeleton
//     headerWidth="w-32"
//     subtitleWidth="w-48"
//     showButton={true}
//     tabCount={3}
//     columns={[
//       { span: 'w-2/5', width: 'w-32' },
//       { span: 'w-1/5', width: 'w-16' },
//       { span: 'w-1/5', width: 'w-20' },
//       { span: 'w-1/5 text-right', width: 'w-16' }
//     ]}
//   />
// )

// export const SuperadminsSkeleton = () => (
//   <DashTableSkeleton
//     headerWidth="w-40"
//     subtitleWidth="w-56"
//     tabCount={3}
//     columns={[
//       { span: 'w-1/4', width: 'w-32' },
//       { span: 'w-1/4', width: 'w-40' },
//       { span: 'w-1/4', width: 'w-24' },
//       { span: 'w-1/4', width: 'w-20' }
//     ]}
//   />
// )

// export const PlansSkeleton = () => (
//   <DashTableSkeleton
//     headerWidth="w-36"
//     subtitleWidth="w-48"
//     showButton={true}
//     tabCount={2}
//     columns={[
//       { span: 'w-1/4', width: 'w-24' },
//       { span: 'w-1/4', width: 'w-20' },
//       { span: 'w-1/4', width: 'w-32' },
//       { span: 'w-1/4 text-right', width: 'w-16' }
//     ]}
//   />
// )

// export const SubscriptionsSkeleton = () => (
//   <DashTableSkeleton
//     headerWidth="w-48"
//     subtitleWidth="w-64"
//     showButton={true}
//     tabCount={5}
//     columns={[
//       { span: 'w-1/4', width: 'w-32' },
//       { span: 'w-1/4', width: 'w-24' },
//       { span: 'w-1/4', width: 'w-20' },
//       { span: 'w-1/4 text-right', width: 'w-20' }
//     ]}
//   />
// )

// export const InquiriesSkeleton = () => (
//   <DashTableSkeleton
//     headerWidth="w-32"
//     subtitleWidth="w-56"
//     tabCount={4}
//     showStats={true}
//     statsCount={3}
//     columns={[
//       { span: 'w-1/5', width: 'w-24' },
//       { span: 'w-1/5', width: 'w-32' },
//       { span: 'w-1/5', width: 'w-20' },
//       { span: 'w-1/5', width: 'w-48' },
//       { span: 'w-1/5', width: 'w-20' }
//     ]}
//   />
// )

// export const AuditSkeleton = () => (
//   <DashTableSkeleton
//     headerWidth="w-32"
//     subtitleWidth="w-48"
//     tabCount={4}
//     columns={[
//       { span: 'w-1/4', width: 'w-32' },
//       { span: 'w-1/4', width: 'w-40' },
//       { span: 'w-1/4', width: 'w-24' },
//       { span: 'w-1/4', width: 'w-20' }
//     ]}
//   />
// )

export const PatientsSkeleton = () => {
  return (
    <div className="pt-24 px-6">
      <div className="mx-auto w-[82%] max-w-7xl">
        <SkeletonBlock className="h-6 w-48 rounded-full" />
        <div className="mt-6 grid gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <SkeletonBlock className="h-10 w-full max-w-2xl rounded-3xl" />
          <div className="grid grid-cols-12 gap-4 py-3 text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            <SkeletonBlock className="col-span-4 h-4" />
            <SkeletonBlock className="col-span-2 h-4" />
            <SkeletonBlock className="col-span-2 h-4" />
            <SkeletonBlock className="col-span-3 h-4" />
            <SkeletonBlock className="col-span-1 h-4" />
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="grid grid-cols-12 items-center gap-4 rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
              <div className="col-span-4">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="mt-2 h-3 w-24" />
              </div>
              <SkeletonBlock className="col-span-2 h-4" />
              <SkeletonBlock className="col-span-2 h-4" />
              <div className="col-span-3">
                <SkeletonBlock className="h-4 w-36" />
                <SkeletonBlock className="mt-2 h-3 w-40" />
              </div>
              <SkeletonBlock className="col-span-1 h-8 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const RecordsSkeleton = () => {
  return (
    <div className="pt-24 px-6">
      <div className="mx-auto w-[82%] max-w-7xl">
        <SkeletonBlock className="h-6 w-52 rounded-full" />
        <div className="mt-6 grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <SkeletonBlock className="h-4 w-48 rounded-full" />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SkeletonBlock className="h-20 w-full rounded-3xl" />
                <SkeletonBlock className="h-20 w-full rounded-3xl" />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {[1, 2, 3].map(fileIndex => (
                  <SkeletonBlock key={fileIndex} className="h-8 w-28 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const EmergencySkeleton = () => {
  return (
    <div className="pt-24 px-6">
      <div className="mx-auto w-[82%] max-w-7xl">
        <SkeletonBlock className="h-6 w-48 rounded-full" />
        <div className="mt-6 rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <SkeletonBlock className="h-4 w-40" />
          <div className="mt-4 grid gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between">
                <SkeletonBlock className="h-12 w-3/4" />
                <SkeletonBlock className="h-8 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const SettingsSkeleton = () => {
  return (
    <div className="pt-24 px-6">
      <div className="mx-auto w-[82%] max-w-7xl">
        <SkeletonBlock className="h-6 w-40 rounded-full" />
        <div className="mt-6 grid gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <SkeletonBlock className="h-4 w-48" />
              <SkeletonBlock className="h-8 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const ConsentSkeleton = () => {
  return (
    <div className="pt-24 px-6">
      <div className="mx-auto w-[82%] max-w-7xl">
        <SkeletonBlock className="h-6 w-56 rounded-full" />
        <div className="mt-6 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-12 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            <SkeletonBlock className="col-span-3 h-4 w-24 rounded-full" />
            <SkeletonBlock className="col-span-3 h-4 w-24 rounded-full" />
            <SkeletonBlock className="col-span-2 h-4 w-20 rounded-full" />
            <SkeletonBlock className="col-span-2 h-4 w-16 rounded-full" />
            <SkeletonBlock className="col-span-2 h-4 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const TenantsSkeleton = () => (
  <DashTableSkeleton
    headerWidth="w-32"
    subtitleWidth="w-48"
    showButton={true}
    tabCount={3}
    columns={[
      { span: 'w-2/5', width: 'w-32' },
      { span: 'w-1/5', width: 'w-16' },
      { span: 'w-1/5', width: 'w-20' },
      { span: 'w-1/5 text-right', width: 'w-16' }
    ]}
  />
)

export const SuperadminsSkeleton = () => (
  <DashTableSkeleton
    headerWidth="w-40"
    subtitleWidth="w-56"
    tabCount={3}
    columns={[
      { span: 'w-1/4', width: 'w-32' },
      { span: 'w-1/4', width: 'w-40' },
      { span: 'w-1/4', width: 'w-24' },
      { span: 'w-1/4', width: 'w-20' }
    ]}
  />
)

export const PlansSkeleton = () => (
  <DashTableSkeleton
    headerWidth="w-36"
    subtitleWidth="w-48"
    showButton={true}
    tabCount={2}
    columns={[
      { span: 'w-1/4', width: 'w-24' },
      { span: 'w-1/4', width: 'w-20' },
      { span: 'w-1/4', width: 'w-32' },
      { span: 'w-1/4 text-right', width: 'w-16' }
    ]}
  />
)

export const SubscriptionsSkeleton = () => (
  <DashTableSkeleton
    headerWidth="w-48"
    subtitleWidth="w-64"
    showButton={true}
    tabCount={5}
    columns={[
      { span: 'w-1/4', width: 'w-32' },
      { span: 'w-1/4', width: 'w-24' },
      { span: 'w-1/4', width: 'w-20' },
      { span: 'w-1/4 text-right', width: 'w-20' }
    ]}
  />
)

export const InquiriesSkeleton = () => (
  <DashTableSkeleton
    headerWidth="w-32"
    subtitleWidth="w-56"
    tabCount={4}
    showStats={true}
    statsCount={3}
    columns={[
      { span: 'w-1/5', width: 'w-24' },
      { span: 'w-1/5', width: 'w-32' },
      { span: 'w-1/5', width: 'w-20' },
      { span: 'w-1/5', width: 'w-48' },
      { span: 'w-1/5', width: 'w-20' }
    ]}
  />
)

export const ScheduleSkeleton = () => (
  <DashTableSkeleton
    headerWidth="w-48"
    subtitleWidth="w-64"
    showButton={true}
    tabCount={3}
    columns={[
      { span: 'w-1/4', width: 'w-32' },
      { span: 'w-1/4', width: 'w-24' },
      { span: 'w-1/4', width: 'w-20' },
      { span: 'w-1/4 text-right', width: 'w-20' }
    ]}
  />
)

export const AuditSkeleton = () => (
  <DashTableSkeleton
    headerWidth="w-32"
    subtitleWidth="w-48"
    tabCount={4}
    columns={[
      { span: 'w-1/4', width: 'w-32' },
      { span: 'w-1/4', width: 'w-40' },
      { span: 'w-1/4', width: 'w-24' },
      { span: 'w-1/4', width: 'w-20' }
    ]}
  />
)

export const StaffSkeleton = () => (
  <DashTableSkeleton
    headerWidth="w-32"
    subtitleWidth="w-48"
    showButton={true}
    tabCount={3}
    columns={[
      { span: 'w-1/4', width: 'w-32' },
      { span: 'w-1/4', width: 'w-40' },
      { span: 'w-1/4', width: 'w-24' },
      { span: 'w-1/4', width: 'w-20' }
    ]}
  />
)
