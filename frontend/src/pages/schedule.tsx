import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/shared/Button'
import InputField from '../components/shared/InputField'

type Appointment = {
  id: string
  patientName: string
  doctorName: string
  specialty: string
  time: string
  status: 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED'
  notes?: string
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'apt-1', patientName: 'Alexander Mercer', doctorName: 'Dr. Gregory House', specialty: 'Diagnostic Medicine', time: '09:30 AM', status: 'COMPLETED', notes: 'Myocarditis follow-up review.' },
  { id: 'apt-2', patientName: 'Elena Rostova', doctorName: 'Dr. Eric Foreman', specialty: 'Neurology', time: '11:00 AM', status: 'CHECKED_IN', notes: 'Migraine consultation scan review.' },
  { id: 'apt-3', patientName: 'Marcus Vance', doctorName: 'Dr. Allison Cameron', specialty: 'Immunology', time: '01:45 PM', status: 'SCHEDULED', notes: 'Allergy panel evaluation.' },
  { id: 'apt-4', patientName: 'Sophia Lin', doctorName: 'Dr. Gregory House', specialty: 'Diagnostic Medicine', time: '03:30 PM', status: 'SCHEDULED', notes: 'Initial intake consultation.' }
]

const SchedulePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('hie_appointments')
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS
  })

  useEffect(() => {
    localStorage.setItem('hie_appointments', JSON.stringify(appointments))
  }, [appointments])

  const [showModal, setShowModal] = useState(false)
  const [patientName, setPatientName] = useState('')
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-1')
  const [appointmentTime, setAppointmentTime] = useState('02:00 PM')
  const [notes, setNotes] = useState('')

  const doctorsList = [
    { id: 'doc-1', name: 'Dr. Gregory House', specialty: 'Diagnostic Medicine' },
    { id: 'doc-2', name: 'Dr. Eric Foreman', specialty: 'Neurology' },
    { id: 'doc-3', name: 'Dr. Allison Cameron', specialty: 'Immunology' },
  ]

  useEffect(() => {
    if (location.state && (location.state as any).patientName) {
      setPatientName((location.state as any).patientName)
      setShowModal(true)
    }
  }, [location])

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientName || !appointmentTime) {
      showToast('Please specify patient and appointment time', 'warning')
      return
    }

    const doc = doctorsList.find(d => d.id === selectedDoctorId) || doctorsList[0]

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientName,
      doctorName: doc.name,
      specialty: doc.specialty,
      time: appointmentTime,
      status: 'SCHEDULED',
      notes: notes || 'General checkup.'
    }

    setAppointments(prev => [...prev, newApt])
    showToast(`Appointment booked successfully for ${patientName}!`, 'success')
    setShowModal(false)

    // Reset Form
    setPatientName('')
    setNotes('')
  }

  const handleUpdateStatus = (id: string, newStatus: 'CHECKED_IN' | 'COMPLETED') => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: newStatus }
      }
      return a
    }))
    showToast(`Appointment status updated to ${newStatus.replace('_', ' ')}.`, 'success')
  }

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id))
    showToast('Appointment successfully canceled.', 'info')
  }

  // Column filtering
  const scheduled = appointments.filter(a => a.status === 'SCHEDULED')
  const checkedIn = appointments.filter(a => a.status === 'CHECKED_IN')
  const completed = appointments.filter(a => a.status === 'COMPLETED')

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
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Clinic Scheduling Board</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Receptionist Desk. Manage check-ins, direct patient flows, and schedule appointments.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowModal(true)}
            leftIcon={<span className="text-lg font-bold leading-none">+</span>}
          >
            Book Appointment
          </Button>
        </div>

        {/* Dynamic Column Flow Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* COLUMN 1: SCHEDULED */}
          <div className="flex flex-col gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                Scheduled Today
                <span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-indigo-500">{scheduled.length}</span>
              </h3>
            </div>

            <div className="flex flex-col gap-3 min-h-[300px]">
              <AnimatePresence>
                {scheduled.length === 0 ? (
                  <div className="text-center py-10 text-xs" style={{ color: 'var(--color-text-secondary)' }}>No pending appointments</div>
                ) : scheduled.map((a) => (
                  <motion.div
                    key={a.id}
                    layoutId={a.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-xl flex flex-col gap-3 justify-between border hover:scale-101 transition-transform cursor-pointer"
                    style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-extrabold text-sm" style={{ color: 'var(--color-text)' }}>{a.patientName}</span>
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md shrink-0">{a.time}</span>
                      </div>
                      <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-text-secondary)' }}>{a.doctorName} • {a.specialty}</p>
                      {a.notes && <p className="text-[11px] italic mt-1" style={{ color: 'var(--color-text-secondary)' }}>"{a.notes}"</p>}
                    </div>

                    <div className="flex justify-between items-center gap-2 pt-2.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <button
                        onClick={() => handleDeleteAppointment(a.id)}
                        className="text-xs font-bold text-rose-400 hover:text-rose-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'CHECKED_IN')}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20"
                      >
                        Check In →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* COLUMN 2: WITH DOCTOR (CHECKED IN) */}
          <div className="flex flex-col gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                With Doctor
                <span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-amber-500 animate-pulse">{checkedIn.length}</span>
              </h3>
            </div>

            <div className="flex flex-col gap-3 min-h-[300px]">
              <AnimatePresence>
                {checkedIn.length === 0 ? (
                  <div className="text-center py-10 text-xs" style={{ color: 'var(--color-text-secondary)' }}>No active clinical sessions</div>
                ) : checkedIn.map((a) => (
                  <motion.div
                    key={a.id}
                    layoutId={a.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-xl flex flex-col gap-3 justify-between border border-amber-500/20 shadow-sm"
                    style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-extrabold text-sm" style={{ color: 'var(--color-text)' }}>{a.patientName}</span>
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 animate-pulse">ACTIVE</span>
                      </div>
                      <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-text-secondary)' }}>{a.doctorName} • {a.specialty}</p>
                      {a.notes && <p className="text-[11px] italic mt-1" style={{ color: 'var(--color-text-secondary)' }}>"{a.notes}"</p>}
                    </div>

                    <div className="flex justify-end pt-2.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <button
                        onClick={() => handleUpdateStatus(a.id, 'COMPLETED')}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20"
                      >
                        Complete Visit ✓
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* COLUMN 3: COMPLETED */}
          <div className="flex flex-col gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                Completed Today
                <span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-emerald-500">{completed.length}</span>
              </h3>
            </div>

            <div className="flex flex-col gap-3 min-h-[300px]">
              <AnimatePresence>
                {completed.length === 0 ? (
                  <div className="text-center py-10 text-xs" style={{ color: 'var(--color-text-secondary)' }}>No completed visits today</div>
                ) : completed.map((a) => (
                  <motion.div
                    key={a.id}
                    layoutId={a.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-xl flex flex-col gap-2 border hover:bg-slate-900/5 transition-colors"
                    style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-extrabold text-sm line-through" style={{ color: 'var(--color-text-secondary)' }}>{a.patientName}</span>
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase shrink-0">DONE</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{a.doctorName} • {a.specialty}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appointment Drawer/Modal */}
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
              className="relative w-full max-w-md rounded-2xl p-6 shadow-xl z-10 flex flex-col gap-5 border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Book Clinical Appointment</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Add patient appointment slot for the active clinic registry.</p>
              </div>

              <form onSubmit={handleBookAppointment} className="flex flex-col gap-4">
                <InputField label="Patient Name" value={patientName} onChange={setPatientName} placeholder="Alexander Mercer" />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Select Practitioner</label>
                  <select
                    value={selectedDoctorId}
                    onChange={e => setSelectedDoctorId(e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent"
                    style={{ border: '1px solid var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                  >
                    {doctorsList.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                <InputField label="Appointment Time (Format)" value={appointmentTime} onChange={setAppointmentTime} placeholder="e.g. 02:00 PM" />
                
                <InputField label="Encounter Notes / Symptoms" as="textarea" rows={2} value={notes} onChange={setNotes} placeholder="Reason for booking (e.g. routine migraine scan, cardiac review)" required={false} />

                <div className="flex justify-end gap-3 mt-3">
                  <Button variant="default" size="md" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" size="md" type="submit">Schedule Visit</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default SchedulePage
