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

export const dashboardApi = {
    superAdminStats: () => request<ApiResponse<SuperAdminDashboardStats>>('/dashboard/superadmin/stats'),
}
