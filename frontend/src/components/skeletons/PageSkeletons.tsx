type AuthSplitSkeletonProps = {
  variant?: 'login' | 'register'
}

const SkeletonBlock = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton-shimmer rounded-2xl ${className}`} />
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
