import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/shared/Button'
import InputField from '../components/shared/InputField'

type RecordFile = {
  name: string
  size: string
  type: string
}

type MedicalRecord = {
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
  files: RecordFile[]
}

const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-1',
    patientId: '1',
    patientName: 'Alexander Mercer',
    doctorId: 'doc-1',
    doctorName: 'Dr. Gregory House',
    specialty: 'Diagnostic Medicine',
    diagnosis: 'Acute Autoimmune Myocarditis',
    prescription: 'Methylprednisolone 24mg daily, Lisinopril 5mg daily',
    notes: 'Patient presented with sudden-onset chest pain and dyspnea. Cardiac enzymes were elevated. Initial echo showed mild left ventricular hypokinesis. Steroid therapy initiated with good clinical response.',
    createdAt: '2026-05-10T14:30:00Z',
    files: [{ name: 'cardiac_mri_report.pdf', size: '2.4 MB', type: 'application/pdf' }, { name: 'blood_panel_may.xlsx', size: '150 KB', type: 'spreadsheet' }]
  },
  {
    id: 'rec-2',
    patientId: '1',
    patientName: 'Alexander Mercer',
    doctorId: 'doc-2',
    doctorName: 'Dr. Allison Cameron',
    specialty: 'Immunology',
    diagnosis: 'Seasonal Asthma Exacerbation',
    prescription: 'Albuterol HFA Inhaler 90mcg (1-2 puffs q4h prn), Fluticasone propionate',
    notes: 'Triggered by spring allergens. Spirometry reveals moderate reversible obstructive defect. Instructed on proper inhaler technique.',
    createdAt: '2026-04-18T09:15:00Z',
    files: [{ name: 'spirometry_results.pdf', size: '1.1 MB', type: 'application/pdf' }]
  },
  {
    id: 'rec-3',
    patientId: '2',
    patientName: 'Elena Rostova',
    doctorId: 'doc-3',
    doctorName: 'Dr. Eric Foreman',
    specialty: 'Neurology',
    diagnosis: 'Vestibular Migraine',
    prescription: 'Propranolol 40mg twice daily, Rizatriptan 10mg prn at onset',
    notes: 'Recurring vertigo spells associated with unilateral pulsatile headache. Avoid triggers (tyramine, sleep deprivation). Response to prophylactic beta-blocker will be reviewed in 6 weeks.',
    createdAt: '2026-05-02T11:00:00Z',
    files: [{ name: 'brain_mri_clear.pdf', size: '4.8 MB', type: 'application/pdf' }]
  }
]

const RecordsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('hie_records')
    return saved ? JSON.parse(saved) : INITIAL_RECORDS
  })

  useEffect(() => {
    localStorage.setItem('hie_records', JSON.stringify(records))
  }, [records])

  const [search, setSearch] = useState(() => {
    return (location.state as any)?.filterPatientName ?? ''
  })
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('1')
  const [diagnosis, setDiagnosis] = useState('')
  const [prescription, setPrescription] = useState('')
  const [notes, setNotes] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<RecordFile[]>([])

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const isDoctor = user.role === 'DOCTOR'
  const isPatient = user.role === 'PATIENT'

  // Simulated patients list for creation dropdown
  const patientsList = [
    { id: '1', name: 'Alexander Mercer' },
    { id: '2', name: 'Elena Rostova' },
    { id: '3', name: 'Marcus Vance' },
    { id: '4', name: 'Sophia Lin' },
    { id: '5', name: 'David Kim' },
  ]

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!diagnosis || !prescription) {
      showToast('Please fill out Diagnosis and Prescription fields', 'warning')
      return
    }

    const patientName = patientsList.find(p => p.id === selectedPatientId)?.name || 'Unknown Patient'

    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      patientId: selectedPatientId,
      patientName,
      doctorId: 'doc-current',
      doctorName: user.name || 'Dr. Self',
      specialty: 'Clinical Practitioner',
      diagnosis,
      prescription,
      notes: notes || 'No additional notes provided.',
      createdAt: new Date().toISOString(),
      files: attachedFiles.length > 0 ? attachedFiles : [{ name: 'clinical_encounter.pdf', size: '420 KB', type: 'application/pdf' }]
    }

    setRecords(prev => [newRecord, ...prev])
    showToast('Medical record created successfully!', 'success')
    setShowAddModal(false)

    // Reset Form
    setDiagnosis('')
    setPrescription('')
    setNotes('')
    setAttachedFiles([])
  }

  const handleSimulatedFileUpload = () => {
    const names = ['lab_blood_report.pdf', 'xray_chest_scan.jpg', 'ekg_waveform.pdf', 'discharge_summary.docx']
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomSize = `${(Math.random() * 3 + 0.5).toFixed(1)} MB`
    const type = randomName.endsWith('.pdf') ? 'application/pdf' : randomName.endsWith('.jpg') ? 'image/jpeg' : 'document'

    setAttachedFiles(prev => [...prev, { name: randomName, size: randomSize, type }])
    showToast(`Attached ${randomName} successfully`, 'info')
  }

  // Filter records based on role and search criteria
  const filteredRecords = records.filter(r => {
    if (isPatient) {
      // Patients only see their own records.
      // In a real system we would filter by patient's registered user id.
      // Here we show records matching a mock patient setup or all if not specific.
      return r.patientName.toLowerCase().includes(user.name?.toLowerCase() || 'alexander') &&
             (r.diagnosis.toLowerCase().includes(search.toLowerCase()) || 
              r.doctorName.toLowerCase().includes(search.toLowerCase()))
    }
    // Doctors and Admins see records matching search
    return r.patientName.toLowerCase().includes(search.toLowerCase()) ||
           r.diagnosis.toLowerCase().includes(search.toLowerCase())
  })

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
          /* ================= PATIENT TIMELINE ================= */
          <div className="relative border-l-2 pl-6 ml-4 flex flex-col gap-8 mt-2" style={{ borderColor: 'var(--color-primary-ghost)' }}>
            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No records found in your clinical file</p>
              </div>
            ) : filteredRecords.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="relative p-6 rounded-2xl flex flex-col gap-4 group"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                {/* Timeline node */}
                <div className="absolute -left-[33px] top-7 h-4.5 w-4.5 rounded-full border-4 border-(--color-background) shadow-sm transition-transform group-hover:scale-125" style={{ backgroundColor: 'var(--color-primary)' }} />

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
          /* ================= DOCTOR/ADMIN GRID LIST ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecords.length === 0 ? (
              <div className="md:col-span-2 p-12 text-center rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No patient records match search parameters</p>
              </div>
            ) : filteredRecords.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="p-5 rounded-2xl flex flex-col gap-4 justify-between border"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                {/* Header Info */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary-ghost)', color: 'var(--color-primary)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    <h3 className="text-sm font-extrabold mt-1.5" style={{ color: 'var(--color-text)' }}>{r.diagnosis}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>Patient: {r.patientName}</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Authored by: {r.doctorName}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-xs">
                    <span className="font-bold text-(--color-text-secondary)">Prescription: </span>
                    <span style={{ color: 'var(--color-text)' }}>{r.prescription}</span>
                  </div>
                  <div className="text-xs line-clamp-2">
                    <span className="font-bold text-(--color-text-secondary)">Notes: </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{r.notes}</span>
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex justify-between items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    Attachments: {r.files.length} file{r.files.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => navigate('/dashboard/requests', { state: { requestPatientName: r.patientName } })}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    Share Record
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 0 0 0-6 3 3 0 0 0-3 3c0 .24.04.47.09.7L8.04 9.81A2.99 2.99 0 0 0 6 9a3 3 0 0 0 0 6c.79 0 1.5-.31 2.04-.81l7.12 4.15c-.05.21-.08.43-.08.66a2.92 2.92 0 0 0 5.84 0 2.92 2.92 0 0 0-2.92-2.92z" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

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

                {/* File Upload Trigger */}
                <div className="flex flex-col gap-2 p-4 rounded-xl border-dashed border-2" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                      Diagnostic Files & Scans ({attachedFiles.length} attached)
                    </span>
                    <button
                      type="button"
                      onClick={handleSimulatedFileUpload}
                      className="text-xs font-bold text-indigo-400 hover:underline"
                    >
                      + Add File Attachment
                    </button>
                  </div>
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attachedFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                          <span className="truncate max-w-[120px]">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-rose-500 font-bold ml-1 hover:text-rose-400"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-3">
                  <Button variant="default" size="md" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button variant="primary" size="md" type="submit">Sign & Save Record</Button>
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
