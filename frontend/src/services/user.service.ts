import type { ApiResponse } from '../types/auth.types'
import { request } from './api'

export type NotificationPreference = {
    id: string
    userId: string
    emailEnabled: boolean
    smsEnabled: boolean
    inAppEnabled: boolean
}

export const userApi = {
    getPreferences: () => {
        return request<ApiResponse<NotificationPreference>>('/users/preferences')
    },
    updatePreferences: (payload: Partial<Omit<NotificationPreference, 'id' | 'userId'>>) => {
        return request<ApiResponse<NotificationPreference>>('/users/preferences', {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
    }
}
