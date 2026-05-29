import type { ApiResponse } from '../types/auth.types'
import { request } from './api'

export type Plan = {
    id: string
    name: string
    monthlyPrice: number
    yearlyPrice: number
    currency: string
    description: string | null
    features: string[] | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type Subscription = {
    id: string
    tenantId: string
    planId: string
    status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'
    billingCycle: 'MONTHLY' | 'YEARLY'
    startsAt: string
    endsAt: string | null
    trialEndsAt: string | null
    canceledAt: string | null
    createdAt: string
    updatedAt: string
    tenant: {
        id: string
        name: string
        type: string
        isActive: boolean
    }
    plan: {
        id: string
        name: string
        monthlyPrice: number
        yearlyPrice: number
        currency: string
        isActive: boolean
    }
}

export type PlanListData = {
    plans: Plan[]
    pagination: { total: number; page: number; limit: number; totalPages: number }
}

export type SubscriptionListData = {
    subscriptions: Subscription[]
    pagination: { total: number; page: number; limit: number; totalPages: number }
}

export type CreatePlanPayload = {
    name: string
    monthlyPrice: number
    yearlyPrice: number
    currency?: string
    description?: string
    features?: string[]
    isActive?: boolean
}

export type CreateSubscriptionPayload = {
    tenantId: string
    planId: string
    status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'
    billingCycle?: 'MONTHLY' | 'YEARLY'
    startsAt?: string
    endsAt?: string | null
    trialEndsAt?: string | null
}

export const pricingApi = {
    // ================= PLANS =================
    listPlans: (params: { page?: number; limit?: number; search?: string }) => {
        const q = new URLSearchParams()
        if (params.page)   q.set('page',   String(params.page))
        if (params.limit)  q.set('limit',  String(params.limit))
        if (params.search) q.set('search', params.search)
        return request<ApiResponse<PlanListData>>(`/pricing/plans/list?${q.toString()}`)
    },
    addPlan: (payload: CreatePlanPayload) => {
        return request<ApiResponse<Plan>>('/pricing/plans/add', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    editPlan: (id: string, payload: Partial<CreatePlanPayload>) => {
        return request<ApiResponse<Plan>>(`/pricing/plans/edit/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },
    deletePlan: (id: string) => {
        return request<ApiResponse<any>>(`/pricing/plans/delete/${id}`, {
            method: 'DELETE',
        })
    },
    detailPlan: (id: string) => {
        return request<ApiResponse<Plan>>(`/pricing/plans/detail/${id}`)
    },

    // ================= SUBSCRIPTIONS =================
    listSubscriptions: (params: { page?: number; limit?: number; search?: string; status?: string }) => {
        const q = new URLSearchParams()
        if (params.page)   q.set('page',   String(params.page))
        if (params.limit)  q.set('limit',  String(params.limit))
        if (params.search) q.set('search', params.search)
        if (params.status) q.set('status', params.status)
        return request<ApiResponse<SubscriptionListData>>(`/pricing/subscriptions/list?${q.toString()}`)
    },
    addSubscription: (payload: CreateSubscriptionPayload) => {
        return request<ApiResponse<Subscription>>('/pricing/subscriptions/add', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    editSubscription: (id: string, payload: Partial<CreateSubscriptionPayload>) => {
        return request<ApiResponse<Subscription>>(`/pricing/subscriptions/edit/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },
    deleteSubscription: (id: string) => {
        return request<ApiResponse<any>>(`/pricing/subscriptions/delete/${id}`, {
            method: 'DELETE',
        })
    },
    detailSubscription: (id: string) => {
        return request<ApiResponse<Subscription>>(`/pricing/subscriptions/detail/${id}`)
    },
}
