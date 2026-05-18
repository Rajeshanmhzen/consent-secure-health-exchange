import type {
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    VerifyOtpRequest,
    ResetPasswordRequest,
    RefreshRequest,
    LogoutRequest,
    AuthResponse,
    RefreshResponse,
    MessageResponse,
} from '../types/auth.types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? 'Request failed');
    return json;
}

export const authApi = {
    login: ({ email, password }: LoginRequest) =>
        request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (data: RegisterRequest) =>
        request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    forgotPassword: ({ email }: ForgotPasswordRequest) =>
        request<MessageResponse>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),

    verifyOtp: ({ email, code }: VerifyOtpRequest) =>
        request<MessageResponse>('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, code }),
        }),

    resetPassword: ({ email, code, newPassword }: ResetPasswordRequest) =>
        request<MessageResponse>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, code, newPassword }),
        }),

    refresh: ({ refreshToken }: RefreshRequest) =>
        request<RefreshResponse>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        }),

    logout: ({ refreshToken }: LogoutRequest) =>
        request<MessageResponse>('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        }),
};
