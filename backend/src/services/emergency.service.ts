import prisma from "../config/prisma";
import { AppError } from "../utils/appError";
import { AuditAction, NotificationType } from "@prisma/client";
import { decryptAsymmetric, decryptPacked } from "../utils/crypto.helper";

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

    async getEmergencyRecords(userId: string, accessId: string) {
        const doctor = await prisma.doctor.findFirst({
            where: { userId },
            include: { hospital: true }
        });
        if (!doctor) throw new AppError("Only licensed clinicians can access emergency records.", 403);

        const access = await prisma.emergencyAccess.findUnique({
            where: { id: accessId },
            include: { patient: true }
        });
        if (!access) throw new AppError("Emergency access record not found.", 404);
        if (access.requestingDoctorId !== doctor.id) throw new AppError("Unauthorized. This emergency access was not granted to you.", 403);
        if (new Date() > access.expiresAt) throw new AppError("Emergency access has expired.", 403);

        if (!doctor.hospital.privateKey) throw new AppError("Requesting hospital has no private RSA key registered.", 500);
        const privateKey = doctor.hospital.privateKey;

        const records = await prisma.medicalRecord.findMany({
            where: { patientId: access.patientId, deletedAt: null },
            include: {
                doctor: { include: { hospital: true } },
                files: true
            }
        });

        const decryptedRecords = records.map(record => {
            let diagnosis = record.diagnosis;
            let prescription = record.prescription;
            let notes = record.notes;

            // Emergency access is a system-level override. 
            // The centralized HIE backend utilizes the custodian hospital's private key to decrypt the record for the emergency physician.
            if (record.encryptedAesKey) {
                const custodianPrivateKey = record.doctor.hospital.privateKey;
                
                if (custodianPrivateKey) {
                    try {
                        const plainAesKeyHex = decryptAsymmetric(record.encryptedAesKey, custodianPrivateKey);
                        const aesKey = Buffer.from(plainAesKeyHex, "hex");
                        if (record.diagnosis) diagnosis = decryptPacked(record.diagnosis, aesKey);
                        if (record.prescription) prescription = decryptPacked(record.prescription, aesKey);
                        if (record.notes) notes = decryptPacked(record.notes, aesKey);
                    } catch (err) {
                        console.error(`Failed to decrypt record ${record.id} under emergency access:`, err);
                        diagnosis = "[ENCRYPTED - DECRYPTION FAILED]";
                        prescription = "[ENCRYPTED - DECRYPTION FAILED]";
                        notes = "[ENCRYPTED - DECRYPTION FAILED]";
                    }
                } else {
                    diagnosis = "[ENCRYPTED - CUSTODIAN KEY UNAVAILABLE]";
                    prescription = "[ENCRYPTED - CUSTODIAN KEY UNAVAILABLE]";
                    notes = "[ENCRYPTED - CUSTODIAN KEY UNAVAILABLE]";
                }
            }

            return {
                id: record.id,
                patientId: record.patientId,
                patient: { name: access.patient.name },
                doctorId: record.doctorId,
                doctor: { name: record.doctor.name, specialization: record.doctor.specialization ?? "Clinical Medicine" },
                hospitalName: record.doctor.hospital.name,
                diagnosis,
                prescription,
                notes,
                createdAt: record.createdAt,
                files: record.files
            };
        });

        await this.logAudit(userId, "VIEW_RECORD", "EmergencyAccess", accessId, {
            action: "EMERGENCY_RECORD_VIEW",
            doctorName: doctor.name,
            hospitalName: doctor.hospital.name,
            patientName: access.patient.name,
            recordsViewedCount: decryptedRecords.length
        });

        return decryptedRecords;
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
