import prisma from "../config/prisma";
import { AppError } from "../utils/appError";
import { AuditAction, NotificationType } from "@prisma/client";

export class EmergencyService {
    private async logAudit(userId: string, action: AuditAction, entityType: string, entityId: string, metadata: any) {
        try {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    entityType,
                    entityId,
                    metadata: metadata ? (metadata as any) : undefined
                }
            });
        } catch (e) {
            console.error("Failed to write audit log:", e);
        }
    }

    private async sendNotification(userId: string, type: NotificationType, message: string) {
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    type,
                    message
                }
            });
        } catch (e) {
            console.error("Failed to dispatch notification:", e);
        }
    }

    async triggerOverride(doctorId: string, payload: { patientEmail: string; reason: string }) {
        const doctor = await prisma.doctor.findFirst({
            where: { userId: doctorId },
            include: { hospital: true }
        });
        if (!doctor) {
            throw new AppError("Only authorized doctors can request emergency record overrides.", 403);
        }

        const patient = await prisma.patient.findFirst({
            where: {
                user: {
                    email: payload.patientEmail
                }
            },
            include: { user: true }
        });
        if (!patient) {
            throw new AppError("Patient with the specified email address was not found in the HIE network.", 404);
        }

        // Set emergency expiration to exactly 24 hours from now (in compliance with Emergency Access Control Algorithm)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const result = await prisma.emergencyAccess.create({
            data: {
                patientId: patient.id,
                requestingDoctorId: doctor.id,
                reason: payload.reason,
                expiresAt,
                isUsed: true
            }
        });

        // Write High-Severity Audit Record
        await this.logAudit(
            doctor.userId,
            "EMERGENCY_ACCESS",
            "EmergencyAccess",
            result.id,
            {
                severity: "CRITICAL",
                doctorName: doctor.name,
                hospitalName: doctor.hospital.name,
                patientName: patient.name,
                reason: payload.reason,
                expiresAt
            }
        );

        // Notify the Patient immediately
        await this.sendNotification(
            patient.userId,
            "SYSTEM_ALERT",
            `⚠️ EMERGENCY OVERRIDE TRIGGERED on your medical record by Dr. ${doctor.name} at ${doctor.hospital.name}. Reason: "${payload.reason}". This action is audited.`
        );

        return {
            ...result,
            doctorName: doctor.name,
            hospitalName: doctor.hospital.name,
            patientName: patient.name
        };
    }

    async getActiveOverrides(userId: string, role: string) {
        if (role === "DOCTOR") {
            const doctor = await prisma.doctor.findFirst({ where: { userId } });
            if (!doctor) return [];

            return await prisma.emergencyAccess.findMany({
                where: {
                    requestingDoctorId: doctor.id,
                    expiresAt: { gt: new Date() }
                },
                include: {
                    patient: true,
                    requestingDoctor: { include: { hospital: true } }
                },
                orderBy: { grantedAt: "desc" }
            });
        }

        if (role === "HOSPITAL_ADMIN") {
            const adminUser = await prisma.user.findUnique({
                where: { id: userId },
                include: { tenant: true }
            });
            if (!adminUser || !adminUser.tenantId) return [];

            return await prisma.emergencyAccess.findMany({
                where: {
                    expiresAt: { gt: new Date() },
                    requestingDoctor: {
                        hospital: { tenantId: adminUser.tenantId }
                    }
                },
                include: {
                    patient: true,
                    requestingDoctor: { include: { hospital: true } }
                },
                orderBy: { grantedAt: "desc" }
            });
        }

        return [];
    }

    async getHistory(userId: string, role: string) {
        if (role === "DOCTOR") {
            const doctor = await prisma.doctor.findFirst({ where: { userId } });
            if (!doctor) return [];

            return await prisma.emergencyAccess.findMany({
                where: { requestingDoctorId: doctor.id },
                include: { patient: true },
                orderBy: { grantedAt: "desc" }
            });
        }

        if (role === "PATIENT") {
            const patient = await prisma.patient.findFirst({ where: { userId } });
            if (!patient) return [];

            return await prisma.emergencyAccess.findMany({
                where: { patientId: patient.id },
                include: { requestingDoctor: { include: { hospital: true } } },
                orderBy: { grantedAt: "desc" }
            });
        }

        if (role === "HOSPITAL_ADMIN") {
            const adminUser = await prisma.user.findUnique({
                where: { id: userId },
                include: { tenant: true }
            });
            if (!adminUser || !adminUser.tenantId) return [];

            // Return all overrides within their tenant/hospital
            return await prisma.emergencyAccess.findMany({
                where: {
                    requestingDoctor: {
                        hospital: { tenantId: adminUser.tenantId }
                    }
                },
                include: {
                    patient: true,
                    requestingDoctor: { include: { hospital: true } }
                },
                orderBy: { grantedAt: "desc" }
            });
        }

        return [];
    }
}
