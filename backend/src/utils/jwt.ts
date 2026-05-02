import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export interface AccessTokenPayload {
    sub: string;
    role?: string;
}

export interface RefreshTokenPayload {
    sub: string;
}

export function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

export function signAccessToken(payload: AccessTokenPayload): string {
    const expiresIn: SignOptions["expiresIn"] = getRequiredEnv(
        "ACCESS_TOKEN_EXPIRES_IN"
    ) as SignOptions["expiresIn"];

    return jwt.sign(payload, getRequiredEnv("ACCESS_TOKEN_SECRET"), {
        expiresIn
    });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
    const expiresIn: SignOptions["expiresIn"] = getRequiredEnv(
        "REFRESH_TOKEN_EXPIRES_IN"
    ) as SignOptions["expiresIn"];

    return jwt.sign(payload, getRequiredEnv("REFRESH_TOKEN_SECRET"), {
        expiresIn
    });
}

export function verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, getRequiredEnv("ACCESS_TOKEN_SECRET")) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, getRequiredEnv("REFRESH_TOKEN_SECRET")) as JwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
}

export function getExpiryDate(expiresIn: string): Date {
    const trimmed = expiresIn.trim();
    const numeric = Number(trimmed);

    if (!Number.isNaN(numeric)) {
        return new Date(Date.now() + numeric * 1000);
    }

    const match = /^([0-9]+)([smhd])$/i.exec(trimmed);
    if (!match) {
        throw new Error("Invalid expiresIn format. Use number (seconds) or 15m/2h/7d.");
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    return new Date(Date.now() + value * multipliers[unit]);
}
