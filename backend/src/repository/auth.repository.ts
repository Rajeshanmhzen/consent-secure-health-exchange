import crypto from "crypto";

import prisma from "../config/prisma";
import { LoginResult, LogoutResponse } from "../types/auth.types";
import {
    getExpiryDate,
    getRequiredEnv,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} from "../utils/jwt";
import { comparePassword } from "../utils/password";

export class AuthRepository {
    private hashToken(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
    }

    async login(email: string, password: string): Promise<LoginResult | null> {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.isActive) {
            return null;
        }

        const passwordMatch = await comparePassword(password, user.passwordHash);
        if (!passwordMatch) {
            return null;
        }

        const accessToken = signAccessToken({ sub: user.id, role: user.role });
        const refreshToken = signRefreshToken({ sub: user.id });
        const tokenHash = this.hashToken(refreshToken);
        const expiresAt = getExpiryDate(getRequiredEnv("REFRESH_TOKEN_EXPIRES_IN"));

        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            }),
            prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    tokenHash,
                    expiresAt
                }
            })
        ]);

        return {
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                isVerified: user.isVerified
            },
            accessToken,
            refreshToken
        };
    }

    async refresh(refreshToken: string): Promise<LoginResult | null> {
        try {
            verifyRefreshToken(refreshToken);
        } catch {
            return null;
        }

        const tokenHash = this.hashToken(refreshToken);
        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                tokenHash,
                revokedAt: null
            },
            include: {
                user: true
            }
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            if (storedToken) {
                await prisma.refreshToken.update({
                    where: { id: storedToken.id },
                    data: { revokedAt: new Date() }
                });
            }
            return null;
        }

        const accessToken = signAccessToken({
            sub: storedToken.userId,
            role: storedToken.user.role
        });
        const newRefreshToken = signRefreshToken({ sub: storedToken.userId });
        const newTokenHash = this.hashToken(newRefreshToken);
        const newExpiresAt = getExpiryDate(getRequiredEnv("REFRESH_TOKEN_EXPIRES_IN"));

        await prisma.$transaction([
            prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { revokedAt: new Date() }
            }),
            prisma.refreshToken.create({
                data: {
                    userId: storedToken.userId,
                    tokenHash: newTokenHash,
                    expiresAt: newExpiresAt
                }
            })
        ]);

        return {
            success: true,
            message: "Token refreshed successfully",
            user: {
                id: storedToken.user.id,
                email: storedToken.user.email,
                role: storedToken.user.role,
                isActive: storedToken.user.isActive,
                isVerified: storedToken.user.isVerified
            },
            accessToken,
            refreshToken: newRefreshToken
        };
    }

    async logout(refreshToken: string): Promise<LogoutResponse> {
        const tokenHash = this.hashToken(refreshToken);
        const result = await prisma.refreshToken.updateMany({
            where: {
                tokenHash,
                revokedAt: null
            },
            data: {
                revokedAt: new Date()
            }
        });

        return {
            message: `Successfully logged out.`
        };
    }
}
