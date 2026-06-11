import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../components/layout/DashboardLayout'
import InputField from '../components/shared/InputField'
import PhoneInputField from '../components/shared/PhoneInputField'
import Button from '../components/shared/Button'
import Avatar from '../components/shared/Avatar'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import { userApi, type UpdateProfilePayload } from '../services/user.service'
import { validateProfileForm, type ProfileFormErrors } from '../validation/profile.validation'

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  HOSPITAL_ADMIN: 'Hospital Admin',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Receptionist',
  PATIENT: 'Patient',
}

const InfoRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
    <span
      className={`text-sm font-medium ${mono ? 'font-mono' : ''} truncate`}
      style={{ color: 'var(--color-text)' }}
    >
      {value || '—'}
    </span>
  </div>
)

const ROLE_SPECIFIC_FIELDS: Record<string, { key: string; label: string }[]> = {
  DOCTOR: [
    { key: 'specialization', label: 'Specialization' },
    { key: 'licenseNumber', label: 'License Number' },
  ],
  PATIENT: [
    { key: 'dob', label: 'Date of Birth' },
    { key: 'gender', label: 'Gender' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'allergies', label: 'Allergies' },
  ],
}

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [roleFields, setRoleFields] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name ?? '')
    setEmail(user.email ?? '')
  }, [user])

  if (!user) return null

  const displayName = user.name || user.email?.split('@')[0] || '—'
  const roleSpecific = ROLE_SPECIFIC_FIELDS[user.role] ?? []

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'warning')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPG, PNG, and WebP images are allowed', 'warning')
      return
    }
    setUploading(true)
    try {
      const res = await userApi.updateProfileImage(file)
      updateUser({ profileImageUrl: res.data.profileImageUrl })
      showToast('Profile image updated', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload image'
      showToast(message, 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nextErrors = validateProfileForm({ name, email })
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      showToast(Object.values(nextErrors)[0] ?? 'Please fix the form errors', 'warning')
      return
    }

    setErrors({})
    setSaving(true)

    try {
      const payload: UpdateProfilePayload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() ? phone.trim() : null,
      }
      for (const field of roleSpecific) {
        const val = roleFields[field.key]?.trim()
        if (val) (payload as Record<string, unknown>)[field.key] = val
      }

      await userApi.updateProfile(payload)

      updateUser({
        name: name.trim(),
        email: email.trim(),
      })

      showToast('Profile updated successfully', 'success')
      setEditing(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      showToast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(user.name ?? '')
    setEmail(user.email ?? '')
    setRoleFields({})
    setErrors({})
    setEditing(false)
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col gap-6"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
            Profile
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your personal information and account details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left Column: Identity Card ── */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="relative h-28"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent, #6366f1))' }}
              />
              <div className="flex flex-col items-center -mt-10 pb-5 px-5">
                <div className="relative mb-3">
                  <div
                    className="shrink-0 shadow-lg overflow-hidden rounded-2xl"
                    style={{ outline: '4px solid var(--color-surface)', outlineOffset: '-1px' }}
                  >
                    <Avatar name={displayName} image={user.profileImageUrl} size="xl" />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full cursor-pointer transition-all shadow-md"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: '2px solid var(--color-surface)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                    title="Change profile image"
                  >
                    {uploading ? (
                      <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <h2 className="text-base font-bold text-center truncate w-full" style={{ color: 'var(--color-text)' }}>
                  {displayName}
                </h2>
                <p className="text-xs truncate w-full text-center mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {user.email}
                </p>

                <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}
                  >
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: user.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                      color: user.isActive ? '#10B981' : '#EF4444',
                    }}
                  >
                    <span className="h-1 w-1 rounded-full" style={{ backgroundColor: user.isActive ? '#10B981' : '#EF4444' }} />
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: user.isVerified ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.12)',
                      color: user.isVerified ? '#10B981' : '#F59E0B',
                    }}
                  >
                    {user.isVerified ? '✓ Verified' : '! Unverified'}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 flex flex-col gap-3"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <InfoRow label="Role" value={ROLE_LABELS[user.role] ?? user.role} />
              <div style={{ borderTop: '1px solid var(--color-border)' }} />
              <InfoRow label="Status" value={user.isActive ? 'Active' : 'Inactive'} />
              <div style={{ borderTop: '1px solid var(--color-border)' }} />
              <InfoRow label="Verified" value={user.isVerified ? 'Yes' : 'No'} />
            </div>
          </div>

          {/* ── Right Column: Details + Edit ── */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl overflow-hidden min-h-[50vh] flex flex-col"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Personal Information</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Your basic profile details</p>
                </div>
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl cursor-pointer transition-all"
                    style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-primary-ghost)'; e.currentTarget.style.color = 'var(--color-primary)' }}
                    title="Edit profile"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex h-9 w-9 items-center justify-center rounded-xl cursor-pointer transition-all"
                    style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', border: '1px solid var(--color-border)' }}
                    title="Cancel editing"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-6 flex-1">
                <AnimatePresence mode="wait">
                  {editing ? (
                    <motion.div
                      key="editing"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                          label="Full Name"
                          value={name}
                          onChange={setName}
                          error={errors.name}
                          placeholder="Your full name"
                        />
                        <InputField
                          label="Email"
                          type="email"
                          value={email}
                          onChange={setEmail}
                          error={errors.email}
                          placeholder="you@example.com"
                        />
                      </div>

                      <PhoneInputField
                        label="Phone Number"
                        value={phone}
                        onChange={setPhone}
                        required={false}
                      />

                      {roleSpecific.length > 0 && (
                        <>
                          <div style={{ borderTop: '1px solid var(--color-border)' }} />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                              {user.role === 'DOCTOR' ? 'Professional Details' : 'Medical Details'}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {roleSpecific.map(field => (
                                <InputField
                                  key={field.key}
                                  label={field.label}
                                  value={roleFields[field.key] ?? ''}
                                  onChange={val => setRoleFields(prev => ({ ...prev, [field.key]: val }))}
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                  required={false}
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-3">
                        <Button
                          type="button"
                          variant="default"
                          size="md"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          isLoading={saving}
                          loadingText="Saving..."
                        >
                          Save Changes
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="viewing"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InfoRow label="Full Name" value={user.name ?? ''} />
                        <InfoRow label="Email" value={user.email ?? ''} />
                        <InfoRow label="Phone" value={phone || 'Not set'} />
                      </div>

                      {roleSpecific.length > 0 && (
                        <>
                          <div style={{ borderTop: '1px solid var(--color-border)' }} />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                              {user.role === 'DOCTOR' ? 'Professional Details' : 'Medical Details'}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {roleSpecific.map(field => (
                                <InfoRow key={field.key} label={field.label} value={roleFields[field.key] ?? 'Not set'} />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default ProfilePage