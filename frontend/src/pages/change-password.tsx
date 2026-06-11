import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import InputField from '../components/shared/InputField'
import Button from '../components/shared/Button'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import { userApi } from '../services/user.service'

type FormErrors = {
  oldPassword?: string
  password?: string
  confirmPassword?: string
}

const PasswordToggle = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    onClick={onToggle}
    aria-label={visible ? 'Hide password' : 'Show password'}
    className="transition-all duration-200"
  >
    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </Button>
)

const ChangePasswordPage = () => {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!user) return null

  const validate = (): FormErrors => {
    const errs: FormErrors = {}
    if (!oldPassword) {
      errs.oldPassword = 'Current password is required'
    }
    if (!password) {
      errs.password = 'New password is required'
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    } else if (password === oldPassword) {
      errs.password = 'New password must be different from current password'
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password'
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      showToast(Object.values(nextErrors)[0] ?? 'Please fix the form errors', 'warning')
      return
    }

    setErrors({})
    setSaving(true)

    try {
      await userApi.changePassword({
        oldPassword,
        newPassword: password,
        confirmPassword,
      })

      showToast('Password changed successfully. Please sign in again.', 'success')
      logout()
      navigate('/login')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password'
      showToast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-w-lg flex flex-col gap-6"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
            Change Password
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Update your password to keep your account secure.
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <InputField
              label="Current Password"
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={setOldPassword}
              error={errors.oldPassword}
              placeholder="Enter your current password"
              rightAdornment={<PasswordToggle visible={showOld} onToggle={() => setShowOld(v => !v)} />}
            />

            <div style={{ borderTop: '1px solid var(--color-border)' }} />

            <InputField
              label="New Password"
              type={showNew ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              error={errors.password}
              placeholder="Enter a new password"
              rightAdornment={<PasswordToggle visible={showNew} onToggle={() => setShowNew(v => !v)} />}
            />

            <InputField
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              placeholder="Re-enter the new password"
              rightAdornment={<PasswordToggle visible={showConfirm} onToggle={() => setShowConfirm(v => !v)} />}
            />

            <div className="flex items-center justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="default"
                size="md"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={saving}
                loadingText="Updating..."
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default ChangePasswordPage