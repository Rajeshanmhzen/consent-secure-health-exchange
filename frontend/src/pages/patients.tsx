import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/shared/Button'
import InputField from '../components/shared/InputField'
import PhoneInputField from '../components/shared/PhoneInputField'
import Pagination from '../components/shared/Pagination'
import { tenantApi } from '../services/tenant.service'

type Patient = {
  id: string
  name: string
  dob: string
  gender: string
  phone: string
  email: string
  bloodGroup: string
  allergies: string
  createdAt: string
}

const PatientsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('All')
  const [bloodFilter, setBloodFilter] = useState('All')
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('Male')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [bloodGroup, setBloodGroup] = useState('O+')
  const [allergies, setAllergies] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
  }, [user, navigate])

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true)
      try {
        const res = await tenantApi.listUsers({ tenantId: user.tenantId!, role: 'PATIENT' })
        const mapped: Patient[] = (res.data?.users || []).map((u: any) => ({
          id: u.id,
          name: u.patient?.name || u.name || '—',
          dob: u.patient?.dob || '',
          gender: u.patient?.gender || '—',
          phone: u.phone || '—',
          email: u.email || '—',
          bloodGroup: u.patient?.bloodGroup || '—',
          allergies: u.patient?.allergies || 'None',
          createdAt: u.createdAt,
        }))
        setPatients(mapped)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load patients'
        showToast(message, 'error')
      } finally {
        setLoading(false)
      }
    }
    if (user?.tenantId) fetchPatients()
    else setLoading(false)
  }, [user])

  if (!user) return null

  const isAllowedToRegister = user.role === 'HOSPITAL_ADMIN' || user.role === 'RECEPTIONIST'

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !dob || !phone || !email) {
      showToast('Please fill out all required fields', 'warning')
      return
    }

    try {
      await tenantApi.addUser({
        tenantId: user.tenantId!,
        name,
        email,
        password: 'Patient@123',
        role: 'PATIENT',
        phone,
        dob,
        gender,
        bloodGroup,
        allergies: allergies || null,
      })
      showToast(`Patient ${name} registered successfully!`, 'success')
      setShowModal(false)
      setName('')
      setDob('')
      setGender('Male')
      setPhone('')
      setEmail('')
      setBloodGroup('O+')
      setAllergies('')
      const res = await tenantApi.listUsers({ tenantId: user.tenantId!, role: 'PATIENT' })
      const mapped: Patient[] = (res.data?.users || []).map((u: any) => ({
        id: u.id,
        name: u.patient?.name || u.name || '—',
        dob: u.patient?.dob || '',
        gender: u.patient?.gender || '—',
        phone: u.phone || '—',
        email: u.email || '—',
        bloodGroup: u.patient?.bloodGroup || '—',
        allergies: u.patient?.allergies || 'None',
        createdAt: u.createdAt,
      }))
      setPatients(mapped)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to register patient'
      showToast(message, 'error')
    }
  }

  // Filter logic
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.email.toLowerCase().includes(search.toLowerCase()) ||
                          p.phone.includes(search)
    const matchesGender = genderFilter === 'All' || p.gender === genderFilter
    const matchesBlood = bloodFilter === 'All' || p.bloodGroup === bloodFilter
    return matchesSearch && matchesGender && matchesBlood
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const paginatedPatients = filteredPatients.slice((page - 1) * itemsPerPage, page * itemsPerPage)

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
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Patient Directory</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} matched in this hospital tenant
            </p>
          </div>
          {isAllowedToRegister && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowModal(true)}
              leftIcon={<span className="text-lg font-bold leading-none">+</span>}
            >
              Register Patient
            </Button>
          )}
        </div>

        {/* Search and Filters panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="md:col-span-2 flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" style={{ color: 'var(--color-text-secondary)' }}>
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--color-text)' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <select
              value={genderFilter}
              onChange={e => { setGenderFilter(e.target.value); setPage(1); }}
              className="rounded-xl px-3 py-2 text-sm outline-none w-full"
              style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <select
              value={bloodFilter}
              onChange={e => { setBloodFilter(e.target.value); setPage(1); }}
              className="rounded-xl px-3 py-2 text-sm outline-none w-full"
              style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              <option value="All">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        {/* Directory Listing */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-12 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
            <span className="col-span-4">Patient Profile</span>
            <span className="col-span-2">DOB / Age</span>
            <span className="col-span-2">Blood / Allergies</span>
            <span className="col-span-3">Contact Details</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading patients...</p>
              </div>
            </div>
          ) : paginatedPatients.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <svg viewBox="0 0 24 24" className="h-10 w-10 mx-auto mb-3" fill="currentColor" style={{ color: 'var(--color-text-tertiary)' }}>
                <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No patients found</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Register a new patient or refine filters</p>
            </div>
          ) : paginatedPatients.map((p, index) => {
            const age = new Date().getFullYear() - new Date(p.dob).getFullYear()
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
                className="grid grid-cols-12 items-center px-5 py-4 text-sm transition-all"
                style={{ borderTop: '1px solid var(--color-border)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-table-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Profile */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                    {p.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>{p.name}</p>
                    <span className="text-xs inline-flex items-center rounded-full px-2 py-0.5 font-medium mt-0.5" style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-secondary)' }}>
                      {p.gender}
                    </span>
                  </div>
                </div>

                {/* DOB */}
                <div className="col-span-2 flex flex-col">
                  <span style={{ color: 'var(--color-text)' }}>{p.dob}</span>
                  <span className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{age} years old</span>
                </div>

                {/* Blood Group / Allergies */}
                <div className="col-span-2 flex flex-col gap-1 pr-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md inline-block w-fit text-white" style={{ backgroundColor: p.bloodGroup.includes('-') ? 'var(--color-accent)' : 'var(--color-primary)' }}>
                    {p.bloodGroup}
                  </span>
                  <span className="text-xs truncate font-medium text-rose-500" title={p.allergies}>
                    Allergies: {p.allergies}
                  </span>
                </div>

                {/* Contact */}
                <div className="col-span-3 flex flex-col truncate">
                  <span style={{ color: 'var(--color-text)' }}>{p.phone}</span>
                  <span className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{p.email}</span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-1.5">
                  {user.role === 'DOCTOR' && (
                    <button
                      onClick={() => navigate('/dashboard/records', { state: { filterPatientName: p.name } })}
                      className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                      title="Medical Record Timeline"
                    >
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM11 13h2v2h2v2h-2v2h-2v-2H9v-2h2v-2z" />
                      </svg>
                    </button>
                  )}
                  {user.role === 'RECEPTIONIST' && (
                    <button
                      onClick={() => navigate('/dashboard/schedule', { state: { patientId: p.id, patientName: p.name } })}
                      className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                      title="Schedule Visit"
                    >
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
                        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}

          {totalPages > 1 && (
            <div className="px-5 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
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
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Register New Patient</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Create a patient profile and digital consent anchor.</p>
              </div>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Full Name" value={name} onChange={setName} required placeholder="Johnathan Doe" />
                  <InputField label="Date of Birth" type="date" value={dob} onChange={setDob} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PhoneInputField label="Phone Number" value={phone} onChange={setPhone} required />
                  <InputField label="Email Address" type="email" value={email} onChange={setEmail} required placeholder="john@example.com" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Gender</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent"
                      style={{ border: '1px solid var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent"
                      style={{ border: '1px solid var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <InputField label="Known Medical Allergies (Optional)" value={allergies} onChange={setAllergies} placeholder="Peanuts, Penicillin, etc. (Leave blank if none)" required={false} />

                <div className="flex justify-end gap-3 mt-3">
                  <Button variant="default" size="md" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" size="md" type="submit">Complete Onboarding</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default PatientsPage
