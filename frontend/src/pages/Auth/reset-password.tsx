import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageWrapper from '../../components/shared/PageWrapper'
import InputField from '../../components/shared/InputField'
import Button from '../../components/shared/Button'
import { authApi } from '../../services/auth.service'
import { validateResetPassword, type ResetPasswordErrors } from '../../validation/auth.validation'
import { useToast } from '../../Context/ToastContext'

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c5.5 0 9.6 3.6 11 8-0.5 1.6-1.4 3-2.5 4.1" />
      <path d="M6.1 6.1C4 7.6 2.5 9.7 2 12c1.4 4.4 5.5 8 10 8 1.2 0 2.3-0.2 3.4-0.6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1.9 12C3.3 7.6 7.4 4 12 4s8.7 3.6 10.1 8c-1.4 4.4-5.5 8-10.1 8S3.3 16.4 1.9 12Z" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  )

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordErrors>({})
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    
    const validationErrs = validateResetPassword(password, confirmPassword)
    if (Object.keys(validationErrs).length > 0) {
      setFieldErrors(validationErrs)
      showToast('Please check your password fields', 'error')
      return
    }

    setIsLoading(true)
    try {
      await authApi.resetPassword({ token, newPassword: password, confirmPassword })
      showToast('Password reset successfully!', 'success')
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      setError(err.message ?? 'Failed to reset password')
      showToast(err.message ?? 'Failed to reset password', 'error')
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
                <path d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-6 9a2 2 0 1 1 2-2 2 2 0 0 1-2 2Zm3.1-9H8.9V6a3.1 3.1 0 0 1 6.2 0v2Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Set New Password</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Choose a strong password for your account.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl p-4 text-center text-sm font-medium"
              style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}
            >
              ✓ Password reset! Redirecting to login...
            </motion.div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
              <InputField
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(v) => {
                  setPassword(v)
                  if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined }))
                }}
                required={false}
                error={fieldErrors.password}
                rightAdornment={
                  <Button type="button" variant="ghost" size="icon"
                    onClick={() => setShowPassword(p => !p)}
                    className={`transition-all duration-200 ${password.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                    <EyeIcon open={showPassword} />
                  </Button>
                }
              />
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v)
                  if (fieldErrors.confirmPassword) setFieldErrors(p => ({ ...p, confirmPassword: undefined }))
                }}
                required={false}
                error={fieldErrors.confirmPassword}
                rightAdornment={
                  <Button type="button" variant="ghost" size="icon"
                    onClick={() => setShowConfirm(p => !p)}
                    className={`transition-all duration-200 ${confirmPassword.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                    <EyeIcon open={showConfirm} />
                  </Button>
                }
              />
              {error && <span className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</span>}
              <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl mt-2" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  )
}

export default ResetPasswordPage
