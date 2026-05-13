import { useState } from 'react'
import InputField from '../../shared/InputField'
import Button from '../../shared/Button'

interface RegisterFormProps {
  firstName: string
  lastName: string
  email: string
  phone:string
  password: string
  confirmPassword: string
  onFirstNameChange?: (value: string) => void
  onLastNameChange?: (value: string) => void
  onEmailChange?: (value: string) => void
  onPhoneChange?: (value: string) => void
  onPasswordChange?: (value: string) => void
  onConfirmPasswordChange?: (value: string) => void
  onSubmit?: () => void
  isLoading?: boolean
  error?: string
  fieldErrors?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    password?: string
    confirmPassword?: string
  }
}

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

const RegisterForm = (props: RegisterFormProps) => {
  const {
    firstName, lastName, email,phone, password, confirmPassword,
    onFirstNameChange, onLastNameChange, onEmailChange, onPhoneChange,
    onPasswordChange, onConfirmPasswordChange,
    onSubmit, isLoading, error, fieldErrors,
  } = props

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(e) => { e.preventDefault(); onSubmit?.() }}
    >
      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <InputField label="First Name" name="firstName" value={firstName} onChange={onFirstNameChange} />
          {fieldErrors?.firstName && <span className="text-[10px] text-red-500">{fieldErrors.firstName}</span>}
        </div>
        <div className="flex-1 space-y-1">
          <InputField label="Last Name" name="lastName" value={lastName} onChange={onLastNameChange} />
          {fieldErrors?.lastName && <span className="text-[10px] text-red-500">{fieldErrors.lastName}</span>}
        </div>
      </div>
      <div className="space-y-1">
        <InputField label="Email" name="email" type="email" value={email} onChange={onEmailChange} />
        {fieldErrors?.email && <span className="text-[10px] text-red-500">{fieldErrors.email}</span>}
      </div>
      <div className="space-y-1">
        <InputField label="Phone" name="phone" type="tel" value={phone} onChange={onPhoneChange} />
        {fieldErrors?.phone && <span className="text-[10px] text-red-500">{fieldErrors.phone}</span>}
      </div>
      <InputField
        label="Password"
        name="password"
        value={password}
        type={showPassword ? 'text' : 'password'}
        onChange={onPasswordChange}
        rightAdornment={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword((p) => !p)}
            className={`transition-all duration-200 ease-out ${password && password.length > 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPassword} />
          </Button>
        }
      />
      {fieldErrors?.password && <span className="text-[10px] text-red-500">{fieldErrors.password}</span>}
      <InputField
        label="Confirm Password"
        name="confirmPassword"
        value={confirmPassword}
        type={showConfirmPassword ? 'text' : 'password'}
        onChange={onConfirmPasswordChange}
        rightAdornment={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowConfirmPassword((p) => !p)}
            className={`transition-all duration-200 ease-out ${confirmPassword && confirmPassword.length > 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showConfirmPassword} />
          </Button>
        }
      />
      {fieldErrors?.confirmPassword && <span className="text-[10px] text-red-500">{fieldErrors.confirmPassword}</span>}
      <div className="flex items-center justify-between text-[10px] font-semibold tracking-normal text-primary -mt-1">
        <span className="text-[10px] text-red-500">{error}</span>
      </div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isLoading}
        className="w-full rounded-xl"
      >
        {isLoading ? 'Creating...' : 'Register'}
      </Button>
      <div className="mt-4">
        <div className="flex items-center gap-4">
          <span className="h-px flex-1" style={{ backgroundColor: 'var(--color-border)' }} />
          <span className="text-xs tracking-[0.2em]" style={{ color: 'var(--color-text-secondary)' }}>OR CONTINUE WITH</span>
          <span className="h-px flex-1" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            type="button"
            variant="default"
            size="md"
            className="flex-1 rounded-xl"
            leftIcon={
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white text-[10px] font-bold text-blue-600">G</span>
            }
          >
            Google
          </Button>
          <Button
            type="button"
            variant="default"
            size="md"
            className="flex-1 rounded-xl"
            leftIcon={
              <svg className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3Zm0 12L5 11.5v3L12 18l7-3.5v-3L12 15Z" />
              </svg>
            }
          >
            SSO
          </Button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-on-surface-variant">
            Have an account?{' '}
            <a href="/login"className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>Login</a>
          </p>
        </div>
      </div>
    </form>
  )
}

export default RegisterForm
