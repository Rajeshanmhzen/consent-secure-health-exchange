import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../shared/Button'
import InputField from '../shared/InputField'
import PhoneInputField from '../shared/PhoneInputField'
import { tenantApi, type AddTenantPayload } from '../../services/tenant.service'
import { validateAddTenant, type AddTenantErrors } from '../../validation/tenant.validation'
import { useToast } from '../../Context/ToastContext'

type AddTenantModalProps = {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )

const WandIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z" />
        <path d="m14 7 3 3" />
        <path d="M5 6v1" />
        <path d="M19 14v1" />
        <path d="M10 2v1" />
        <path d="M7 8H6" />
        <path d="M21 8h-1" />
        <path d="M11 10h-1" />
    </svg>
)

const generateSecurePassword = () => {
    const length = 12
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+~`|}{[]:;?><,./-='
    const all = uppercase + lowercase + numbers + special

    let password = ''
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    for (let i = 4; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)]
    }

    return password.split('').sort(() => 0.5 - Math.random()).join('')
}

const AddTenantModal = ({ isOpen, onClose, onSuccess }: AddTenantModalProps) => {
    const { showToast } = useToast()
    const [formSubmitting, setFormSubmitting]   = useState(false)
    const [formError, setFormError]             = useState('')
    const [fieldErrors, setFieldErrors]         = useState<AddTenantErrors>({})
    const [showPassword, setShowPassword]       = useState(false)
    const [formValues, setFormValues]           = useState<AddTenantPayload>({
        tenantName: '',
        hospitalName: '',
        hospitalEmail: '',
        adminEmail: '',
        adminPassword: '',
        adminPhone: '',
        isTenantActive: true,
        isAdminActive: true,
        isAdminVerified: false
    })

    const handleGeneratePassword = () => {
        const securePass = generateSecurePassword()
        setFormValues(p => ({ ...p, adminPassword: securePass }))
        setShowPassword(true)
        // Clear password validation error if populated
        if (fieldErrors.adminPassword) {
            setFieldErrors(p => ({ ...p, adminPassword: undefined }))
        }
    }

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError('')
        setFieldErrors({})

        // Custom validation using centralized validation rule
        const validationErrs = validateAddTenant(formValues)
        if (Object.keys(validationErrs).length > 0) {
            setFieldErrors(validationErrs)
            showToast('Please fix the errors in the form', 'error')
            return
        }

        setFormSubmitting(true)
        try {
            await tenantApi.add(formValues)
            showToast('Tenant created successfully!', 'success')
            // Success! Reset form
            setFormValues({
                tenantName: '',
                hospitalName: '',
                hospitalEmail: '',
                adminEmail: '',
                adminPassword: '',
                adminPhone: '',
                isTenantActive: true,
                isAdminActive: true,
                isAdminVerified: false
            })
            setShowPassword(false)
            onSuccess()
        } catch (err: any) {
            setFormError(err.message ?? 'Failed to add tenant')
            showToast(err.message ?? 'Failed to create tenant', 'error')
        } finally {
            setFormSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.45 }}
                        className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-3xl p-8 shadow-2xl"
                        style={{
                            background: 'color-mix(in srgb, var(--color-surface) 75%, transparent)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: 'var(--color-text)'
                        }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Add New Tenant</h3>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddSubmit} noValidate className="flex flex-col gap-5">
                            {formError && (
                                <div className="text-xs font-semibold p-3 rounded-xl" style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-4">
                                <InputField
                                    label="Tenant Name"
                                    value={formValues.tenantName}
                                    onChange={v => {
                                        setFormValues(p => ({ ...p, tenantName: v }))
                                        if (fieldErrors.tenantName) setFieldErrors(p => ({ ...p, tenantName: undefined }))
                                    }}
                                    required={false}
                                    error={fieldErrors.tenantName}
                                />
                                <InputField
                                    label="Hospital Name"
                                    value={formValues.hospitalName}
                                    onChange={v => {
                                        setFormValues(p => ({ ...p, hospitalName: v }))
                                        if (fieldErrors.hospitalName) setFieldErrors(p => ({ ...p, hospitalName: undefined }))
                                    }}
                                    required={false}
                                    error={fieldErrors.hospitalName}
                                />
                                <InputField
                                    label="Hospital Email"
                                    type="email"
                                    value={formValues.hospitalEmail}
                                    onChange={v => {
                                        setFormValues(p => ({ ...p, hospitalEmail: v }))
                                        if (fieldErrors.hospitalEmail) setFieldErrors(p => ({ ...p, hospitalEmail: undefined }))
                                    }}
                                    required={false}
                                    error={fieldErrors.hospitalEmail}
                                />
                                <InputField
                                    label="Admin Email"
                                    type="email"
                                    value={formValues.adminEmail}
                                    onChange={v => {
                                        setFormValues(p => ({ ...p, adminEmail: v }))
                                        if (fieldErrors.adminEmail) setFieldErrors(p => ({ ...p, adminEmail: undefined }))
                                    }}
                                    required={false}
                                    error={fieldErrors.adminEmail}
                                />
                                <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <InputField
                                            label="Admin Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formValues.adminPassword}
                                            onChange={v => {
                                                setFormValues(p => ({ ...p, adminPassword: v }))
                                                if (fieldErrors.adminPassword) setFieldErrors(p => ({ ...p, adminPassword: undefined }))
                                            }}
                                            required={false}
                                            error={fieldErrors.adminPassword}
                                            rightAdornment={
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setShowPassword(p => !p)}
                                                    className="h-8 w-8 !p-0 text-gray-400 hover:text-gray-300 transition-all"
                                                    title={showPassword ? 'Hide Password' : 'Show Password'}
                                                >
                                                    <EyeIcon open={showPassword} />
                                                </Button>
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={handleGeneratePassword}
                                        className="h-[42px] w-[42px] !p-0 flex items-center justify-center shrink-0 border rounded-lg text-indigo-400 hover:text-indigo-300 transition-all mt-0.5"
                                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}
                                        title="Generate Secure Password"
                                    >
                                        <WandIcon />
                                    </Button>
                                </div>
                                <PhoneInputField
                                    label="Admin Phone"
                                    value={formValues.adminPhone}
                                    onChange={v => {
                                        setFormValues(p => ({ ...p, adminPhone: v }))
                                        if (fieldErrors.adminPhone) setFieldErrors(p => ({ ...p, adminPhone: undefined }))
                                    }}
                                    required={false}
                                    error={fieldErrors.adminPhone}
                                />

                                {/* Config toggles */}
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={formValues.isTenantActive}
                                            onChange={e => setFormValues(p => ({ ...p, isTenantActive: e.target.checked }))}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Tenant Active</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={formValues.isAdminActive}
                                            onChange={e => setFormValues(p => ({ ...p, isAdminActive: e.target.checked }))}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Admin Active</span>
                                    </label>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 justify-end mt-4">
                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={formSubmitting}
                                >
                                    {formSubmitting ? 'Creating...' : 'Create Tenant'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default AddTenantModal
