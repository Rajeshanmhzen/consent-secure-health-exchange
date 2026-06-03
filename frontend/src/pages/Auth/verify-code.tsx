import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import PageWrapper from '../../components/shared/PageWrapper'
import Button from '../../components/shared/Button'
import { authApi } from '../../services/auth.service'

const VerifyCodePage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) return setError('Enter the full 6-digit code')
    setError('')
    setIsLoading(true)
    try {
      await authApi.verifyOtp({ email, code })
      navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${code}`)
    } catch (err: any) {
      setError(err.message ?? 'Invalid or expired code')
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
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
                <path d="M12 1 3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5l-9-4Zm-1 14-3-3 1.4-1.4 1.6 1.6 4.6-4.6L17 9l-6 6Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Enter Verification Code</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              We sent a 6-digit code to <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{email}</span>
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="h-14 w-12 rounded-xl text-center text-xl font-bold outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--color-input-bg)',
                    border: `2px solid ${d ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    color: 'var(--color-text)',
                  }}
                />
              ))}
            </div>

            {error && <span className="text-center text-xs" style={{ color: 'var(--color-error)' }}>{error}</span>}

            <Button type="submit" variant="primary" size="lg" className="w-full rounded-xl" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <Link to="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
                ← Resend code
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </PageWrapper>
  )
}

export default VerifyCodePage
