import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import { StaffSkeleton } from '../components/skeletons/PageSkeletons'
import Button from '../components/shared/Button'
import FilterTabs from '../components/shared/FilterTabs'
import InputField from '../components/shared/InputField'
import PhoneInputField from '../components/shared/PhoneInputField'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import Pagination from '../components/shared/Pagination'
import Checkbox from '../components/shared/Checkbox'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { tenantApi, type TenantUserRole } from '../services/tenant.service'
import { validateStaffForm, type StaffFormErrors } from '../validation/staff.validation'

type StaffMember = {
  id: string
  name: string
  role: TenantUserRole
  email: string
  phone: string
  tenantId?: string
  hospitalId?: string
  specialty?: string
  licenseNumber?: string
  dob?: string
  gender?: string
  bloodGroup?: string
  allergies?: string
  isActive: boolean
  isVerified?: boolean
  createdAt: string
}

const INITIAL_STAFF: StaffMember[] = []

const PASSWORD_LENGTH = 12
const PASSWORD_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:,.?/'

type StaffRoleTab = 'ALL' | TenantUserRole

const staffTabs: { key: StaffRoleTab; label: string }[] = [
  { key: 'ALL', label: 'All Roles' },
  { key: 'DOCTOR', label: 'Doctors' },
  { key: 'RECEPTIONIST', label: 'Receptionists' },
  { key: 'PATIENT', label: 'Patients' },
]

const STAFF_PAGE_SIZE = 6

function generateRandomPassword(length = PASSWORD_LENGTH) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const digits = '0123456789'
  const special = '!@#$%^&*()-_=+[]{};:,.?/'

  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ]

  const bytes = new Uint32Array(Math.max(0, length - required.length))
  crypto.getRandomValues(bytes)
  const remaining = Array.from(bytes, value => PASSWORD_CHARS[value % PASSWORD_CHARS.length])

  const chars = [...required, ...remaining]
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]]
  }

  return chars.join('')
}

const StaffPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF)
  const [totalStaff, setTotalStaff] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<StaffRoleTab>('ALL')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const fetchStaff = async () => {
    if (!user?.tenantId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await tenantApi.listUsers({ tenantId: user.tenantId, page, limit: STAFF_PAGE_SIZE, search, role: roleFilter === 'ALL' ? undefined : roleFilter })
      const users = res.data.users.map((u: any) => ({
        id: u.id,
        name: u.doctor?.name ?? u.receptionist?.name ?? u.patient?.name ?? 'Unknown',
        role: u.role as TenantUserRole,
        email: u.email,
        phone: u.phone ?? '',
        tenantId: u.tenantId,
        specialty: u.doctor?.specialization,
        licenseNumber: u.doctor?.licenseNumber,
        dob: u.patient?.dob,
        gender: u.patient?.gender,
        bloodGroup: u.patient?.bloodGroup,
        allergies: u.patient?.allergies,
        isActive: u.isActive,
        isVerified: u.isVerified,
        createdAt: u.createdAt
      }))
      setStaff(users)
      setTotalStaff(res.data.pagination.total)
    } catch (err) {
      showToast('Failed to load staff directory', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [user, page, search, roleFilter])


  // Modals state
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<TenantUserRole>('DOCTOR')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [allergies, setAllergies] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isVerified, setIsVerified] = useState(true)
  const [errors, setErrors] = useState<StaffFormErrors>({})

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' })
  const [viewStaffId, setViewStaffId] = useState<string | null>(null)
  const [editStaffId, setEditStaffId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  if (user.role !== 'HOSPITAL_ADMIN') {
    navigate('/dashboard')
    return null
  }

  if (loading) {
    return <StaffSkeleton />
  }

  const resetForm = () => {
    setName('')
    setRole('DOCTOR')
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setPhone('')
    setSpecialty('')
    setLicenseNumber('')
    setDob('')
    setGender('')
    setBloodGroup('')
    setAllergies('')
    setIsActive(true)
    setIsVerified(true)
    setErrors({})
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateStaffForm({
      role,
      name,
      email,
      password,
      phone,
      specialty,
      dob,
      tenantId: user?.tenantId,
      hospitalId: user?.hospitalId,
      isEditMode: Boolean(editStaffId),
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      showToast(validationErrors.form ?? Object.values(validationErrors).find(Boolean) ?? 'Please correct the form errors', 'warning')
      return
    }

    setErrors({})

    setSaving(true)
    try {
      if (editStaffId) {
        await tenantApi.updateUser(editStaffId, {
          email,
          phone,
          isActive,
          isVerified,
          name,
          specialization: role === 'DOCTOR' ? specialty : null,
          licenseNumber: role === 'DOCTOR' ? licenseNumber : null,
          dob: role === 'PATIENT' ? dob || null : null,
          gender: role === 'PATIENT' ? gender || null : null,
          bloodGroup: role === 'PATIENT' ? bloodGroup || null : null,
          allergies: role === 'PATIENT' ? allergies || null : null,
        })
        showToast(`Staff member ${name} updated!`, 'success')
      } else {
        await tenantApi.addUser({
          tenantId: user!.tenantId!,
          hospitalId: role === 'DOCTOR' || role === 'RECEPTIONIST' ? user!.hospitalId! : undefined,
          email,
          password,
          role,
          phone,
          name,
          specialization: role === 'DOCTOR' ? specialty : null,
          licenseNumber: role === 'DOCTOR' ? licenseNumber : null,
          dob: role === 'PATIENT' ? dob || null : null,
          gender: role === 'PATIENT' ? gender || null : null,
          bloodGroup: role === 'PATIENT' ? bloodGroup || null : null,
          allergies: role === 'PATIENT' ? allergies || null : null,
          isActive,
          isVerified,
        })
        showToast(`Staff member ${name} successfully registered and onboarded!`, 'success')
      }
      setShowModal(false)
      setEditStaffId(null)
      resetForm()
      fetchStaff()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to register staff member'
      showToast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    const member = staff.find(s => s.id === id)
    if (!member) return
    try {
      await tenantApi.updateUser(id, { isActive: !member.isActive })
      setStaff(prev => prev.map(s => {
        if (s.id === id) {
          const nextState = !s.isActive
          showToast(`${s.name}'s account has been ${nextState ? 'activated' : 'deactivated'}.`, 'info')
          return { ...s, isActive: nextState }
        }
        return s
      }))
    } catch (err: any) {
      showToast(err.message ?? 'Failed to update status', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await tenantApi.deleteUser(deleteConfirm.id)
      setStaff(prev => prev.filter(s => s.id !== deleteConfirm.id))
      showToast(`Staff member "${deleteConfirm.name}" removed from payroll registry.`, 'success')
      setDeleteConfirm({ isOpen: false, id: '', name: '' })
    } catch (err: any) {
      showToast(err.message ?? 'Failed to delete staff member', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalStaff / STAFF_PAGE_SIZE))
  const paginatedStaff = staff

  // Staff Stats
  const docCount = staff.filter(s => s.role === 'DOCTOR' && s.isActive).length
  const receptionistCount = staff.filter(s => s.role === 'RECEPTIONIST' && s.isActive).length

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Clinic Staff Directory</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Onboard practitioners, assign role keys, and manage login authorization records.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowModal(true)}
            leftIcon={<span className="text-lg font-bold leading-none">+</span>}
          >
            Onboard Staff
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl flex flex-col justify-between border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-secondary)' }}>Total Staff</span>
            <span className="text-2xl font-extrabold mt-1" style={{ color: 'var(--color-text)' }}>{totalStaff}</span>
          </div>
          <div className="p-4 rounded-xl flex flex-col justify-between border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">Active Doctors</span>
            <span className="text-2xl font-extrabold mt-1" style={{ color: 'var(--color-text)' }}>{docCount}</span>
          </div>
          <div className="p-4 rounded-xl flex flex-col justify-between border col-span-2 sm:col-span-1" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Active Receptionists</span>
            <span className="text-2xl font-extrabold mt-1" style={{ color: 'var(--color-text)' }}>{receptionistCount}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="md:col-span-2 flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" style={{ color: 'var(--color-text-secondary)' }}>
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--color-text)' }}
            />
          </div>

          <FilterTabs
            tabs={staffTabs}
            value={roleFilter}
            onChange={(val) => { setRoleFilter(val); setPage(1) }}
            layoutId="activeStaffTabUnderline"
          />
        </div>

        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)' }}>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Staff Member</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Details</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No personnel records found</p>
                    </td>
                  </tr>
                ) : paginatedStaff.map((s) => (
                  <tr key={s.id} className="border-t transition-colors" style={{ borderColor: 'var(--color-border)', opacity: s.isActive ? 1 : 0.65 }}>
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                          {s.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-extrabold truncate" style={{ color: 'var(--color-text)' }}>{s.name}</h3>
                          <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--color-text-secondary)' }}>Joined {new Date(s.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase" style={{ backgroundColor: s.role === 'DOCTOR' ? 'var(--color-primary-ghost)' : s.role === 'RECEPTIONIST' ? 'var(--color-success-light)' : 'var(--color-warning-light)', color: s.role === 'DOCTOR' ? 'var(--color-primary)' : s.role === 'RECEPTIONIST' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {s.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <div>{s.email}</div>
                      <div className="text-xs mt-1">{s.phone}</div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className="text-xs font-semibold" style={{ color: s.isActive ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                        {s.isActive ? 'Active' : 'Suspended'}
                      </span>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(s.id)}
                          className="relative w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer"
                          style={{ backgroundColor: s.isActive ? 'var(--color-success)' : 'var(--color-border)' }}
                        >
                          <motion.div
                            layout
                            className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                            animate={{ x: s.isActive ? 14 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {s.role === 'DOCTOR' && s.licenseNumber && (
                        <div><span className="font-bold" style={{ color: 'var(--color-text)' }}>License: </span>{s.licenseNumber}</div>
                      )}
                      {s.specialty && (
                        <div className="mt-1"><span className="font-bold" style={{ color: 'var(--color-text)' }}>Specialty: </span>{s.specialty}</div>
                      )}
                      {s.role === 'PATIENT' && s.dob && (
                        <div className="mt-1"><span className="font-bold" style={{ color: 'var(--color-text)' }}>DOB: </span>{s.dob}</div>
                      )}
                      {s.role === 'PATIENT' && s.bloodGroup && (
                        <div className="mt-1"><span className="font-bold" style={{ color: 'var(--color-text)' }}>Blood: </span>{s.bloodGroup}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setViewStaffId(s.id)}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const m = staff.find(x => x.id === s.id)
                            if (m) {
                              setEditStaffId(m.id)
                              setName(m.name)
                              setRole(m.role)
                              setEmail(m.email)
                              setPhone(m.phone || '')
                              setSpecialty(m.specialty || '')
                              setLicenseNumber(m.licenseNumber || '')
                              setDob(m.dob || '')
                              setGender(m.gender || '')
                              setBloodGroup(m.bloodGroup || '')
                              setAllergies(m.allergies || '')
                              setIsActive(m.isActive)
                              setIsVerified(m.isVerified || false)
                            }
                          }}
                          className="text-xs font-bold text-amber-500 hover:text-amber-400"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ isOpen: true, id: s.id, name: s.name })}
                          className="text-xs font-bold text-rose-500 hover:text-rose-400"
                          title="De-authorize"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {(showModal || editStaffId) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowModal(false); setEditStaffId(null); resetForm() }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full sm:w-[55vw] min-h-[70vh] max-h-[90vh] overflow-y-auto max-w-4xl rounded-2xl p-6 shadow-xl z-10 flex flex-col gap-5 border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <button
                type="button"
                onClick={() => { setShowModal(false); setEditStaffId(null); resetForm() }}
                aria-label="Close onboarding dialog"
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>

              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{editStaffId ? 'Edit Staff Member' : 'Onboard New Staff Member'}</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Create login keys and configure role settings for hospital employees.</p>
              </div>

              <form onSubmit={handleAddStaff} className="flex flex-col gap-4">
                {errors.form && (
                  <div className="rounded-xl border px-3 py-2 text-xs font-medium text-amber-600" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}>
                    {errors.form}
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <InputField label="Full Name" value={name} onChange={setName} placeholder="Dr. Gregory House" error={errors.name} />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Security Key Role</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as TenantUserRole)}
                      className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent"
                      style={{ border: '1px solid var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                    >
                      <option value="DOCTOR">DOCTOR</option>
                      <option value="RECEPTIONIST">RECEPTIONIST</option>
                      <option value="PATIENT">PATIENT</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <InputField label="Hospital Email" type="email" value={email} onChange={setEmail} placeholder="house@hospital.org" error={errors.email} />
                  {!editStaffId && (
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <InputField
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={setPassword}
                          placeholder="Create a temporary password"
                          error={errors.password}
                          rightAdornment={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPassword(prev => !prev)}
                              className="rounded-full"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? (
                                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                  <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c5.5 0 9.6 3.6 11 8-0.5 1.6-1.4 3-2.5 4.1" />
                                  <path d="M6.1 6.1C4 7.6 2.5 9.7 2 12c1.4 4.4 5.5 8 10 8 1.2 0 2.3-0.2 3.4-0.6" />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1.9 12C3.3 7.6 7.4 4 12 4s8.7 3.6 10.1 8c-1.4 4.4-5.5 8-10.1 8S3.3 16.4 1.9 12Z" />
                                  <circle cx="12" cy="12" r="3.5" />
                                </svg>
                              )}
                            </Button>
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="default"
                        size="md"
                        onClick={() => setPassword(generateRandomPassword())}
                        className="mb-[2px] px-3 border"
                        aria-label="Generate random password"
                        style={{ height: '42px', borderColor: 'var(--color-border)' }}
                        title="Generate Secure Password"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
                          <path d="M15 4V2" />
                          <path d="M15 16v-2" />
                          <path d="M8 9h2" />
                          <path d="M20 9h2" />
                          <path d="M17.8 6.2 19 5" />
                          <path d="M17.8 11.8 19 13" />
                          <path d="M3 21l9-9" />
                          <path d="M14.5 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                        </svg>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <PhoneInputField label="Phone Number" value={phone} onChange={setPhone} error={errors.phone} />
                </div>

                {role === 'DOCTOR' && (
                  <div className="flex flex-col gap-4">
                    <InputField
                      label="Clinical Specialization / Department"
                      value={specialty}
                      onChange={setSpecialty}
                      placeholder="e.g. Diagnostic Medicine, Neurology"
                      error={errors.specialty}
                    />
                    <InputField
                      label="Medical License Number"
                      value={licenseNumber}
                      onChange={setLicenseNumber}
                      placeholder="e.g. MD-10825"
                    />
                  </div>
                )}

                {role === 'PATIENT' && (
                  <div className="flex flex-col gap-4">
                    <InputField label="Date of Birth" type="date" value={dob} onChange={setDob} error={errors.dob} />
                    <InputField
                      label="Gender"
                      as="select"
                      value={gender}
                      onChange={setGender}
                      options={[
                        { label: 'Select Gender', value: '' },
                        { label: 'Male', value: 'Male' },
                        { label: 'Female', value: 'Female' },
                        { label: 'Other', value: 'Other' },
                      ]}
                    />
                    <InputField
                      label="Blood Group"
                      as="select"
                      value={bloodGroup}
                      onChange={setBloodGroup}
                      options={[
                        { label: 'Select Blood Group', value: '' },
                        { label: 'A+', value: 'A+' },
                        { label: 'A-', value: 'A-' },
                        { label: 'B+', value: 'B+' },
                        { label: 'B-', value: 'B-' },
                        { label: 'AB+', value: 'AB+' },
                        { label: 'AB-', value: 'AB-' },
                        { label: 'O+', value: 'O+' },
                        { label: 'O-', value: 'O-' },
                      ]}
                    />
                    <InputField label="Allergies" value={allergies} onChange={setAllergies} placeholder="Penicillin, dust, etc." required={false} />
                  </div>
                )}

                <div className="flex items-center gap-6 px-1 pt-2 border-t mt-1" style={{ borderColor: 'var(--color-border)' }}>
                  <Checkbox
                    label="Active Account"
                    checked={isActive}
                    onChange={setIsActive}
                  />
                  <Checkbox
                    label="Verified Profile"
                    checked={isVerified}
                    onChange={setIsVerified}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-3">
                  <Button variant="default" size="md" type="button" onClick={() => { setShowModal(false); setEditStaffId(null); resetForm() }}>Cancel</Button>
                  <Button variant="primary" size="md" type="submit" isLoading={saving} loadingText="Saving staff">{editStaffId ? 'Update Staff' : 'Onboard Staff'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewStaffId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewStaffId(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full sm:w-[45vw] rounded-2xl p-6 shadow-xl z-10 flex flex-col gap-5 border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <button type="button" onClick={() => setViewStaffId(null)} className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors bg-gray-100 hover:bg-gray-200 text-gray-500">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12" /><path d="M18 6 6 18" /></svg>
              </button>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Staff Details</h3>
              {(() => {
                const s = staff.find(x => x.id === viewStaffId)
                if (!s) return null
                return (
                  <div className="flex flex-col gap-4 text-sm" style={{ color: 'var(--color-text)' }}>
                    <div className="grid grid-cols-2 gap-y-3">
                      <div><strong className="text-xs uppercase opacity-70 block mb-0.5">Name</strong>{s.name}</div>
                      <div><strong className="text-xs uppercase opacity-70 block mb-0.5">Role</strong>{s.role}</div>
                      <div><strong className="text-xs uppercase opacity-70 block mb-0.5">Email</strong>{s.email}</div>
                      <div><strong className="text-xs uppercase opacity-70 block mb-0.5">Phone</strong>{s.phone}</div>
                      <div><strong className="text-xs uppercase opacity-70 block mb-0.5">Status</strong>{s.isActive ? 'Active' : 'Inactive'}</div>
                      <div><strong className="text-xs uppercase opacity-70 block mb-0.5">Joined</strong>{new Date(s.createdAt).toLocaleDateString()}</div>
                      {s.role === 'DOCTOR' && s.specialty && <div><strong className="text-xs uppercase opacity-70 block mb-0.5">Specialty</strong>{s.specialty}</div>}
                      {s.role === 'DOCTOR' && s.licenseNumber && <div><strong className="text-xs uppercase opacity-70 block mb-0.5">License No.</strong>{s.licenseNumber}</div>}
                    </div>
                  </div>
                )
              })()}
              <div className="flex justify-end mt-2">
                <Button variant="default" onClick={() => setViewStaffId(null)}>Close</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDeleteConfirm}
        type="danger"
        title="Confirm Staff De-authorization"
        description={`Are you sure you want to de-authorize "${deleteConfirm.name}"? This will suspend all cryptographic signatures and deactivate their login sessions immediately.`}
        confirmLabel="De-authorize"
        cancelLabel="Cancel"
        isLoading={deleting}
      />
    </DashboardLayout>
  )
}

export default StaffPage
