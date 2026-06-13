
export type AuthUser = {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
    tenantId?: string;
    hospitalId?: string | null;
    profileImageUrl?: string | null;
};

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

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

export type VerifyOtpResponse = ApiResponse<{ resetToken: string }>;

export type ResetPasswordRequest = {
    token: string;
    newPassword: string;
    confirmPassword: string;
};

export type RefreshRequest = {
    refreshToken: string;
};

export type LogoutRequest = {
    refreshToken: string;
};


export type AuthTokenData = {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
};

export type RefreshTokenData = {
    accessToken: string;
    refreshToken: string;
};


export type AuthResponse        = ApiResponse<AuthTokenData>;
export type RefreshResponse     = ApiResponse<RefreshTokenData>;
export type MessageResponse     = ApiResponse<null>;
