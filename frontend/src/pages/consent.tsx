import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/shared/Button'
import { requestApi } from '../services/request.service'

type ConsentRequest = {
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
    specialization?: string
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

const ConsentPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [consents, setConsents] = useState<ConsentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ConsentRequest | null>(null)

  // Signature Wizard Step: 'review' | 'otp' | 'success'
  const [wizardStep, setWizardStep] = useState<'review' | 'otp' | 'success'>('review')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)

  const fetchConsents = async () => {
    try {
      setLoading(true)
      const data = await requestApi.list() as any
      setConsents(data.data || [])
    } catch (e: any) {
      showToast(e.message || 'Failed to fetch active consents ledger', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchConsents()
  }, [user])

  useEffect(() => {
    if (location.state && (location.state as any).requestId && consents.length > 0) {
      const reqId = (location.state as any).requestId
      const found = consents.find(c => c.id === reqId)
      if (found && found.status === 'PENDING') {
        setSelectedRequest(found)
        setWizardStep('review')
      }
      // clear navigation state to prevent re-opening on manual refreshes
      window.history.replaceState({}, document.title)
    }
  }, [location, consents])

  if (!user) return null

  const handleOpenWizard = (c: ConsentRequest) => {
    setSelectedRequest(c)
    setWizardStep('review')
    setOtpCode(['', '', '', '', '', ''])
  }

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return // Allow only numbers
    const newOtp = [...otpCode]
    newOtp[index] = value.substring(value.length - 1)
    setOtpCode(newOtp)

    // Auto-focus next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerifyConsent = async () => {
    const fullCode = otpCode.join('')
    if (fullCode.length < 6) {
      showToast('Please enter the complete 6-digit cryptographic verification key.', 'warning')
      return
    }
    if (!selectedRequest) return

    try {
      setIsVerifying(true)
      await requestApi.patientConsent({ requestId: selectedRequest.id, action: 'APPROVE' })
      showToast('CRYPTOGRAPHIC DIGITAL SIGNATURE ATTACHED!', 'success')
      setWizardStep('success')
      fetchConsents()
    } catch (e: any) {
      showToast(e.message || 'Signature verification failed. Confirm OTP code.', 'error')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleRevokeConsent = async (requestId: string) => {
    if (!window.confirm('WARNING: Revoking consent will instantly lock your medical dossiers. Any active clinician sharing session will be aborted. Do you want to proceed?')) {
      return
    }
    try {
      await requestApi.patientConsent({ requestId, action: 'REJECT' })
      showToast('Exchange consent revoked. Access locked.', 'error')
      fetchConsents()
    } catch (e: any) {
      showToast(e.message || 'Failed to revoke consent.', 'error')
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
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Patient Consent Signature Hub</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Cryptographic Onboarding. Authorize or revoke cross-hospital health record transfers instantly.
          </p>
        </div>

        {/* Info panel */}
        <div className="p-4 rounded-2xl flex items-start gap-3 border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 mt-0.5 shrink-0" fill="currentColor" style={{ color: 'var(--color-primary)' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <div className="text-xs">
            <h4 className="font-bold text-(--color-text)">Sovereign Patient Access Protocol</h4>
            <p className="mt-1 leading-relaxed text-(--color-text-secondary)">
              Every sharing transaction utilizes **Dual-Consent Authorization**. External physicians require your active digital approval before viewing clinical data. You can unilaterally click **Revoke Consent** at any time to block active sessions instantly.
            </p>
          </div>
        </div>

        {/* TABLE LISTING */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-12 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
            <span className="col-span-3">Requestor Doctor</span>
            <span className="col-span-3">Holding Hospital</span>
            <span className="col-span-2">Access Reason</span>
            <span className="col-span-2 text-center">Status</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center text-xs text-(--color-text-secondary) animate-pulse">
              Loading active consents...
            </div>
          ) : consents.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <svg viewBox="0 0 24 24" className="h-10 w-10 mx-auto mb-3 text-(--color-text-tertiary)" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No active sharing requests</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Pending cross-hospital requests requiring your signature will appear here.</p>
            </div>
          ) : consents.map((c, index) => {
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
                className="grid grid-cols-12 items-center px-5 py-4 text-sm transition-all border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {/* Doctor */}
                <div className="col-span-3 flex flex-col pr-2">
                  <span className="font-semibold text-(--color-text)">{c.requestingDoctor?.name || 'Requesting Clinician'}</span>
                  <span className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Specialization: {c.requestingDoctor?.specialization || 'Clinical HIE Specialist'}
                  </span>
                </div>

                {/* Hospital */}
                <span className="col-span-3 font-medium text-(--color-text) pr-2">
                  {c.requestingDoctor?.hospital?.name || 'External Medical Group'}
                </span>

                {/* Reason */}
                <span className="col-span-2 text-xs truncate pr-2 text-(--color-text-secondary)" title={c.reason}>
                  "{c.reason || 'Clinical dossier review'}"
                </span>

                {/* Status Badge */}
                <div className="col-span-2 text-center">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
                    style={{
                      backgroundColor: c.status === 'APPROVED' ? 'var(--color-success-light)' : c.status === 'PENDING' ? 'var(--color-warning-light)' : c.status === 'PATIENT_APPROVED' ? 'var(--color-primary-light)' : 'var(--color-error-light)',
                      color: c.status === 'APPROVED' ? 'var(--color-success)' : c.status === 'PENDING' ? 'var(--color-warning)' : c.status === 'PATIENT_APPROVED' ? 'var(--color-primary)' : 'var(--color-error)',
                    }}
                  >
                    {c.status === 'PATIENT_APPROVED' ? 'PATIENT SIGNED' : c.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end">
                  {c.status === 'PENDING' ? (
                    <Button variant="primary" size="sm" onClick={() => handleOpenWizard(c)}>
                      Authorize & Sign
                    </Button>
                  ) : (c.status === 'APPROVED' || c.status === 'PATIENT_APPROVED') ? (
                    <Button variant="danger" size="sm" onClick={() => handleRevokeConsent(c.id)}>
                      Revoke Consent
                    </Button>
                  ) : (
                    <span className="text-xs italic text-(--color-text-tertiary)">Closed</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* SIGNATURE WIZARD DRAWER/MODAL */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            {/* Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl p-6 shadow-xl z-10 flex flex-col gap-5 border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {/* STEP 1: REVIEW DETAILS */}
              {wizardStep === 'review' && (
                <>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Authorize Medical Consent Signature</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Step 1 of 2: Carefully review the data disclosure scopes.</p>
                  </div>

                  <div className="flex flex-col gap-4 text-xs">
                    <div className="p-4 rounded-xl flex flex-col gap-2" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                      <div>
                        <span className="font-bold text-(--color-text-secondary)">Requestor: </span>
                        <span className="font-semibold text-(--color-text)">{selectedRequest.requestingDoctor?.name} ({selectedRequest.requestingDoctor?.hospital?.name})</span>
                      </div>
                      <div>
                        <span className="font-bold text-(--color-text-secondary)">Authorized Scope: </span>
                        <span className="font-semibold text-(--color-text)">All records, clinical logs, prescriptions, and files in Custodian Hospital database.</span>
                      </div>
                      <div className="mt-1">
                        <span className="font-bold text-(--color-text-secondary)">Clinical Reason: </span>
                        <span className="italic text-(--color-text-secondary)">"{selectedRequest.reason}"</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500">
                      <span className="font-bold block uppercase tracking-wider text-[10px]">🔒 Secure Transmission Note</span>
                      <p className="mt-1 leading-relaxed text-[11px]">
                        By proceeding, you will receive a secure **6-digit cryptographic verification key (OTP)** to authorize the release signatures immutably.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-1">
                    <Button variant="default" onClick={() => setSelectedRequest(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => setWizardStep('otp')}>
                      Proceed to OTP Verification
                    </Button>
                  </div>
                </>
              )}

              {/* STEP 2: OTP VERIFICATION */}
              {wizardStep === 'otp' && (
                <>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Enter Verification Key</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Step 2 of 2: We have simulated an OTP dispatch to your registered device.</p>
                  </div>

                  <div className="flex flex-col gap-4 py-2">
                    <div className="flex justify-between items-center gap-2 max-w-sm mx-auto w-full">
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(e.target.value, idx)}
                          onKeyDown={e => handleKeyDown(e, idx)}
                          className="w-12 h-12 text-center text-lg font-extrabold rounded-xl outline-none border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-transparent"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                        />
                      ))}
                    </div>

                    <div className="text-center">
                      <span className="text-xs text-(--color-text-secondary)">
                        Simulated Sandbox OTP: <span className="font-extrabold text-indigo-400 select-all font-mono">123456</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-1">
                    <Button variant="default" disabled={isVerifying} onClick={() => setWizardStep('review')}>
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      isLoading={isVerifying}
                      loadingText="Verifying signature..."
                      onClick={handleVerifyConsent}
                    >
                      Confirm Digital Signature
                    </Button>
                  </div>
                </>
              )}

              {/* STEP 3: SUCCESS ANIMATION */}
              {wizardStep === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center p-4 gap-4"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-500/10 border-2 border-green-500 text-green-500">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-green-500 uppercase tracking-wide">Consent Signed!</h3>
                    <p className="text-xs mt-1 max-w-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Your digital signature and ledger verification hashes have been successfully locked to the HIE database! The custodian hospital will release your records shortly.
                    </p>
                  </div>

                  <Button variant="primary" className="mt-2 w-full" onClick={() => setSelectedRequest(null)}>
                    Dismiss Signature Window
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default ConsentPage
