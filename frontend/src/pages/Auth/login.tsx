import { motion, useScroll, useTransform } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../Context/AuthContext'
import PageWrapper from '../../components/shared/PageWrapper'
import LoginForm from '../../components/module/auth/LoginForm'
import { authApi } from '../../services/auth.service'
import { validateLogin } from '../../validation/auth.validation'
import { useToast } from '../../Context/ToastContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [data, setData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const { scrollY } = useScroll()
  const scatterSlow = useTransform(scrollY, [0, 500], [0, -30])
  const scatterFast = useTransform(scrollY, [0, 500], [0, 45])
  const scatterOpp  = useTransform(scrollY, [0, 500], [0, -60])

  const handleSubmit = async () => {
    setError('')
    setFieldErrors({})

    const errors = validateLogin(data.email, data.password)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      showToast('Please check your input fields', 'error')
      return
    }

    setIsLoading(true)
    try {
      const res = await authApi.login({ email: data.email, password: data.password })
      showToast('Logged in successfully!', 'success')
      login(res.data.user, res.data.accessToken, res.data.refreshToken)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Login failed')
      showToast(err.message ?? 'Login failed', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper fullHeight>
      <div className="relative mx-auto w-[82%] max-w-7xl px-6 py-10">
        <motion.div
          className="pointer-events-none absolute -left-8 top-32 h-16 w-16 rounded-full"
          style={{ backgroundColor: 'var(--color-primary-ghost)' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute left-20 top-64 h-8 w-8 rounded-full"
          style={{ backgroundColor: 'var(--color-accent)', opacity: 0.2 }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute right-12 top-24 h-10 w-10 rounded-full"
          style={{ backgroundColor: 'var(--color-primary-ghost)' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute right-32 bottom-32 h-14 w-14 rounded-full"
          style={{ backgroundColor: 'var(--color-accent)', opacity: 0.15 }}
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div
            className="left flex flex-col items-center lg:items-start relative"
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              style={{ y: scatterSlow, backgroundColor: 'var(--color-primary-ghost)' }}
              className="pointer-events-none absolute -left-6 top-12 h-12 w-12 rounded-full"
            />
            <motion.div
              style={{ y: scatterFast, backgroundColor: 'var(--color-accent)', opacity: 0.2 }}
              className="pointer-events-none absolute left-10 top-44 h-6 w-6 rounded-full"
            />
            <motion.div
              style={{ y: scatterOpp, backgroundColor: 'var(--color-primary-light)', opacity: 0.15 }}
              className="pointer-events-none absolute left-28 top-72 h-10 w-10 rounded-full"
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="max-w-md text-center lg:text-left"
            >
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}
              >
                Welcome Back
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
                className="mt-4 text-4xl font-extrabold leading-tight"
                style={{ color: 'var(--color-text)' }}
              >
                Continue your journey of{' '}
                <span style={{ color: 'var(--color-primary)' }}>Intellectual Excellence</span>.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45, ease: 'easeOut' }}
                className="mt-4 text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Sign in to access your research dashboard, curated knowledge, and AI-powered academic tools.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.45, ease: 'easeOut' }}
                className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <div className="rounded-2xl p-4 text-center sm:text-left shadow-sm" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full sm:mx-0" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                      <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm9 11v-1a7 7 0 0 0-14 0v1h2v-1a5 5 0 0 1 10 0v1Z" />
                    </svg>
                  </div>
                  <h3 className="mt-3 text-base font-bold" style={{ color: 'var(--color-text)' }}>Your Profile</h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Pick up right where you left off.
                  </p>
                </div>
                <div className="rounded-2xl p-4 text-center sm:text-left shadow-sm" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full sm:mx-0" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                      <path d="M12 1 3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5l-9-4Zm0 10h7c-.53 4.12-3.28 7.79-7 8.93V11H5V6.3l7-3.11V11Z" />
                    </svg>
                  </div>
                  <h3 className="mt-3 text-base font-bold" style={{ color: 'var(--color-text)' }}>Secure Access</h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    JWT-protected, encrypted sessions.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <div className="flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, x: 18, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-lg rounded-3xl p-10 shadow-xl"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Welcome Back</h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Sign in to your account to continue.
                </p>
              </div>
              <LoginForm
                {...data}
                isLoading={isLoading}
                error={error}
                fieldErrors={fieldErrors}
                onEmailChange={(v) => {
                  setData((p) => ({ ...p, email: v }))
                  if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined }))
                }}
                onPasswordChange={(v) => {
                  setData((p) => ({ ...p, password: v }))
                  if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined }))
                }}
                onSubmit={handleSubmit}
              />

              {/* Demo Accounts */}
              <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  Demo Accounts
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { label: 'Super Admin', email: 'superadmin@gmail.com', password: 'User@123' },
                    { label: 'City Admin', email: 'admin@cityhospital.com', password: 'User@123' },
                    { label: 'City Doctor', email: 'johnsmith@cityhospital.com', password: 'User@123' },
                    { label: 'City Receptionist', email: 'riyashrestha@cityhospital.com', password: 'User@123' },
                    { label: 'City Patient', email: 'haritamang@gmail.com', password: 'User@123' },
                    { label: 'Medicity Admin', email: 'admin@medicity.com', password: 'User@123' },
                    { label: 'Medicity Doctor', email: 'johndoe@medicity.com', password: 'User@123' },
                  ].map((acc) => (
                    <button
                      key={acc.label}
                      type="button"
                      onClick={() => {
                        setData({ email: acc.email, password: acc.password })
                        setFieldErrors({})
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.05)] cursor-pointer"
                      style={{ 
                        backgroundColor: 'var(--color-surface-elevated)', 
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default LoginPage
