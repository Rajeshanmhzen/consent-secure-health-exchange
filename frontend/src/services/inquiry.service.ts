import type { ApiResponse } from '../types/auth.types'
import { request } from './api'

export type InquiryStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
export type InquiryType = 'Sales / Demo' | 'Implementation Support' | 'Partnership' | 'General Question'

export type Inquiry = {
    id: string
    firstName: string
    lastName: string
    workEmail: string
    phoneNumber: string | null
    organization: string | null
    inquiryType: InquiryType
    message: string
    status: InquiryStatus
    createdAt: string
    updatedAt: string
}

export type CreateInquiryPayload = {
    firstName: string
    lastName: string
    workEmail: string
    phoneNumber?: string
    organization?: string
    inquiryType: InquiryType
    message: string
}

export type InquiryListData = {
    inquiries: Inquiry[]
    pagination: { total: number; page: number; limit: number; totalPages: number }
}

export type InquiryStats = {
    total: number
    pending: number
    inProgress: number
    resolved: number
}

export const inquiryApi = {
    create: (payload: CreateInquiryPayload) => {
        return request<ApiResponse<Inquiry>>('/inquiries/add', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    list: (params: { page?: number; limit?: number; search?: string; status?: InquiryStatus }) => {
        const q = new URLSearchParams()
        if (params.page) q.set('page', String(params.page))
        if (params.limit) q.set('limit', String(params.limit))
        if (params.search) q.set('search', params.search)
        if (params.status) q.set('status', params.status)
        return request<ApiResponse<InquiryListData>>(`/inquiries/list?${q.toString()}`)
    },
    stats: (params: { search?: string } = {}) => {
        const q = new URLSearchParams()
        if (params.search) q.set('search', params.search)
        return request<ApiResponse<InquiryStats>>(`/inquiries/stats?${q.toString()}`)
    },
    updateStatus: (id: string, status: InquiryStatus) => {
        return request<ApiResponse<Inquiry>>(`/inquiries/edit/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        })
    },
}
