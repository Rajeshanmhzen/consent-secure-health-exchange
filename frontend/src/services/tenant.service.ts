import type { ApiResponse } from '../types/auth.types'
import { request } from './api'

export type Tenant = {
    id: string
    name: string
    type: string
    isActive: boolean
    createdAt: string
    hospital?: { name: string; email: string | null; isVerified: boolean } | null
}

export type TenantListData = {
    hospitals: Tenant[]
    pagination: { total: number; page: number; limit: number; totalPages: number }
}

export type AddTenantPayload = {
    tenantName: string
    hospitalName: string
    hospitalEmail: string
    adminEmail: string
    adminPassword: string
    adminPhone: string
    isTenantActive: boolean
    isAdminActive: boolean
    isAdminVerified: boolean
}

export const tenantApi = {
    list: (params: { page?: number; limit?: number; search?: string; isActive?: boolean }) => {
        const q = new URLSearchParams()
        if (params.page)              q.set('page',     String(params.page))
        if (params.limit)             q.set('limit',    String(params.limit))
        if (params.search)            q.set('search',   params.search)
        if (params.isActive !== undefined) q.set('isActive', String(params.isActive))
        return request<ApiResponse<TenantListData>>(`/tenant/list?${q.toString()}`)
    },
    add: (payload: AddTenantPayload) => {
        return request<ApiResponse<any>>('/tenant/hospital/add', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
}
