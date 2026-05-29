export type AuthUserPayload = {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
};

// ── Request types ──────────────────────────────────────────

export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
};

export type ForgotPasswordRequest = {
    email: string;
};

export type VerifyOtpRequest = {
    email: string;
    code: string;
};

export type ResetPasswordRequest = {
    email: string;
    code: string;
    newPassword: string;
};

export type RefreshRequest = {
    refreshToken: string;
};

export type LogoutRequest = {
    refreshToken: string;
};

// ── Response types ─────────────────────────────────────────

export type LoginResult = {
    success: boolean;
    message?: string;
    user: AuthUserPayload;
    accessToken: string;
    refreshToken: string;
};

export type AuthTokenResponse = {
    accessToken: string;
    refreshToken: string;
};

export type LogoutResponse = {
    message: string;
};

export type MessageResponse = {
    message: string;
};
