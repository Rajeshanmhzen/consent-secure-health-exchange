import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/shared/Button'
import InputField from '../components/shared/InputField'
import { requestApi } from '../services/request.service'
import { tenantApi } from '../services/tenant.service'

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

const RequestsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [requests, setRequests] = useState<HieRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Creation State
  const [showModal, setShowModal] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [targetDoctorId, setTargetDoctorId] = useState('')
  const [reason, setReason] = useState('')

  const [localPatients, setLocalPatients] = useState<any[]>([])
  const [networkDoctors, setNetworkDoctors] = useState<{ id: string; name: string; hospital: string }[]>([])

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
    if (user.tenantId) {
      tenantApi.listUsers({ tenantId: user.tenantId, role: 'PATIENT' }).then(res => {
        const patients = (res.data?.users || []).map((u: any) => ({
          id: u.patient?.id || u.id,
          name: u.patient?.name || u.name || '—',
        })).filter(p => p.id && p.name !== '—')
        setLocalPatients(patients)
      }).catch(() => {})
      tenantApi.listUsers({ tenantId: user.tenantId, role: 'DOCTOR' }).then(res => {
        const docs = (res.data?.users || [])
          .filter((u: any) => u.id !== user.id)
          .map((u: any) => ({
            id: u.doctor?.id || u.id,
            name: u.doctor?.name || u.name || '—',
            hospital: u.doctor?.hospital?.name || '—',
          }))
          .filter(d => d.id)
        setNetworkDoctors(docs)
      }).catch(() => {})
    }
  }, [user])

  useEffect(() => {
    if (location.state && (location.state as any).requestPatientId) {
      setPatientId((location.state as any).requestPatientId)
      setShowModal(true)
      // clear navigation state to prevent re-opening on manual refreshes
      window.history.replaceState({}, document.title)
    }
  }, [location])

  if (!user) return null

  const isDoctor = user.role === 'DOCTOR'
  const isPatient = user.role === 'PATIENT'

  // active tab state: 'sent' | 'received'
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>(isDoctor ? 'sent' : 'received')

  const filteredRequests = requests.filter(r => {
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

        {/* Tab Selection (For Doctors) */}
        {isDoctor && (
          <div className="flex gap-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => setActiveTab('sent')}
              className="px-4 py-2 text-xs font-bold transition-all border-b-2 outline-none cursor-pointer"
              style={{
                borderColor: activeTab === 'sent' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'sent' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              Sent Requests
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className="px-4 py-2 text-xs font-bold transition-all border-b-2 outline-none cursor-pointer"
              style={{
                borderColor: activeTab === 'received' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'received' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              Received Releases (Awaiting Consent)
            </button>
          </div>
        )}

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
                  <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Select Target Patient</label>
                  <select
                    value={patientId}
                    onChange={e => setPatientId(e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent border cursor-pointer"
                    style={{ borderColor: 'var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                  >
                    <option value="" style={{ background: 'var(--color-surface)' }}>-- Choose Target Patient --</option>
                    {localPatients.map(p => (
                      <option key={p.id} value={p.id} style={{ background: 'var(--color-surface)' }}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Select Custodian Physician</label>
                  <select
                    value={targetDoctorId}
                    onChange={e => setTargetDoctorId(e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent border cursor-pointer"
                    style={{ borderColor: 'var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                  >
                    <option value="" style={{ background: 'var(--color-surface)' }}>-- Choose Holding Clinician --</option>
                    {networkDoctors.map(d => (
                      <option key={d.id} value={d.id} style={{ background: 'var(--color-surface)' }}>{d.name} ({d.hospital})</option>
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
    </DashboardLayout>
  )
}

export default RequestsPage
