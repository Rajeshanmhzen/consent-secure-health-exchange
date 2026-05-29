import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/shared/Button'
import InputField from '../components/shared/InputField'
import { emergencyApi } from '../services/emergency.service'

type EmergencySession = {
  id: string
  patientId: string
  reason: string
  grantedAt: string
  expiresAt: string
  patient?: {
    name: string
  }
}

const EmergencyPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [pastSessions, setPastSessions] = useState<EmergencySession[]>([])
  const [activeSession, setActiveSession] = useState<EmergencySession | null>(null)
  const [timeLeft, setTimeLeft] = useState('')

  // Form fields
  const [patientEmail, setPatientEmail] = useState('')
  const [emergencyReason, setEmergencyReason] = useState('Trauma/Unconscious')
  const [justification, setJustification] = useState('')

  const fetchSessions = async () => {
    try {
      const history = await emergencyApi.getHistory() as any
      setPastSessions(history.data || [])

      const active = await emergencyApi.getActive() as any
      if (active && active.data && active.data.length > 0) {
        setActiveSession(active.data[0])
      } else {
        setActiveSession(null)
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to sync emergency data from clinical records', 'error')
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchSessions()
  }, [user])

  // Live Timer tick
  useEffect(() => {
    if (!activeSession) return

    const tick = () => {
      const expiry = new Date(activeSession.expiresAt).getTime()
      const now = new Date().getTime()
      const diff = expiry - now

      if (diff <= 0) {
        setActiveSession(null)
        setTimeLeft('')
        showToast('Emergency access session expired. dossiers locked.', 'info')
        fetchSessions()
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [activeSession])

  if (!user) return null

  const handleTriggerEmergency = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientEmail) {
      showToast('Please enter the incapacitated patient email address.', 'warning')
      return
    }
    if (!justification || justification.length < 15) {
      showToast('Please provide a detailed clinical justification (minimum 15 characters)', 'warning')
      return
    }

    try {
      const fullReason = `${emergencyReason}: ${justification}`
      await emergencyApi.override({
        patientEmail,
        reason: fullReason
      })
      showToast('EMERGENCY BYPASS GRANTED! Critical clinical access authorized.', 'error')
      setPatientEmail('')
      setJustification('')
      fetchSessions()
    } catch (e: any) {
      showToast(e.message || 'Bypass request rejected. Confirm user email exists in database.', 'error')
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
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Emergency Access Portal</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Hospital Audit Override. Unilateral medical record access under extreme clinical emergencies.
          </p>
        </div>

        {/* ACTIVE SESSION DASHBOARD */}
        {activeSession ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl border-2 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%)',
              borderColor: 'var(--color-error)'
            }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest animate-pulse">
                🔴 CRITICAL EMERGENCY ACCESS GRANTED
              </span>
              <h2 className="text-xl font-extrabold text-(--color-text)">
                Active Patient: {activeSession.patient?.name}
              </h2>
              <p className="text-xs max-w-lg" style={{ color: 'var(--color-text-secondary)' }}>
                Reason: **{activeSession.reason}**. Clinical dossiers have been bypassed and unlocked. Every transaction and record viewed is monitored and flagged to the hospital board.
              </p>
              <div className="flex gap-3 mt-2">
                <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/records', { state: { filterPatientName: activeSession.patient?.name } })}>
                  View Records Now
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center shrink-0 p-4 rounded-xl border bg-slate-950/40" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-[10px] font-bold tracking-widest uppercase text-red-400">SESSION EXPIRES IN</span>
              <span className="text-3xl font-extrabold font-mono text-red-500 tracking-wider mt-1">{timeLeft || '23:59:59'}</span>
            </div>
          </motion.div>
        ) : (
          /* AUDIT LEGAL WARNING ALERT */
          <div className="p-4 rounded-2xl flex items-start gap-3 border bg-red-500/10 border-red-500/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5 mt-0.5 shrink-0 text-red-500" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z" />
            </svg>
            <div className="text-xs text-(--color-text)">
              <h4 className="font-bold text-red-500 uppercase tracking-wide">Legal Audit Warning & Regulation</h4>
              <p className="mt-1 leading-relaxed text-(--color-text-secondary)">
                This portal grants unilateral access to patient dossiers, bypassing standard patient/doctor consent flows. Emergency overrides must **ONLY** be activated if the patient is incapacitated and facing immediate life-threatening danger. Every single click, record opened, and justification is logged into the **immutable security audit trail**, triggering immediate notifications to the patient's relatives and hospital administrators.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* TRIGGER FORM CONTAINER */}
          <div className="lg:col-span-2 p-5 rounded-2xl flex flex-col gap-4 border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Initiate Emergency Dossier Override</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Grant temporary 24-hour bypass permissions for patient records.</p>
            </div>

            <form onSubmit={handleTriggerEmergency} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Patient Registered Email"
                  value={patientEmail}
                  onChange={setPatientEmail}
                  disabled={!!activeSession}
                  placeholder="e.g. alexander@example.com"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-secondary)' }}>Emergency Severity Trigger</label>
                  <select
                    value={emergencyReason}
                    onChange={e => setEmergencyReason(e.target.value)}
                    disabled={!!activeSession}
                    className="rounded-xl px-3 py-2 text-sm outline-none w-full bg-transparent border cursor-pointer"
                    style={{ borderColor: 'var(--color-border)', height: '42px', color: 'var(--color-text)' }}
                  >
                    <option value="Trauma/Unconscious" style={{ background: 'var(--color-surface)' }}>Trauma / Unconscious</option>
                    <option value="Cardiac Arrest" style={{ background: 'var(--color-surface)' }}>Cardiac Arrest</option>
                    <option value="Severe Physical Impairment" style={{ background: 'var(--color-surface)' }}>Severe Physical Impairment</option>
                    <option value="Extreme Distress / Shock" style={{ background: 'var(--color-surface)' }}>Extreme Distress / Shock</option>
                  </select>
                </div>
              </div>

              <InputField
                label="Clinical Justification Statement"
                as="textarea"
                rows={3}
                value={justification}
                onChange={setJustification}
                disabled={!!activeSession}
                placeholder="Detail the clinical symptoms, unconscious states, and why waiting for traditional patient/doctor sharing consent poses a severe risk to patient life or critical health..."
              />

              <button
                type="submit"
                disabled={!!activeSession}
                className="w-full py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase text-white shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
                }}
              >
                Trigger Clinical Override Signature
              </button>
            </form>
          </div>

          {/* HISTORICAL TRIGGER SESSION LOGS */}
          <div className="p-5 rounded-2xl flex flex-col gap-4 border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Your Past Emergency Triggers</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Audit history of clinical overrides.</p>
            </div>

            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
              {pastSessions.length === 0 ? (
                <div className="p-6 text-center text-xs font-semibold text-(--color-text-secondary)">
                  No past overrides logged.
                </div>
              ) : pastSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl border flex flex-col gap-1.5 text-xs transition-colors hover:bg-slate-900/10"
                  style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex justify-between items-center gap-1">
                    <span className="font-extrabold text-(--color-text)">{session.patient?.name}</span>
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                    Triggered: {new Date(session.grantedAt).toLocaleString()}
                  </span>
                  <p className="text-[11px] leading-relaxed italic" style={{ color: 'var(--color-text-secondary)' }}>
                    "{session.reason}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default EmergencyPage
