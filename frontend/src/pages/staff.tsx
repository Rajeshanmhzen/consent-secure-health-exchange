import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/shared/Button'
import InputField from '../components/shared/InputField'
import PhoneInputField from '../components/shared/PhoneInputField'
import ConfirmDialog from '../components/shared/ConfirmDialog'

type StaffMember = {
  id: string
  name: string
  role: 'DOCTOR' | 'RECEPTIONIST'
  email: string
  phone: string
  specialty?: string
  licenseNumber?: string
  isActive: boolean
  createdAt: string
}

const INITIAL_STAFF: StaffMember[] = [
  { id: 'st-1', name: 'Dr. Gregory House', role: 'DOCTOR', email: 'gregory.house@sebastians.org', phone: '+1 (555) 019-2834', specialty: 'Diagnostic Medicine', licenseNumber: 'MD-10825', isActive: true, createdAt: '2026-01-10T08:00:00Z' },
  { id: 'st-2', name: 'Dr. Eric Foreman', role: 'DOCTOR', email: 'eric.foreman@sebastians.org', phone: '+1 (555) 012-9911', specialty: 'Neurology', licenseNumber: 'MD-24890', isActive: true, createdAt: '2026-02-15T09:30:00Z' },
  { id: 'st-3', name: 'Dr. Allison Cameron', role: 'DOCTOR', email: 'allison.cameron@sebastians.org', phone: '+1 (555) 014-8833', specialty: 'Immunology', licenseNumber: 'MD-30912', isActive: true, createdAt: '2026-03-01T10:15:00Z' },
  { id: 'st-4', name: 'Martha M. Masters', role: 'RECEPTIONIST', email: 'martha.masters@sebastians.org', phone: '+1 (555) 015-7722', isActive: true, createdAt: '2026-04-05T14:00:00Z' },
]

const StaffPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('hie_staff')
    return saved ? JSON.parse(saved) : INITIAL_STAFF
  })

  useEffect(() => {
    localStorage.setItem('hie_staff', JSON.stringify(staff))
  }, [staff])

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  
  // Modals state
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<'DOCTOR' | 'RECEPTIONIST'>('DOCTOR')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' })

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  // Security Gate
  if (user.role !== 'HOSPITAL_ADMIN') {
    navigate('/dashboard')
    return null
  }

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !phone) {
      showToast('Please fill out all required credentials', 'warning')
      return
    }

    if (role === 'DOCTOR' && !licenseNumber) {
      showToast('Please specify the physician license number', 'warning')
      return
    }

    const newMember: StaffMember = {
      id: `st-${Date.now()}`,
      name,
      role,
      email,
      phone,
      specialty: role === 'DOCTOR' ? (specialty || 'General Practice') : undefined,
      licenseNumber: role === 'DOCTOR' ? licenseNumber : undefined,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    setStaff(prev => [newMember, ...prev])
    showToast(`Staff member ${name} successfully registered and onboarded!`, 'success')
    setShowModal(false)

    // Reset Form
    setName('')
    setRole('DOCTOR')
    setEmail('')
    setPhone('')
    setSpecialty('')
    setLicenseNumber('')
  }

  const handleToggleActive = (id: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.isActive
        showToast(`${s.name}'s account has been ${nextState ? 'activated' : 'deactivated'}.`, 'info')
        return { ...s, isActive: nextState }
      }
      return s
    }))
  }

  const handleDeleteConfirm = () => {
    setStaff(prev => prev.filter(s => s.id !== deleteConfirm.id))
    showToast(`Staff member "${deleteConfirm.name}" removed from payroll registry.`, 'success')
    setDeleteConfirm({ isOpen: false, id: '', name: '' })
  }

  // Filter staff list
  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'All' || s.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Staff Stats
  const docCount = staff.filter(s => s.role === 'DOCTOR' && s.isActive).length
  const recepCount = staff.filter(s => s.role === 'RECEPTIONIST' && s.isActive).length

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col gap-6"
      >
        {/* Page header */}
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

        {/* Small Statistics row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl flex flex-col justify-between border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-secondary)' }}>Total Staff</span>
            <span className="text-2xl font-extrabold mt-1" style={{ color: 'var(--color-text)' }}>{staff.length}</span>
          </div>
          <div className="p-4 rounded-xl flex flex-col justify-between border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">Active Doctors</span>
            <span className="text-2xl font-extrabold mt-1" style={{ color: 'var(--color-text)' }}>{docCount}</span>
          </div>
          <div className="p-4 rounded-xl flex flex-col justify-between border col-span-2 sm:col-span-1 style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}">
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Active Receptionists</span>
            <span className="text-2xl font-extrabold mt-1" style={{ color: 'var(--color-text)' }}>{recepCount}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="md:col-span-2 flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" style={{ color: 'var(--color-text-secondary)' }}>
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--color-text)' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none w-full"
              style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              <option value="All">All Roles</option>
              <option value="DOCTOR">DOCTOR</option>
              <option value="RECEPTIONIST">RECEPTIONIST</option>
            </select>
          </div>
        </div>

        {/* Directory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStaff.length === 0 ? (
            <div className="md:col-span-2 p-12 text-center rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No personnel records found</p>
            </div>
          ) : filteredStaff.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="p-5 rounded-2xl flex flex-col gap-4 justify-between border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', opacity: s.isActive ? 1 : 0.6 }}
            >
              {/* Profile details */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                    {s.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold truncate" style={{ color: 'var(--color-text)' }}>{s.name}</h3>
                    <span className="text-[10px] font-extrabold uppercase inline-block mt-0.5 rounded-full px-2 py-0.5" style={{ backgroundColor: s.role === 'DOCTOR' ? 'var(--color-primary-ghost)' : 'var(--color-success-light)', color: s.role === 'DOCTOR' ? 'var(--color-primary)' : 'var(--color-success)' }}>
                      {s.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    {s.isActive ? 'Active' : 'Suspended'}
                  </span>
                  {/* Custom Toggle Switch */}
                  <button
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
              </div>

              {/* Contact / Specialty specs */}
              <div className="p-3.5 rounded-xl text-xs flex flex-col gap-1.5" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                {s.role === 'DOCTOR' && s.licenseNumber && (
                  <div>
                    <span className="font-bold text-(--color-text-secondary)">License ID: </span>
                    <span className="font-semibold text-violet-400">{s.licenseNumber}</span>
                  </div>
                )}
                {s.specialty && (
                  <div>
                    <span className="font-bold text-(--color-text-secondary)">Specialization: </span>
                    <span style={{ color: 'var(--color-text)' }}>{s.specialty}</span>
                  </div>
                )}
                <div>
                  <span className="font-bold text-(--color-text-secondary)">Email: </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{s.email}</span>
                </div>
                <div>
                  <span className="font-bold text-(--color-text-secondary)">Phone: </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{s.phone}</span>
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  Onboarded: {new Date(s.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => setDeleteConfirm({ isOpen: true, id: s.id, name: s.name })}
                  className="text-xs font-bold text-rose-500 hover:text-rose-400"
                >
                  De-authorize Staff
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Onboarding Drawer/Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            {/* Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl rounded-2xl p-6 shadow-xl z-10 flex flex-col gap-5 border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Onboard New Staff Member</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Create login keys and configure role settings for hospital employees.</p>
              </div>

              <form onSubmit={handleAddStaff} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Full Name" value={name} onChange={setName} placeholder="Dr. Gregory House" />
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Security Key Role</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as any)}
                      className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent"
                      style={{ border: '1px solid var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                    >
                      <option value="DOCTOR">DOCTOR</option>
                      <option value="RECEPTIONIST">RECEPTIONIST</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Hospital Email" type="email" value={email} onChange={setEmail} placeholder="house@hospital.org" />
                  <PhoneInputField label="Phone Number" value={phone} onChange={setPhone} />
                </div>

                {role === 'DOCTOR' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Clinical Specialization / Department"
                      value={specialty}
                      onChange={setSpecialty}
                      placeholder="e.g. Diagnostic Medicine, Neurology"
                    />
                    <InputField
                      label="Medical License Number"
                      value={licenseNumber}
                      onChange={setLicenseNumber}
                      placeholder="e.g. MD-10825"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-3">
                  <Button variant="default" size="md" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" size="md" type="submit">Onboard Staff</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm De-authorize dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDeleteConfirm}
        type="danger"
        title="Confirm Staff De-authorization"
        description={`Are you sure you want to de-authorize "${deleteConfirm.name}"? This will suspend all cryptographic signatures and deactivate their login sessions immediately.`}
        confirmLabel="De-authorize"
        cancelLabel="Cancel"
      />
    </DashboardLayout>
  )
}

export default StaffPage
