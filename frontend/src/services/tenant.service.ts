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

export type UpdateTenantPayload = {
    name?: string
    type?: 'HOSPITAL'
    isActive?: boolean
}

export type TenantUserRole = 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT'

export type CreateTenantUserPayload = {
    tenantId: string
    hospitalId?: string | null
    email: string
    password: string
    role: TenantUserRole
    phone?: string | null
    name: string
    specialization?: string | null
    licenseNumber?: string | null
    dob?: string | null
    gender?: string | null
    bloodGroup?: string | null
    allergies?: string | null
    isActive?: boolean
    isVerified?: boolean
}

export type TenantUserCreateResult = {
    user: {
        id: string
        tenantId: string
        email: string
        phone: string | null
        role: string
        isActive: boolean
        isVerified: boolean
        createdAt: string
    }
    doctor?: {
        id: string
        name: string
        specialization: string | null
        licenseNumber: string | null
    }
    receptionist?: {
        id: string
        name: string
    }
    patient?: {
        id: string
        name: string
        dob: string | null
        gender: string | null
        bloodGroup: string | null
        allergies: string | null
    }
}

export type UpdateTenantUserPayload = {
    email?: string
    password?: string
    phone?: string | null
    isActive?: boolean
    isVerified?: boolean
    name?: string
    specialization?: string | null
    licenseNumber?: string | null
    dob?: string | null
    gender?: string | null
    bloodGroup?: string | null
    allergies?: string | null
}

export type TenantUserListData = {
    users: any[] // We can type this better later if needed, but any[] matches what backend sends currently
    pagination: { total: number; page: number; limit: number; totalPages: number }
}

export const tenantApi = {
    list: (params: { page?: number; limit?: number; search?: string; isActive?: boolean; includeDeleted?: boolean; deletedOnly?: boolean }) => {
        const q = new URLSearchParams()
        if (params.page)              q.set('page',     String(params.page))
        if (params.limit)             q.set('limit',    String(params.limit))
        if (params.search)            q.set('search',   params.search)
        if (params.isActive !== undefined) q.set('isActive', String(params.isActive))
        if (params.includeDeleted !== undefined) q.set('includeDeleted', String(params.includeDeleted))
        if (params.deletedOnly !== undefined) q.set('deletedOnly', String(params.deletedOnly))
        return request<ApiResponse<TenantListData>>(`/tenant/list?${q.toString()}`)
    },
    add: (payload: AddTenantPayload) => {
        return request<ApiResponse<unknown>>('/tenant/hospital/add', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    updateTenant: (id: string, payload: UpdateTenantPayload) => {
        return request<ApiResponse<unknown>>(`/tenant/edit/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },
    deleteTenant: (id: string) => {
        return request<ApiResponse<unknown>>(`/tenant/delete/${id}`, {
            method: 'DELETE',
        })
    },
    hardDeleteTenant: (id: string) => {
        return request<ApiResponse<unknown>>(`/tenant/hard-delete/${id}`, {
            method: 'DELETE',
        })
    },
    restoreTenant: (id: string) => {
        return request<ApiResponse<unknown>>(`/tenant/restore/${id}`, {
            method: 'POST',
        })
    },
    bulkSoftDeleteTenants: (ids: string[]) => {
        return request<ApiResponse<unknown>>('/tenant/bulk/soft-delete', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        })
    },
    bulkHardDeleteTenants: (ids: string[]) => {
        return request<ApiResponse<unknown>>('/tenant/bulk/hard-delete', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        })
    },
    bulkRestoreTenants: (ids: string[]) => {
        return request<ApiResponse<unknown>>('/tenant/bulk/restore', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        })
    },
    addUser: (payload: CreateTenantUserPayload) => {
        return request<ApiResponse<TenantUserCreateResult>>('/tenant/user/add', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    listUsers: (params: { tenantId: string; page?: number; limit?: number; search?: string; role?: string; isActive?: boolean; includeDeleted?: boolean; deletedOnly?: boolean }) => {
        const q = new URLSearchParams()
        q.set('tenantId', params.tenantId)
        if (params.page)              q.set('page',     String(params.page))
        if (params.limit)             q.set('limit',    String(params.limit))
        if (params.search)            q.set('search',   params.search)
        if (params.role)              q.set('role',     params.role)
        if (params.isActive !== undefined) q.set('isActive', String(params.isActive))
        if (params.includeDeleted !== undefined) q.set('includeDeleted', String(params.includeDeleted))
        if (params.deletedOnly !== undefined) q.set('deletedOnly', String(params.deletedOnly))
        return request<ApiResponse<TenantUserListData>>(`/tenant/user/list?${q.toString()}`)
    },
    updateUser: (id: string, payload: UpdateTenantUserPayload) => {
        return request<ApiResponse<unknown>>(`/tenant/user/edit/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },
    deleteUser: (id: string) => {
        return request<ApiResponse<unknown>>(`/tenant/user/soft-delete/${id}`, {
            method: 'DELETE',
        })
    },
    hardDeleteUser: (id: string) => {
        return request<ApiResponse<unknown>>(`/tenant/user/hard-delete/${id}`, {
            method: 'DELETE',
        })
    },
    restoreUser: (id: string) => {
        return request<ApiResponse<unknown>>(`/tenant/user/restore/${id}`, {
            method: 'POST',
        })
    },
    bulkSoftDeleteUsers: (ids: string[]) => {
        return request<ApiResponse<unknown>>('/tenant/user/bulk/soft-delete', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        })
    },
    bulkHardDeleteUsers: (ids: string[]) => {
        return request<ApiResponse<unknown>>('/tenant/user/bulk/hard-delete', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        })
    },
    bulkRestoreUsers: (ids: string[]) => {
        return request<ApiResponse<unknown>>('/tenant/user/bulk/restore', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        })
    },
}
