import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/shared/Button'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import InputField from '../components/shared/InputField'
import { recordApi, type MedicalRecord as ApiMedicalRecord } from '../services/record.service'
import { tenantApi } from '../services/tenant.service'

type DisplayRecord = {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  specialty: string
  diagnosis: string
  prescription: string
  notes: string
  createdAt: string
  files: { id: string; name: string; url: string; type: string }[]
}

const RecordsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [records, setRecords] = useState<DisplayRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(() => (location.state as { filterPatientName?: string } | null)?.filterPatientName ?? '')

  const [showAddModal, setShowAddModal] = useState(false)
  const [patientsList, setPatientsList] = useState<{ id: string; name: string }[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [prescription, setPrescription] = useState('')
  const [notes, setNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [recordFile, setRecordFile] = useState<File | null>(null)

  const [editRecord, setEditRecord] = useState<DisplayRecord | null>(null)
  const [editDiagnosis, setEditDiagnosis] = useState('')
  const [editPrescription, setEditPrescription] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [updating, setUpdating] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<DisplayRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [viewRecord, setViewRecord] = useState<DisplayRecord | null>(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
  }, [user, navigate])

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true)
      try {
        const res = await recordApi.list(search || undefined)
        setRecords((res.data || []).map(mapRecord))
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load records'
        showToast(message, 'error')
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchRecords()
  }, [user, search, showToast])

  useEffect(() => {
    if (showAddModal && user?.tenantId) {
      tenantApi.listUsers({ tenantId: user.tenantId, role: 'PATIENT' }).then(res => {
        const list = (res.data?.users || []).map((u: { id: string; name?: string; patient?: { name?: string } }) => ({ id: u.id, name: u.patient?.name || u.name || '—' }))
        setPatientsList(list)
        if (list.length > 0) setSelectedPatientId(list[0].id)
      }).catch(() => {})
    }
  }, [showAddModal, user])

  const isDoctor = user?.role === 'DOCTOR'
  const isPatient = user?.role === 'PATIENT'

  const backendBase = (import.meta.env.VITE_API_URL as string || 'http://localhost:8080/api/v1').replace(/\/api.*$/, '')

  const mapRecord = (r: ApiMedicalRecord): DisplayRecord => ({
    id: r.id,
    patientId: r.patientId,
    patientName: r.patient?.name || '—',
    doctorId: r.doctorId,
    doctorName: r.doctor?.name || '—',
    specialty: r.doctor?.specialization || '—',
    diagnosis: r.diagnosis || '—',
    prescription: r.prescription || '—',
    notes: r.notes || '—',
    createdAt: r.createdAt,
    files: (r.files || []).map(f => ({
      id: f.id,
      name: f.fileName || 'file',
      url: f.fileUrl ? `${backendBase}${f.fileUrl}` : '',
      type: f.fileType || '—',
    })),
  })

  const openEdit = (r: DisplayRecord) => {
    setEditRecord(r)
    setEditDiagnosis(r.diagnosis === '—' ? '' : r.diagnosis)
    setEditPrescription(r.prescription === '—' ? '' : r.prescription)
    setEditNotes(r.notes === '—' ? '' : r.notes)
    setEditFile(null)
  }

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editRecord || !editDiagnosis) { showToast('Diagnosis is required', 'warning'); return }
    setUpdating(true)
    try {
      await recordApi.update(editRecord.id, {
        diagnosis: editDiagnosis,
        prescription: editPrescription || undefined,
        notes: editNotes || undefined,
        recordFile: editFile || undefined,
      })
      showToast('Record updated successfully!', 'success')
      setEditRecord(null)
      const res = await recordApi.list(search || undefined)
      setRecords((res.data || []).map(mapRecord))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update record', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteRecord = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await recordApi.delete(deleteTarget.id)
      showToast('Record deleted successfully!', 'success')
      setDeleteTarget(null)
      setRecords(prev => prev.filter(r => r.id !== deleteTarget.id))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete record', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!diagnosis) {
      showToast('Please fill out the Diagnosis field', 'warning')
      return
    }

    setCreating(true)
    try {
      await recordApi.create({
        patientId: selectedPatientId,
        diagnosis,
        prescription: prescription || undefined,
        notes: notes || undefined,
        recordFile: recordFile || undefined,
      })
      showToast('Medical record created successfully!', 'success')
      setShowAddModal(false)
      setDiagnosis('')
      setPrescription('')
      setNotes('')
      setRecordFile(null)
      const res = await recordApi.list()
      setRecords((res.data || []).map(mapRecord))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create record'
      showToast(message, 'error')
    } finally {
      setCreating(false)
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
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>
              {isPatient ? 'My Health Timeline' : 'Patient Medical Records'}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {isPatient ? 'Secure, patient-controlled chronological history' : 'Comprehensive clinical encounter database'}
            </p>
          </div>
          {isDoctor && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowAddModal(true)}
              leftIcon={<span className="text-lg font-bold leading-none">+</span>}
            >
              Add Record
            </Button>
          )}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 max-w-md w-full" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" style={{ color: 'var(--color-text-secondary)' }}>
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder={isPatient ? "Search by diagnosis or doctor name..." : "Search by patient name or diagnosis..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text)' }}
          />
        </div>

        {/* Layout content depends on Patient vs Doctor/Admin */}
        {isPatient ? (
          <div className="relative border-l-2 pl-6 ml-4 flex flex-col gap-8 mt-2" style={{ borderColor: 'var(--color-primary-ghost)' }}>
            {loading ? (
              <div className="p-8 text-center">
                <div className="h-10 w-10 mx-auto rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>Loading records...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="p-8 text-center rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No records found in your clinical file</p>
              </div>
            ) : records.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="relative p-6 rounded-2xl flex flex-col gap-4 group"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                {/* Timeline node */}
                <div className="absolute -left-8.25 top-7 h-4.5 w-4.5 rounded-full border-4 border-(--color-background) shadow-sm transition-transform group-hover:scale-125" style={{ backgroundColor: 'var(--color-primary)' }} />

                {/* Card Title & Specialty */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                      {new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                    <h3 className="text-base font-extrabold mt-0.5" style={{ color: 'var(--color-text)' }}>{r.diagnosis}</h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{r.doctorName}</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{r.specialty}</p>
                  </div>
                </div>

                {/* Prescription & Clinical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Prescription & Instructions</h4>
                    <p className="text-sm mt-1 font-semibold" style={{ color: 'var(--color-text)' }}>{r.prescription}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Clinical Encounter Notes</h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{r.notes}</p>
                  </div>
                </div>

                {/* Shared records attached files */}
                {r.files.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Diagnostic Attachments ({r.files.length})</h4>
                    <div className="flex flex-wrap gap-3">
                      {r.files.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border hover:scale-102 transition-transform"
                          style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                          onClick={() => showToast(`Simulating download for ${f.name}`, 'success')}
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400" fill="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-1 9-4-4h2.5v-3h3v3H16l-4 4z" />
                          </svg>
                          <span>{f.name}</span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>({f.size})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            {/* Table header */}
            <div className="grid px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ gridTemplateColumns: '0.9fr 1fr 1.4fr 1.4fr 0.6fr 1fr', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
              <span>Date</span>
              <span>Patient</span>
              <span>Diagnosis</span>
              <span>Prescription</span>
              <span>Files</span>
              <span className="text-right">Actions</span>
            </div>

            {loading ? (
              <div className="flex flex-col">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="grid px-5 py-4 gap-4" style={{ gridTemplateColumns: '0.9fr 1fr 1.4fr 1.4fr 0.6fr 1fr', borderTop: '1px solid var(--color-border)' }}>
                    <div className="h-4 w-20 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-surface-elevated)' }} />
                    <div className="h-4 w-24 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-surface-elevated)' }} />
                    <div className="h-4 w-32 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-surface-elevated)' }} />
                    <div className="h-4 w-36 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-surface-elevated)' }} />
                    <div className="h-4 w-8 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-surface-elevated)' }} />
                    <div className="h-4 w-16 rounded-full animate-pulse ml-auto" style={{ backgroundColor: 'var(--color-surface-elevated)' }} />
                  </div>
                ))}
              </div>
            ) : records.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No patient records match search parameters</p>
              </div>
            ) : records.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                className="grid px-5 py-4 text-sm items-center transition-colors"
                style={{ gridTemplateColumns: '0.9fr 1fr 1.4fr 1.4fr 0.6fr 1fr', borderTop: '1px solid var(--color-border)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-table-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Date */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                    {r.doctorName}
                  </span>
                </div>

                {/* Patient */}
                <span className="font-semibold pr-2 truncate" style={{ color: 'var(--color-text)' }}>{r.patientName}</span>

                {/* Diagnosis */}
                <span className="text-xs pr-2 truncate font-semibold" style={{ color: 'var(--color-text)' }} title={r.diagnosis}>{r.diagnosis}</span>

                {/* Prescription */}
                <span className="text-xs pr-2 truncate" style={{ color: 'var(--color-text-secondary)' }} title={r.prescription}>{r.prescription}</span>

                {/* Files */}
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  {r.files.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                      {r.files.length} file{r.files.length !== 1 ? 's' : ''}
                    </span>
                  ) : '—'}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pr-1">
                  {/* View */}
                  <div className="relative group">
                    <button type="button" onClick={() => setViewRecord(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </button>
                    <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/95 text-[10px] text-white px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-50 shadow-md">View Details</span>
                  </div>
                  {/* Edit */}
                  {isDoctor && (
                    <div className="relative group">
                      <button type="button" onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/95 text-[10px] text-white px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-50 shadow-md">Edit Record</span>
                    </div>
                  )}
                  {/* Delete */}
                  {isDoctor && (
                    <div className="relative group">
                      <button type="button" onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                      <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/95 text-[10px] text-white px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-50 shadow-md">Delete Record</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* View Record Modal */}
      {viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl p-6 shadow-xl border flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
            style={{ width: 'clamp(500px, 75vw, 1100px)', backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <button type="button" onClick={() => setViewRecord(null)} className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gray-500/10 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>

            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Record Details</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {new Date(viewRecord.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Patient</span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{viewRecord.patientName}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Doctor</span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{viewRecord.doctorName}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{viewRecord.specialty}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-0.5 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Diagnosis</span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{viewRecord.diagnosis}</span>
              </div>
              <div className="flex flex-col gap-0.5 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Prescription</span>
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>{viewRecord.prescription}</span>
              </div>
              <div className="flex flex-col gap-0.5 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Notes</span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{viewRecord.notes}</span>
              </div>
            </div>

            {viewRecord.files.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Attachments ({viewRecord.files.length})</span>
                <div className="flex flex-wrap gap-2">
                  {viewRecord.files.map(f => (
                    <a
                      key={f.id}
                      href={`${backendBase}/uploads/record-files/${f.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
                      style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-1 9-4-4h2.5v-3h3v3H16l-4 4z" /></svg>
                      {f.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="default" size="md" onClick={() => setViewRecord(null)}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Record Modal */}
      <AnimatePresence>
        {editRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditRecord(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl rounded-2xl p-6 shadow-xl z-10 flex flex-col gap-5 border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Edit Medical Record</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Patient: <span className="font-semibold">{editRecord.patientName}</span></p>
              </div>
              <form onSubmit={handleUpdateRecord} className="flex flex-col gap-4">
                <InputField label="Primary Diagnosis" value={editDiagnosis} onChange={setEditDiagnosis} placeholder="e.g. Acute Vestibular Migraine" />
                <InputField label="Prescription / Treatment Plan" value={editPrescription} onChange={setEditPrescription} placeholder="e.g. Rizatriptan 10mg" required={false} />
                <InputField label="Encounter Notes" as="textarea" rows={3} value={editNotes} onChange={setEditNotes} placeholder="Clinical notes..." required={false} />

                {/* Existing files */}
                {editRecord.files.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Existing Attachments</label>
                    <div className="flex flex-wrap gap-2">
                      {editRecord.files.map(f => (
                        <a
                          key={f.id}
                          href={`${backendBase}/uploads/record-files/${f.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
                          style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-1 9-4-4h2.5v-3h3v3H16l-4 4z" /></svg>
                          {f.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* New file upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Add New Document <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>(optional)</span></label>
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border border-dashed transition-colors hover:border-indigo-400" style={{ borderColor: editFile ? 'var(--color-primary)' : 'var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor" style={{ color: editFile ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM12 18l-4-4h2.5v-3h3v3H16l-4 4z" /></svg>
                    <span className="text-sm" style={{ color: editFile ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>{editFile ? editFile.name : 'Click to upload a file'}</span>
                    {editFile && <button type="button" onClick={e => { e.preventDefault(); setEditFile(null) }} className="ml-auto text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>✕ Remove</button>}
                    <input type="file" className="hidden" accept=".pdf,.docx,image/jpeg,image/png,image/webp" onChange={e => setEditFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-1">
                  <Button variant="default" size="md" onClick={() => setEditRecord(null)}>Cancel</Button>
                  <Button variant="primary" size="md" type="submit" isLoading={updating} loadingText="Saving...">Save Changes</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteRecord}
        title="Delete Medical Record"
        description={`This will permanently remove the record for ${deleteTarget?.patientName}. This action cannot be undone.`}
        confirmLabel="Delete Record"
        type="danger"
        isLoading={deleting}
      />

      {/* Add Record Drawer/Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
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
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Create Medical Encounter Record</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Add official clinical diagnostics, drug prescriptions, and notes.</p>
              </div>

              <form onSubmit={handleCreateRecord} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Select Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={e => setSelectedPatientId(e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent"
                    style={{ border: '1px solid var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                  >
                    {patientsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <InputField label="Primary Diagnosis" value={diagnosis} onChange={setDiagnosis} placeholder="e.g. Acute Vestibular Migraine" />
                
                <InputField label="Prescription / Treatment Plan" value={prescription} onChange={setPrescription} placeholder="e.g. Rizatriptan 10mg orally at migraine onset; rest in dark room" />
                
                <InputField label="Encounter Notes" as="textarea" rows={3} value={notes} onChange={setNotes} placeholder="Describe clinical symptoms, examination findings, and follow-up directives..." required={false} />

                {/* File upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Attach Document <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>(PDF, DOCX, Image — max 20MB)</span></label>
                  <label
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border border-dashed transition-colors hover:border-indigo-400"
                    style={{ borderColor: recordFile ? 'var(--color-primary)' : 'var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor" style={{ color: recordFile ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM12 18l-4-4h2.5v-3h3v3H16l-4 4z" />
                    </svg>
                    <span className="text-sm" style={{ color: recordFile ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>
                      {recordFile ? recordFile.name : 'Click to upload or drag a file here'}
                    </span>
                    {recordFile && (
                      <button type="button" onClick={(e) => { e.preventDefault(); setRecordFile(null) }} className="ml-auto text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>✕ Remove</button>
                    )}
                    <input
                      type="file"
                      id="recordFileInput"
                      className="hidden"
                      accept=".pdf,.docx,image/jpeg,image/png,image/webp"
                      onChange={(e) => setRecordFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-3">
                  <Button variant="default" size="md" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button variant="primary" size="md" type="submit" isLoading={creating} loadingText="Saving...">Sign & Save Record</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default RecordsPage
