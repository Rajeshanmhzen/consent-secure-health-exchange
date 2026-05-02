export type AuthUserPayload = {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
};

export type LoginResult = {
    success: boolean;
    message?: string;
    user: AuthUserPayload;
    accessToken: string;
    refreshToken: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type RefreshRequest = {
    refreshToken: string;
};

export type LogoutRequest = {
    refreshToken: string;
};
export type LogoutResponse = {
    message: string;
};
