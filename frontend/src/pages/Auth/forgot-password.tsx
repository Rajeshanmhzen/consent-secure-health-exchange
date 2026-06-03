import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PageWrapper from '../../components/shared/PageWrapper'
import InputField from '../../components/shared/InputField'
import Button from '../../components/shared/Button'
import { authApi } from '../../services/auth.service'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return setError('Email is required')
    setError('')
    setIsLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
      setTimeout(() => navigate(`/verify-code?email=${encodeURIComponent(email)}`), 1500)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper fullHeight>
      <div className="mx-auto w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="rounded-3xl p-10 shadow-xl"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-primary-ghost)' }}>
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" style={{ color: 'var(--color-primary)' }}>
                <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Forgot Password?</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Enter your email and we'll send you a reset code and link.
            </p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl p-4 text-center text-sm font-medium"
              style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}
            >
              ✓ Reset email sent! Redirecting...
            </motion.div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
              <InputField label="Email" name="email" type="email" value={email} onChange={setEmail} placeholder="Enter your email address" />
              {error && <span className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</span>}
              <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl mt-2" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Email'}
              </Button>
              <div className="text-center">
                <Link to="/login" className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  )
}

export default ForgotPasswordPage
