import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import { ConsentSkeleton } from '../components/skeletons/PageSkeletons'
import Button from '../components/shared/Button'
import { requestApi } from '../services/request.service'

type ConsentLocationState = {
  requestId?: string
}

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
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpError, setOtpError] = useState('')

  const fetchConsents = useCallback(async () => {
    try {
      setLoading(true)
      const data = await requestApi.list() as any
      setConsents(data.data?.requests || data.data || [])
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch active consents ledger'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    void fetchConsents()
  }, [user, navigate, fetchConsents])

  useEffect(() => {
    const state = location.state as ConsentLocationState | null
    if (state?.requestId && consents.length > 0) {
      const reqId = state.requestId
      const found = consents.find(c => c.id === reqId)
      if (found && found.status === 'PENDING') {
        queueMicrotask(() => {
          setSelectedRequest(found)
          setWizardStep('review')
        })
      }
      // clear navigation state to prevent re-opening on manual refreshes
      window.history.replaceState({}, document.title)
    }
  }, [location.state, consents])

  if (!user) return null

  const [otpSent, setOtpSent] = useState(false)

  const handleOpenWizard = (c: ConsentRequest) => {
    setSelectedRequest(c)
    setWizardStep('review')
    setOtpCode(['', '', '', '', '', ''])
    setOtpError('')
    setOtpSent(false)
  }

  const handleSendOtp = async () => {
    if (!selectedRequest) return
    setIsSendingOtp(true)
    setOtpError('')
    try {
      await requestApi.sendConsentOtp(selectedRequest.id)
      setOtpSent(true)
      showToast('Verification code sent to your email.', 'success')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send verification code'
      setOtpError(message)
      showToast(message, 'error')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleResendOtp = async () => {
    setOtpCode(['', '', '', '', '', ''])
    setOtpError('')
    await handleSendOtp()
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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').trim()
    if (!/^\d+$/.test(pastedData)) return

    const digits = pastedData.slice(0, 6).split('')
    const newOtp = [...otpCode]

    digits.forEach((digit, i) => {
      newOtp[i] = digit
    })

    setOtpCode(newOtp)

    const focusIndex = Math.min(digits.length, 5)
    const nextInput = document.getElementById(`otp-${focusIndex}`)
    nextInput?.focus()
  }

  const handleVerifyConsent = async () => {
    const fullCode = otpCode.join('')
    if (fullCode.length < 6) {
      setOtpError('Please enter the complete 6-digit verification code.')
      return
    }
    if (!selectedRequest) return

    try {
      setIsVerifying(true)
      setOtpError('')
      await requestApi.verifyConsentOtp(selectedRequest.id, fullCode)
      showToast('Consent authorized successfully!', 'success')
      setWizardStep('success')
      void fetchConsents()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid or expired verification code.'
      setOtpError(message)
      showToast(message, 'error')
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
      void fetchConsents()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to revoke consent.'
      showToast(message, 'error')
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
            <ConsentSkeleton />
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
              {/* STEP 1: REVIEW + OTP (combined) */}
              {wizardStep === 'review' && (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 shrink-0">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Authorize medical consent</h3>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Review the access request carefully before approving.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Main Info Card */}
                    <div className="p-5 rounded-2xl flex flex-col gap-5 border" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                            {selectedRequest.requestingDoctor?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'DR'}
                          </div>
                          <div>
                            <h4 className="font-bold text-[15px]" style={{ color: 'var(--color-text)' }}>{selectedRequest.requestingDoctor?.name}</h4>
                            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{selectedRequest.requestingDoctor?.hospital?.name}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-wide">
                          Verified
                        </div>
                      </div>

                      {/* Scope */}
                      <div className="flex gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-(--color-text-tertiary) uppercase tracking-wider mb-1">AUTHORIZED SCOPE</p>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>All records, clinical logs, prescriptions, and files in Custodian Hospital database.</p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="flex gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            <circle cx="12" cy="12" r="2" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-(--color-text-tertiary) uppercase tracking-wider mb-1">CLINICAL REASON</p>
                          <p className="text-sm italic font-medium" style={{ color: 'var(--color-text)' }}>"{selectedRequest.reason}"</p>
                        </div>
                      </div>
                    </div>

                    {/* OTP / Verification Box */}
                    {!otpSent ? (
                      <>
                        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-center gap-3.5">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                          </svg>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                            A 6-digit verification code will be sent to your registered email address.
                          </p>
                        </div>
                        <div className="flex gap-3 mt-1 w-full">
                          <Button variant="primary" onClick={handleSendOtp} isLoading={isSendingOtp} loadingText="Sending..." className="flex-1 justify-center py-2.5">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            Send verification code
                          </Button>
                          <Button variant="default" onClick={() => setSelectedRequest(null)} className="py-2.5 px-6">
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Enter 6-digit code</span>
                            <button onClick={handleResendOtp} disabled={isSendingOtp} className="text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors cursor-pointer outline-none">
                              Resend code
                            </button>
                          </div>
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
                                onPaste={handlePaste}
                                className="w-12 h-12 text-center text-lg font-extrabold rounded-xl outline-none border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all bg-transparent"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                              />
                            ))}
                          </div>
                          {otpError && (
                            <p className="text-center text-xs font-semibold text-rose-500 mt-4">{otpError}</p>
                          )}
                          <p className="text-center text-[11px] mt-4" style={{ color: 'var(--color-text-secondary)' }}>
                            Code expires in 10 minutes.
                          </p>
                        </div>
                        <div className="flex gap-3 mt-1 w-full">
                          <Button variant="primary" onClick={handleVerifyConsent} isLoading={isVerifying} loadingText="Verifying..." className="flex-1 justify-center py-2.5">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            Authorize Consent
                          </Button>
                          <Button variant="default" onClick={() => setSelectedRequest(null)} className="py-2.5 px-6">
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}
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
