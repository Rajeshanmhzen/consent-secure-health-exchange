import type { ApiResponse } from '../types/auth.types'
import { request } from './api'

export type SuperAdmin = {
    id: string
    fullName: string
    userId: string
    user: {
        id: string
        email: string
        phone: string | null
        role: string
        isActive: boolean
        isVerified: boolean
        createdAt: string
    }
}

export type SuperAdminListData = {
    superAdmins: SuperAdmin[]
    pagination: { total: number; page: number; limit: number; totalPages: number }
}

export const superAdminApi = {
    list: (params: { page?: number; limit?: number; search?: string }) => {
        const q = new URLSearchParams()
        if (params.page)              q.set('page',     String(params.page))
        if (params.limit)             q.set('limit',    String(params.limit))
        if (params.search)            q.set('search',   params.search)
        return request<ApiResponse<SuperAdminListData>>(`/superadmin/list?${q.toString()}`)
    },
}
