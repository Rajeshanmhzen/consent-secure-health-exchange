import type { ApiResponse } from '../types/auth.types'
import { request } from './api'

export type NotificationPreference = {
    id: string
    userId: string
    emailEnabled: boolean
    smsEnabled: boolean
    inAppEnabled: boolean
}

export type UpdateProfilePayload = {
  email?: string
  phone?: string | null
  name?: string
  specialization?: string | null
  licenseNumber?: string | null
  dob?: string | null
  gender?: string | null
  bloodGroup?: string | null
  allergies?: string | null
}

export type ChangePasswordPayload = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
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
    },
    updateProfile: (payload: UpdateProfilePayload) => {
        return request<ApiResponse<{ id: string; email: string; phone: string | null }>>('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
    },
    changePassword: (payload: ChangePasswordPayload) => {
        return request<ApiResponse<null>>('/users/change-password', {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
    },
    updateProfileImage: (file: File) => {
        const formData = new FormData()
        formData.append('profileImage', file)
        return request<ApiResponse<{ id: string; profileImageUrl: string }>>('/users/profile/image', {
            method: 'PUT',
            rawBody: true,
            body: formData,
        })
    }
}
