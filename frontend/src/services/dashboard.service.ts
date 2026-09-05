import type { ApiResponse } from '../types/auth.types'
import { request } from './api'

export type SuperAdminDashboardStats = {
    totalTenants: number
    totalPlans: number
    totalSubscriptions: number
    totalUsers: number
    auditEvents: number
    totalInquiries: number
}

export type ApiPerformanceStatus = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ApiPerformanceMetric = {
    route: string
    requests: number
    errors: number
    errorRate: number
    averageLatencyMs: number
    lastLatencyMs: number
    status: ApiPerformanceStatus
}

export type ApiPerformanceData = {
    windowMinutes: number
    overall: ApiPerformanceMetric
    endpoints: ApiPerformanceMetric[]
    pagination: { total: number; page: number; limit: number; totalPages: number }
}

export type AuditLogItem = {
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

export type PatientListItem = {
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

export type CreatePatientPayload = Omit<PatientListItem, 'id' | 'createdAt'>

export type RecordListItem = {
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
    files: {
        name: string
        size: string
        type: string
        url?: string
    }[]
}

export const dashboardApi = {
    superAdminStats: () => request<ApiResponse<SuperAdminDashboardStats>>('/dashboard/superadmin/stats'),
    apiPerformance: (params: { page?: number; limit?: number } = {}) => {
        const query = new URLSearchParams()
        if (params.page) query.set('page', String(params.page))
        if (params.limit) query.set('limit', String(params.limit))
        return request<ApiResponse<ApiPerformanceData>>(`/dashboard/superadmin/api-performance?${query.toString()}`)
    },
    hospitalAdminStats: () => request<ApiResponse<Record<string, number>>>('/dashboard/hospitaladmin/stats'),
    doctorStats: () => request<ApiResponse<Record<string, number>>>('/dashboard/doctor/stats'),
    receptionistStats: () => request<ApiResponse<Record<string, number>>>('/dashboard/receptionist/stats'),
    patientStats: () => request<ApiResponse<Record<string, number>>>('/dashboard/patient/stats'),
    auditLogs: () => request<ApiResponse<AuditLogItem[]>>('/dashboard/superadmin/audit'),
    listPatients: () => request<ApiResponse<{ patients: PatientListItem[] }>>('/dashboard/patients'),
    createPatient: (payload: CreatePatientPayload) =>
        request<ApiResponse<{ patient: PatientListItem }>>('/dashboard/patients', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    listRecords: (search?: string) => {
        const query = search ? `?search=${encodeURIComponent(search)}` : ''
        return request<ApiResponse<{ records: RecordListItem[] }>>(`/dashboard/records${query}`)
    }
}
