import crypto from "crypto";

import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { LoginResult, LogoutResponse } from "../types/auth.types";
import {
    getExpiryDate,
    getRequiredEnv,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";
import { sendForgotPasswordEmail } from "../utils/email";

export class AuthRepository {
    private hashToken(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async login(email: string, password: string): Promise<LoginResult | null> {
        const user = await prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: { patient: true, doctor: true, receptionist: true, superAdmin: true }
        });

        if (!user || !user.isActive) return null;

        const passwordMatch = await comparePassword(password, user.passwordHash);
        if (!passwordMatch) return null;

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
                data: { userId: user.id, tokenHash, expiresAt }
            })
        ]);

        const name = user.superAdmin?.fullName ?? user.patient?.name ?? user.doctor?.name ?? user.receptionist?.name ?? email.split('@')[0];
        const hospitalId = user.doctor?.hospitalId
            ?? user.receptionist?.hospitalId
            ?? (user.role === "HOSPITAL_ADMIN" && user.tenantId
                ? (await prisma.hospital.findUnique({ where: { tenantId: user.tenantId }, select: { id: true } }))?.id ?? null
                : null);

        return {
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                name,
                role: user.role,
                isActive: user.isActive,
                isVerified: user.isVerified,
                tenantId: user.tenantId ?? null,
                hospitalId,
                profileImageUrl: user.profileImageUrl ?? null
            },
            accessToken,
            refreshToken
        };
    }

    async register(data: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
    }): Promise<LoginResult> {
        const existing = await prisma.user.findFirst({ where: { email: data.email } });
        if (existing) throw new Error("EMAIL_TAKEN");

        const passwordHash = await hashPassword(data.password);

        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash,
                    phone: data.phone ?? null,
                    role: "PATIENT",
                    isActive: true,
                    isVerified: false,
                }
            });

            const patient = await tx.patient.create({
                data: {
                    userId: user.id,
                    name: `${data.firstName} ${data.lastName}`,
                }
            });

            // Audit log removed as CREATE_PATIENT is no longer in AuditAction enum

            return user;
        });

        const accessToken = signAccessToken({ sub: result.id, role: result.role });
        const refreshToken = signRefreshToken({ sub: result.id });
        const tokenHash = this.hashToken(refreshToken);
        const expiresAt = getExpiryDate(getRequiredEnv("REFRESH_TOKEN_EXPIRES_IN"));

        await prisma.refreshToken.create({
            data: { userId: result.id, tokenHash, expiresAt }
        });

        return {
            success: true,
            message: "Registration successful",
            user: {
                id: result.id,
                email: result.email,
                name: `${data.firstName} ${data.lastName}`,
                role: result.role,
                isActive: result.isActive,
                isVerified: result.isVerified,
                profileImageUrl: null
            },
            accessToken,
            refreshToken
        };
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
        if (!user) return; // silent — don't reveal if email exists

        const code = this.generateOtp();
        const codeHash = this.hashToken(code);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.oTP.deleteMany({ where: { userId: user.id, purpose: "RESET_PASSWORD" } });
        await prisma.oTP.create({
            data: { userId: user.id, codeHash, purpose: "RESET_PASSWORD", expiresAt }
        });

        await sendForgotPasswordEmail(email, code);
    }

    async verifyOtp(email: string, code: string): Promise<string | null> {
        const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
        if (!user) return null;

        const codeHash = this.hashToken(code);
        const otp = await prisma.oTP.findFirst({
            where: {
                userId: user.id,
                codeHash,
                purpose: "RESET_PASSWORD",
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });

        if (!otp) return null;

        await prisma.oTP.update({ where: { id: otp.id }, data: { isUsed: true } });

        const resetToken = crypto.randomUUID();
        const resetTokenHash = this.hashToken(resetToken);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.oTP.create({
            data: { userId: user.id, codeHash: resetTokenHash, purpose: "RESET_TOKEN", expiresAt }
        });

        return resetToken;
    }

    async resetPassword(resetToken: string, newPassword: string): Promise<boolean> {
        const resetTokenHash = this.hashToken(resetToken);
        const otp = await prisma.oTP.findFirst({
            where: {
                codeHash: resetTokenHash,
                purpose: "RESET_TOKEN",
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });

        if (!otp) return false;

        const passwordHash = await hashPassword(newPassword);

        await prisma.$transaction([
            prisma.user.update({ where: { id: otp.userId }, data: { passwordHash } }),
            prisma.oTP.update({ where: { id: otp.id }, data: { isUsed: true } }),
            prisma.refreshToken.updateMany({
                where: { userId: otp.userId, revokedAt: null },
                data: { revokedAt: new Date() }
            })
        ]);

        return true;
    }

    async refresh(refreshToken: string): Promise<LoginResult | null> {
        try { verifyRefreshToken(refreshToken); } catch { return null; }

        const tokenHash = this.hashToken(refreshToken);
        const storedToken = await prisma.refreshToken.findFirst({
            where: { tokenHash, revokedAt: null },
            include: {
                user: {
                    include: { patient: true, doctor: true, receptionist: true, superAdmin: true }
                }
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

        if (storedToken.user.deletedAt) {
            await prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { revokedAt: new Date() }
            });
            return null;
        }

        const accessToken = signAccessToken({ sub: storedToken.userId, role: storedToken.user.role });
        const newRefreshToken = signRefreshToken({ sub: storedToken.userId });
        const newTokenHash = this.hashToken(newRefreshToken);
        const newExpiresAt = getExpiryDate(getRequiredEnv("REFRESH_TOKEN_EXPIRES_IN"));

        await prisma.$transaction([
            prisma.refreshToken.update({ where: { id: storedToken.id }, data: { revokedAt: new Date() } }),
            prisma.refreshToken.create({ data: { userId: storedToken.userId, tokenHash: newTokenHash, expiresAt: newExpiresAt } })
        ]);

        const name = storedToken.user.superAdmin?.fullName ?? storedToken.user.patient?.name ?? storedToken.user.doctor?.name ?? storedToken.user.receptionist?.name ?? storedToken.user.email.split('@')[0];
        const hospitalId = storedToken.user.doctor?.hospitalId
            ?? storedToken.user.receptionist?.hospitalId
            ?? (storedToken.user.role === "HOSPITAL_ADMIN" && storedToken.user.tenantId
                ? (await prisma.hospital.findUnique({ where: { tenantId: storedToken.user.tenantId }, select: { id: true } }))?.id ?? null
                : null);

        return {
            success: true,
            message: "Token refreshed successfully",
            user: {
                id: storedToken.user.id,
                email: storedToken.user.email,
                name,
                role: storedToken.user.role,
                isActive: storedToken.user.isActive,
                isVerified: storedToken.user.isVerified,
                tenantId: storedToken.user.tenantId ?? null,
                hospitalId,
                profileImageUrl: storedToken.user.profileImageUrl ?? null
            },
            accessToken,
            refreshToken: newRefreshToken
        };
    }

    async logout(refreshToken: string): Promise<LogoutResponse> {
        const tokenHash = this.hashToken(refreshToken);
        await prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() }
        });
        return { message: "Successfully logged out." };
    }
}
