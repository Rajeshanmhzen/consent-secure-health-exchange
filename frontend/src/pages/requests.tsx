import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import FilterTabs from '../components/shared/FilterTabs'
import Button from '../components/shared/Button'
import InputField from '../components/shared/InputField'
import { requestApi } from '../services/request.service'

type HieRequest = {
  id: string
  patientId: string
  requestingDoctorId: string
  targetDoctorId: string
  reason: string
  status: 'PENDING' | 'PATIENT_APPROVED' | 'APPROVED' | 'REJECTED'
  createdAt: string
  patient?: {
    name: string
  }
  requestingDoctor?: {
    name: string
    hospital?: {
      name: string
    }
  }
  targetDoctor?: {
    name: string
    hospital?: {
      name: string
    }
  }
}

type SharedRecord = {
  id: string
  patientId: string
  doctorId: string
  diagnosis: string | null
  prescription: string | null
  notes: string | null
  createdAt: string
  doctor?: { name: string; specialization?: string | null }
  patient?: { name: string }
  files?: { id: string; fileName?: string | null; name?: string }[]
}

const doctorTabs = [
  { key: 'sent', label: 'Sent Requests' },
  { key: 'received', label: 'Received Releases (Awaiting Consent)' }
] as const

const statusTabs = [
  { key: 'All', label: 'All Requests' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'PATIENT_APPROVED', label: 'Signed' },
  { key: 'APPROVED', label: 'Active Sessions' },
  { key: 'REJECTED', label: 'Closed / Revoked' }
] as const

const RequestsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [requests, setRequests] = useState<HieRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Shared records viewer
  const [viewingRequest, setViewingRequest] = useState<HieRequest | null>(null)
  const [sharedRecords, setSharedRecords] = useState<SharedRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [viewPdf, setViewPdf] = useState<string | null>(null)

  // Creation State
  const [showModal, setShowModal] = useState(false)
  const [hospitalId, setHospitalId] = useState('')
  const [patientId, setPatientId] = useState('')
  const [targetDoctorId, setTargetDoctorId] = useState('')
  const [reason, setReason] = useState('')

  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>([])
  const [localPatients, setLocalPatients] = useState<{ id: string; name: string }[]>([])
  const [networkDoctors, setNetworkDoctors] = useState<{ id: string; name: string; specialization?: string | null }[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>(user?.role === 'DOCTOR' ? 'sent' : 'received')
  const [statusFilter, setStatusFilter] = useState('All')

  const isDoctor = user?.role === 'DOCTOR'
  const isPatient = user?.role === 'PATIENT'

  const backendBase = (import.meta.env.VITE_API_URL as string || 'http://localhost:8080/api/v1').replace(/\/api.*$/, '')

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await requestApi.list() as any
      setRequests(data.data || [])
    } catch (e: any) {
      showToast(e.message || 'Failed to sync exchange requests from HIE network', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchRequests()
    if (isDoctor) {
      requestApi.listAllHospitals().then(res => {
        setHospitals(((res as any).data || []).map((h: any) => ({ id: h.id, name: h.name })))
      }).catch(() => { })
    }
  }, [user])

  const fetchDropdownData = async (selectedHospitalId: string) => {
    setLoadingDropdowns(true)
    try {
      const [docsRes, patientsRes] = await Promise.all([
        requestApi.listAllDoctors(selectedHospitalId),
        requestApi.listAllPatients(selectedHospitalId)
      ])
      setNetworkDoctors(((docsRes as any).data || []).map((d: any) => ({
        id: d.id,
        name: d.name || '—',
        specialization: d.specialization
      })))
      setLocalPatients(((patientsRes as any).data || []).map((p: any) => ({
        id: p.id,
        name: p.name || '—'
      })).filter((p: { id: string; name: string }) => p.name !== '—'))
    } catch {
      setNetworkDoctors([])
      setLocalPatients([])
    } finally {
      setLoadingDropdowns(false)
    }
  }

  const handleHospitalChange = (newHospitalId: string) => {
    setHospitalId(newHospitalId)
    setTargetDoctorId('')
    setPatientId('')
    setNetworkDoctors([])
    setLocalPatients([])
    if (newHospitalId) {
      fetchDropdownData(newHospitalId)
    }
  }

  useEffect(() => {
    if (location.state && (location.state as any).requestPatientId) {
      setPatientId((location.state as any).requestPatientId)
      setShowModal(true)
      // clear navigation state to prevent re-opening on manual refreshes
      window.history.replaceState({}, document.title)
    }
  }, [location])

  if (!user) return null

  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter
    if (!matchesStatus) return false

    if (isPatient) return true // Patients see requests pertaining to them
    if (isDoctor) {
      if (activeTab === 'sent') {
        return r.requestingDoctorId === user.id || r.requestingDoctor?.name === user.name
      } else {
        return r.targetDoctorId === user.id || r.targetDoctor?.name === user.name
      }
    }
    return true
  })

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId) {
      showToast('Please select a target patient dossier.', 'warning')
      return
    }
    if (!targetDoctorId) {
      showToast('Please select the Custodian physician holding records.', 'warning')
      return
    }
    if (!reason || reason.length < 8) {
      showToast('Provide a clear clinical reason (min 8 characters).', 'warning')
      return
    }

    try {
      await requestApi.create({
        patientId,
        targetDoctorId,
        reason
      })
      showToast('Data Request registered successfully! Awaiting Patient OTP Signature.', 'success')
      setShowModal(false)
      setHospitalId('')
      setPatientId('')
      setTargetDoctorId('')
      setReason('')
      fetchRequests()
    } catch (e: any) {
      showToast(e.message || 'Failed to register data request.', 'error')
    }
  }

  const handleAction = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await requestApi.hospitalConsent({ requestId, action })
      showToast(`Exchange request ${action === 'APPROVE' ? 'Approved & Released' : 'Rejected'} successfully!`, 'success')
      fetchRequests()
    } catch (e: any) {
      showToast(e.message || 'Operation failed.', 'error')
    }
  }

  const handleViewSharedRecords = async (req: HieRequest) => {
    setViewingRequest(req)
    setSharedRecords([])
    setLoadingRecords(true)
    try {
      const res = await requestApi.getSharedRecords(req.id) as { data: SharedRecord[] }
      setSharedRecords(res.data || [])
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to load shared records', 'error')
      setViewingRequest(null)
    } finally {
      setLoadingRecords(false)
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col gap-6"
      >
        {/* Page header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Cross-Hospital Exchange Requests</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Dual Consent ledger for clinical record transfers across health clinics.
            </p>
          </div>
          {isDoctor && (
            <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
              Request Remote Dossier
            </Button>
          )}
        </div>

        {/* Tab Selection */}
        <div className="bg-(--color-surface) rounded-2xl px-4 py-2 border border-(--color-border) flex flex-col gap-2">
          {isDoctor && (
            <FilterTabs
              tabs={doctorTabs}
              value={activeTab}
              onChange={(val) => setActiveTab(val as any)}
              layoutId="doctorRequestsTab"
            />
          )}
          <FilterTabs
            tabs={statusTabs}
            value={statusFilter}
            onChange={setStatusFilter}
            layoutId="statusRequestsTab"
          />
        </div>

        {/* TABLE LISTING */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-12 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
            <span className="col-span-3">Patient Name</span>
            <span className="col-span-3">Requestor / Clinic</span>
            <span className="col-span-2">Custodian Doctor</span>
            <span className="col-span-2 text-center">Status</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center text-xs text-(--color-text-secondary) animate-pulse">
              Loading requests ledger...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <svg viewBox="0 0 24 24" className="h-10 w-10 mx-auto mb-3 text-(--color-text-tertiary)" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No exchange requests</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Requests for medical files will appear here.</p>
            </div>
          ) : filteredRequests.map((r, index) => {
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
                className="grid grid-cols-12 items-center px-5 py-4 text-sm transition-all border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {/* Patient */}
                <div className="col-span-3 flex flex-col pr-2">
                  <span className="font-semibold text-(--color-text)">{r.patient?.name || 'Incapacitated Patient'}</span>
                  <span className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Requested: {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Requestor */}
                <div className="col-span-3 flex flex-col pr-2">
                  <span className="font-medium text-(--color-text)">{r.requestingDoctor?.name || 'Requesting Clinician'}</span>
                  <span className="text-[10px] mt-0.5 text-(--color-text-secondary)">{r.requestingDoctor?.hospital?.name || 'External HIE Hospital'}</span>
                </div>

                {/* Custodian */}
                <span className="col-span-2 text-xs truncate pr-2 text-(--color-text-secondary)">
                  {r.targetDoctor?.name || 'Local Custodian'}
                </span>

                {/* Status Badge */}
                <div className="col-span-2 text-center">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
                    style={{
                      backgroundColor: r.status === 'APPROVED' ? 'var(--color-success-light)' : r.status === 'PENDING' ? 'var(--color-warning-light)' : r.status === 'PATIENT_APPROVED' ? 'var(--color-primary-light)' : 'var(--color-error-light)',
                      color: r.status === 'APPROVED' ? 'var(--color-success)' : r.status === 'PENDING' ? 'var(--color-warning)' : r.status === 'PATIENT_APPROVED' ? 'var(--color-primary)' : 'var(--color-error)',
                    }}
                  >
                    {r.status === 'PATIENT_APPROVED' ? 'PATIENT SIGNED' : r.status}
                  </span>
                </div>

                {/* Action Items */}
                <div className="col-span-2 flex items-center justify-end">
                  {isDoctor && r.status === 'APPROVED' && (
                    <button
                      onClick={() => handleViewSharedRecords(r)}
                      className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View Records
                    </button>
                  )}
                  {isDoctor && activeTab === 'received' && r.status === 'PATIENT_APPROVED' && (
                    <div className="flex gap-2">
                      <Button variant="danger" size="sm" onClick={() => handleAction(r.id, 'REJECT')}>
                        Reject
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleAction(r.id, 'APPROVE')}>
                        Release
                      </Button>
                    </div>
                  )}
                  {isPatient && r.status === 'PENDING' && (
                    <button
                      onClick={() => navigate('/dashboard/consent', { state: { requestId: r.id } })}
                      className="text-xs font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer animate-pulse"
                    >
                      Sign OTP Consent
                    </button>
                  )}
                  {(!isDoctor || activeTab !== 'received' || r.status !== 'PATIENT_APPROVED') && (!isPatient || r.status !== 'PENDING') && (
                    <span className="text-xs italic text-(--color-text-tertiary)">{r.reason ? `"${r.reason}"` : 'No action'}</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* SHARED RECORDS VIEWER MODAL */}
      <AnimatePresence>
        {viewingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingRequest(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative rounded-2xl p-6 shadow-xl z-10 flex flex-col gap-5 border max-h-[90vh] overflow-y-auto"
              style={{ width: 'clamp(500px, 75vw, 1100px)', backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <button type="button" onClick={() => setViewingRequest(null)} className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gray-500/10 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>

              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Shared Records</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Patient: <span className="font-semibold">{viewingRequest.patient?.name}</span> · Custodian: <span className="font-semibold">{viewingRequest.targetDoctor?.name}</span>
                </p>
              </div>

              {loadingRecords ? (
                <div className="py-10 text-center">
                  <div className="h-8 w-8 mx-auto rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                  <p className="text-xs mt-3" style={{ color: 'var(--color-text-secondary)' }}>Decrypting shared records...</p>
                </div>
              ) : sharedRecords.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>No shared records found for this request.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {sharedRecords.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl border flex flex-col gap-3" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>{new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                          <p className="text-sm font-extrabold mt-0.5" style={{ color: 'var(--color-text)' }}>{r.diagnosis || '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{r.doctor?.name || '—'}</p>
                          <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{r.doctor?.specialization || '—'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Prescription</p>
                          <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-text)' }}>{r.prescription || '—'}</p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Notes</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{r.notes || '—'}</p>
                        </div>
                      </div>
                      {(r.files?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {r.files?.map((f: any) => (
                            <button 
                              key={f.id} 
                              onClick={() => setViewPdf(`${backendBase}${f.fileUrl}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors hover:bg-slate-800" 
                              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                            >
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-400" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" /></svg>
                              {f.fileName || f.name || 'file'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="default" size="md" onClick={() => setViewingRequest(null)}>Close</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACCESS REQUEST MODAL */}
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
              className="relative w-full max-w-lg rounded-2xl p-6 shadow-xl z-10 flex flex-col gap-5 border animate-fadeIn"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Request Cross-Hospital Dossier</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Initiate request under the secure dual consent authorization protocol.</p>
              </div>

              <form onSubmit={handleCreateRequest} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Select Hospital</label>
                  <select
                    value={hospitalId}
                    onChange={e => handleHospitalChange(e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent border cursor-pointer"
                    style={{ borderColor: 'var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                  >
                    <option value="" style={{ background: 'var(--color-surface)' }}>-- Choose Hospital --</option>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id} style={{ background: 'var(--color-surface)' }}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Select Custodian Physician</label>
                  <select
                    value={targetDoctorId}
                    onChange={e => setTargetDoctorId(e.target.value)}
                    disabled={!hospitalId || loadingDropdowns}
                    className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderColor: 'var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                  >
                    <option value="" style={{ background: 'var(--color-surface)' }}>
                      {loadingDropdowns ? 'Loading doctors...' : !hospitalId ? 'Select hospital first' : '-- Choose Holding Clinician --'}
                    </option>
                    {networkDoctors.map(d => (
                      <option key={d.id} value={d.id} style={{ background: 'var(--color-surface)' }}>
                        {d.name}{d.specialization ? ` (${d.specialization})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Select Target Patient</label>
                  <select
                    value={patientId}
                    onChange={e => setPatientId(e.target.value)}
                    disabled={!targetDoctorId || loadingDropdowns}
                    className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderColor: 'var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                  >
                    <option value="" style={{ background: 'var(--color-surface)' }}>
                      {loadingDropdowns ? 'Loading patients...' : !targetDoctorId ? 'Select physician first' : '-- Choose Target Patient --'}
                    </option>
                    {localPatients.map(p => (
                      <option key={p.id} value={p.id} style={{ background: 'var(--color-surface)' }}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Clinical Request Justification"
                  value={reason}
                  onChange={setReason}
                  placeholder="State the medical reasons and records requested (e.g. evaluating cardio history)..."
                />

                <div className="flex justify-end gap-3 mt-1">
                  <Button variant="default" type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Send Request Signature
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF VIEWER MODAL */}
      <AnimatePresence>
        {viewPdf && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewPdf(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative rounded-2xl shadow-2xl z-10 flex flex-col border flex-grow w-full max-w-6xl max-h-[90vh] overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', height: '85vh' }}
            >
              <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="text-sm font-bold tracking-wide text-(--color-text)">Secure Document Viewer <span className="text-[10px] text-red-400 uppercase tracking-widest ml-2 border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded-full">View Only Mode</span></h3>
                <button onClick={() => setViewPdf(null)} className="p-1.5 rounded-full hover:bg-slate-800 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              </div>
              <div className="flex-grow w-full bg-slate-900 overflow-hidden relative">
                {/* #toolbar=0 hides download/print buttons in modern browsers */}
                <iframe src={`${viewPdf}#toolbar=0&navpanes=0`} className="absolute inset-0 w-full h-full border-0" title="Secure PDF View" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default RequestsPage
