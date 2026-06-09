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
