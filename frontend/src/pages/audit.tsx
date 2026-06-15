import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../Context/AuthContext'
import { useToast } from '../Context/ToastContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import Pagination from '../components/shared/Pagination'
import FilterTabs from '../components/shared/FilterTabs'
import { dashboardApi } from '../services/dashboard.service'

type AuditEvent = {
  id: string
  action: string
  userEmail: string
  userName: string
  role: string
  targetPatientName: string
  ipAddress: string
  createdAt: string
  metadata: Record<string, unknown>
}

const AuditSkeleton = () => (
  <div className="animate-pulse flex flex-col w-full">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="grid grid-cols-12 items-center px-5 py-4 transition-all" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="col-span-3 flex flex-col pr-2 gap-1.5">
          <div className="h-4 w-32 rounded-md bg-slate-500/20"></div>
          <div className="h-3 w-16 rounded-md bg-slate-500/10"></div>
        </div>
        <div className="col-span-3 flex flex-col gap-1.5">
          <div className="h-5 w-24 rounded-full bg-slate-500/20"></div>
          <div className="h-3 w-28 rounded-md bg-slate-500/10"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 w-28 rounded-md bg-slate-500/20"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 w-24 rounded-md bg-slate-500/10"></div>
        </div>
        <div className="col-span-2 flex items-center justify-end">
          <div className="h-4 w-20 rounded-md bg-indigo-500/20"></div>
        </div>
      </div>
    ))}
  </div>
)


const auditTabs = [
    { key: 'All', label: 'All Actions' },
    { key: 'VIEW_RECORD', label: 'VIEW RECORD' },
    { key: 'APPROVE_CONSENT', label: 'APPROVE CONSENT' },
    { key: 'EMERGENCY_ACCESS', label: 'EMERGENCY ACCESS' },
    { key: 'CREATE_REQUEST', label: 'CREATE REQUEST' }
] as const

const AuditPage = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await dashboardApi.auditLogs()
      setEvents(res.data)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch audit logs'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchLogs()
    }
  }, [user])

  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('All')
  const [page, setPage] = useState(1)
  const itemsPerPage = 6

  const [selectedMetadata, setSelectedMetadata] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  // Filtering
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.userName.toLowerCase().includes(search.toLowerCase()) ||
      e.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      e.targetPatientName.toLowerCase().includes(search.toLowerCase())
    const matchesAction = actionFilter === 'All' || e.action === actionFilter
    return matchesSearch && matchesAction
  })

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const paginatedEvents = filteredEvents.slice((page - 1) * itemsPerPage, page * itemsPerPage)

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
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--color-text)' }}>Security Audit Trail</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Immutable Transaction Registry. Auditing diagnostic accesses, OTP authorizations, and critical overrides.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col gap-4 p-4 rounded-2xl animate-fadeIn" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" style={{ color: 'var(--color-text-secondary)' }}>
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder="Search by user name, email, or target patient..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--color-text)' }}
            />
          </div>

          <FilterTabs
              tabs={auditTabs}
              value={actionFilter}
              onChange={(val) => { setActionFilter(val); setPage(1); }}
              layoutId="activeAuditTabUnderline"
          />
        </div>

        {/* Table Listing */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-12 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
            <span className="col-span-3">User / Role</span>
            <span className="col-span-3">Action Type</span>
            <span className="col-span-2">Target Patient</span>
            <span className="col-span-2">IP Address</span>
            <span className="col-span-2 text-right">Details</span>
          </div>

          {loading ? (
            <AuditSkeleton />
          ) : paginatedEvents.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <svg viewBox="0 0 24 24" className="h-10 w-10 mx-auto mb-3" fill="currentColor" style={{ color: 'var(--color-text-tertiary)' }}>
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>No audit events logged</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Activity trail will record transaction triggers</p>
            </div>
          ) : paginatedEvents.map((e, index) => {
            const isEmergency = e.action === 'EMERGENCY_ACCESS'
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
                className="grid grid-cols-12 items-center px-5 py-4 text-sm transition-all"
                style={{
                  borderTop: '1px solid var(--color-border)',
                  backgroundColor: isEmergency ? 'rgba(239, 68, 68, 0.02)' : 'transparent'
                }}
                onMouseEnter={el => (el.currentTarget.style.backgroundColor = isEmergency ? 'rgba(239, 68, 68, 0.04)' : 'var(--color-table-hover)')}
                onMouseLeave={el => (el.currentTarget.style.backgroundColor = isEmergency ? 'rgba(239, 68, 68, 0.02)' : 'transparent')}
              >
                {/* User */}
                <div className="col-span-3 flex flex-col pr-2">
                  <span className="font-semibold text-(--color-text) truncate">{e.userName}</span>
                  <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--color-primary)' }}>{e.role}</span>
                </div>

                {/* Action Tag */}
                <div className="col-span-3">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{
                      backgroundColor: isEmergency ? 'var(--color-error-light)' : e.action === 'APPROVE_CONSENT' ? 'var(--color-success-light)' : 'var(--color-primary-ghost)',
                      color: isEmergency ? 'var(--color-error)' : e.action === 'APPROVE_CONSENT' ? 'var(--color-success)' : 'var(--color-primary)',
                    }}
                  >
                    {e.action.replace('_', ' ')}
                  </span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(e.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Target Patient */}
                <span className="col-span-2 font-medium" style={{ color: 'var(--color-text)' }}>{e.targetPatientName}</span>

                {/* IP Address */}
                <span className="col-span-2 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>{e.ipAddress}</span>

                {/* Details Button */}
                <div className="col-span-2 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedMetadata(e.metadata)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    Inspect File
                  </button>
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

      {/* INSPECTOR PANEL / MODAL */}
      <AnimatePresence>
        {selectedMetadata && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMetadata(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            {/* Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl p-6 shadow-xl z-10 flex flex-col gap-4 border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Audit Transaction Envelope</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Detailed cryptographic parameters stored inside audit databases.</p>
              </div>

              <div className="rounded-xl p-4 overflow-x-auto max-h-[300px] border" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}>
                <pre className="text-xs font-mono" style={{ color: 'var(--color-primary)' }}>
                  {JSON.stringify(selectedMetadata, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end gap-3 mt-1">
                <button
                  onClick={() => setSelectedMetadata(null)}
                  className="px-4 py-2 text-xs font-bold text-white rounded-xl active:scale-97 cursor-pointer"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Dismiss Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default AuditPage
