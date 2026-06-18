import prisma from "../config/prisma";
import { AppError } from "../utils/appError";
import { AuditAction, NotificationType, Prisma } from "@prisma/client";
import { decryptAsymmetric, encryptAsymmetric, decryptPacked } from "../utils/crypto.helper";
import crypto from "crypto";
import { sendConsentOtpEmail } from "../utils/email";

export class RequestService {
    // Helper to log audit events easily
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

    // Helper to write in-app notifications
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

    async listAllHospitals() {
        const hospitals = await prisma.hospital.findMany({
            where: {
                tenant: {
                    isActive: true,
                    deletedAt: null
                }
            },
            select: { id: true, name: true },
            orderBy: { name: "asc" }
        });
        return hospitals;
    }

    async listAllDoctors(excludeUserId: string, hospitalId?: string) {
        const doctors = await prisma.doctor.findMany({
            where: {
                user: {
                    id: { not: excludeUserId },
                    deletedAt: null,
                    isActive: true
                },
                ...(hospitalId ? { hospitalId } : {})
            },
            select: {
                id: true,
                name: true,
                specialization: true,
                hospitalId: true,
                hospital: { select: { name: true } }
            },
            orderBy: { name: "asc" }
        });
        return doctors;
    }

    async listAllPatients(hospitalId?: string) {
        const patients = await prisma.patient.findMany({
            where: {
                user: {
                    deletedAt: null,
                    isActive: true,
                    ...(hospitalId ? { tenant: { hospital: { id: hospitalId } } } : {})
                }
            },
            select: {
                id: true,
                name: true,
                user: {
                    select: {
                        tenant: {
                            select: {
                                hospital: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { name: "asc" }
        });
        return patients.map(p => ({
            id: p.id,
            name: p.name,
            hospital: p.user?.tenant?.hospital ? { name: p.user.tenant.hospital.name } : null
        }));
    }

    async createRequest(doctorId: string, payload: { patientId: string; targetDoctorId: string; reason: string }) {
        const requestingDoctor = await prisma.doctor.findFirst({
            where: { userId: doctorId },
            include: { hospital: true }
        });
        if (!requestingDoctor) {
            throw new AppError("Requesting doctor not found in clinical database.", 404);
        }

        const patient = await prisma.patient.findUnique({
            where: { id: payload.patientId },
            include: { user: true }
        });
        if (!patient) {
            throw new AppError("Patient not found in clinical database.", 404);
        }

        const targetDoctor = await prisma.doctor.findUnique({
            where: { id: payload.targetDoctorId },
            include: { hospital: true }
        });
        if (!targetDoctor) {
            throw new AppError("Target/Custodian doctor not found.", 404);
        }
        // Create transaction: DataRequest + Consent
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const req = await tx.dataRequest.create({
                data: {
                    patientId: payload.patientId,
                    requestingDoctorId: requestingDoctor.id,
                    targetDoctorId: payload.targetDoctorId,
                    reason: payload.reason,
                    status: "PENDING"
                }
            });

            await tx.consent.create({
                data: {
                    requestId: req.id,
                    patientApproval: false,
                    targetDoctorApproval: false
                }
            });

            return req;
        });

        // Generate Audit Record
        await this.logAudit(
            requestingDoctor.userId,
            "CREATE_REQUEST",
            "DataRequest",
            result.id,
            {
                patientId: payload.patientId,
                patientName: patient.name,
                requestingDoctor: requestingDoctor.name,
                requestingHospital: requestingDoctor.hospital.name,
                targetDoctor: targetDoctor.name,
                targetHospital: targetDoctor.hospital.name,
                reason: payload.reason
            }
        );

        // Notify the Patient
        await this.sendNotification(
            patient.userId,
            "DATA_REQUEST",
            `Dr. ${requestingDoctor.name} from ${requestingDoctor.hospital.name} has requested access to your medical records. Please review and manage consent.`
        );

        return result;
    }

    async sendConsentOtp(userId: string, requestId: string) {
        const patient = await prisma.patient.findFirst({
            where: { userId },
            include: { user: true }
        });
        if (!patient) {
            throw new AppError("Only the patient can authorize consent.", 403);
        }

        const request = await prisma.dataRequest.findUnique({ where: { id: requestId } });
        if (!request) {
            throw new AppError("Data request not found.", 404);
        }
        if (request.patientId !== patient.id) {
            throw new AppError("You do not own this request.", 403);
        }
        if (request.status !== "PENDING") {
            throw new AppError("This request is no longer pending.", 400);
        }

        const code = crypto.randomInt(100000, 1000000).toString();
        const codeHash = crypto.createHash("sha256").update(code).digest("hex");

        await prisma.oTP.deleteMany({
            where: { userId, purpose: "CONSENT_APPROVAL" }
        });

        await prisma.oTP.create({
            data: {
                userId,
                codeHash,
                purpose: "CONSENT_APPROVAL",
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            }
        });

        // Fire-and-forget: do not await so the response is never blocked by SMTP
        sendConsentOtpEmail(patient.user.email, code).catch(err => {
            console.error("[OTP EMAIL] Failed to send consent OTP email:", err?.message ?? err);
        });

        return { sent: true };
    }

    async verifyConsentOtp(userId: string, requestId: string, otpCode: string) {
        const patient = await prisma.patient.findFirst({
            where: { userId },
            include: { user: true }
        });
        if (!patient) {
            throw new AppError("Only the patient can authorize consent.", 403);
        }

        const codeHash = crypto.createHash("sha256").update(otpCode).digest("hex");
        const otp = await prisma.oTP.findFirst({
            where: {
                userId,
                codeHash,
                purpose: "CONSENT_APPROVAL",
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });

        if (!otp) {
            throw new AppError("Invalid or expired verification code.", 400);
        }

        await prisma.oTP.update({ where: { id: otp.id }, data: { isUsed: true } });

        const result = await this.processPatientConsent(userId, requestId, "APPROVE");

        return result;
    }

    async processPatientConsent(userId: string, requestId: string, action: "APPROVE" | "REJECT") {
        const patient = await prisma.patient.findFirst({
            where: { userId },
            include: { user: true }
        });
        if (!patient) {
            throw new AppError("Only the patient can manage their personal consent.", 403);
        }

        const request = await prisma.dataRequest.findUnique({
            where: { id: requestId },
            include: {
                requestingDoctor: { include: { user: true, hospital: true } },
                targetDoctor: { include: { user: true, hospital: true } }
            }
        });
        if (!request) {
            throw new AppError("Data request not found.", 404);
        }

        if (request.patientId !== patient.id) {
            throw new AppError("Unauthorized. You do not own this request record.", 403);
        }

        if (action === "REJECT") {
            if (request.status !== "PENDING" && request.status !== "PATIENT_APPROVED") {
                throw new AppError("Cannot reject or revoke this request at its current stage.", 400);
            }

            const result = await prisma.dataRequest.update({
                where: { id: requestId },
                data: { status: "REJECTED" }
            });

            await this.logAudit(userId, "APPROVE_CONSENT", "DataRequest", requestId, {
                action: "PATIENT_REJECTED",
                patientName: patient.name
            });

            await this.sendNotification(
                request.requestingDoctor.userId,
                "CONSENT_UPDATE",
                `Patient ${patient.name} has rejected or revoked your record sharing request.`
            );

            return result;
        }

        if (request.status !== "PENDING") {
            throw new AppError("This request is no longer pending patient consent.", 400);
        }

        // Approve Consent
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await tx.consent.update({
                where: { requestId },
                data: {
                    patientApproval: true,
                    patientApprovedAt: new Date()
                }
            });

            return await tx.dataRequest.update({
                where: { id: requestId },
                data: { status: "PATIENT_APPROVED" }
            });
        });

        await this.logAudit(userId, "APPROVE_CONSENT", "DataRequest", requestId, {
            action: "PATIENT_APPROVED",
            patientName: patient.name
        });

        // Notify Custodian target doctor
        await this.sendNotification(
            request.targetDoctor.userId,
            "DATA_REQUEST",
            `Patient ${patient.name} has authorized data access. Please review and authorize cross-hospital release.`
        );

        return result;
    }

    async processHospitalConsent(userId: string, requestId: string, action: "APPROVE" | "REJECT") {
        const doctor = await prisma.doctor.findFirst({
            where: { userId },
            include: { hospital: true }
        });
        if (!doctor) {
            throw new AppError("Only clinical staff can authorize record release.", 403);
        }

        const request = await prisma.dataRequest.findUnique({
            where: { id: requestId },
            include: {
                patient: { include: { user: true } },
                requestingDoctor: { include: { user: true, hospital: true } }
            }
        });
        if (!request) {
            throw new AppError("Data request not found.", 404);
        }

        if (request.targetDoctorId !== doctor.id) {
            throw new AppError("Unauthorized. You are not the target custodian for this request.", 403);
        }

        if (request.status !== "PATIENT_APPROVED") {
            throw new AppError("This request requires patient consent before hospital custodian approval.", 400);
        }

        if (action === "REJECT") {
            const result = await prisma.dataRequest.update({
                where: { id: requestId },
                data: { status: "REJECTED" }
            });

            await this.logAudit(userId, "APPROVE_CONSENT", "DataRequest", requestId, {
                action: "HOSPITAL_REJECTED",
                doctorName: doctor.name,
                hospitalName: doctor.hospital.name
            });

            await this.sendNotification(
                request.requestingDoctor.userId,
                "CONSENT_UPDATE",
                `Dr. ${doctor.name} has rejected your clinical record sharing request.`
            );

            return result;
        }

        // Approve Consent: Complete state transition to APPROVED & create SharedRecord references
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await tx.consent.update({
                where: { requestId },
                data: {
                    targetDoctorApproval: true,
                    targetDoctorApprovedAt: new Date()
                }
            });

            const req = await tx.dataRequest.update({
                where: { id: requestId },
                data: { status: "APPROVED" }
            });

            // Fetch the requesting doctor's hospital Public Key (recipient)
            const requestingDoc = await tx.doctor.findUnique({
                where: { id: request.requestingDoctorId },
                include: { hospital: true }
            });
            if (!requestingDoc || !requestingDoc.hospital.publicKey) {
                throw new AppError("Requesting hospital has no registered public RSA keys.", 400);
            }
            const recipientPublicKey = requestingDoc.hospital.publicKey;

            // Fetch the custodian hospital's Private Key (holder)
            const custodianDoc = await tx.doctor.findUnique({
                where: { id: request.targetDoctorId },
                include: { hospital: true }
            });
            if (!custodianDoc || !custodianDoc.hospital.privateKey) {
                throw new AppError("Custodian hospital has no registered private RSA keys.", 400);
            }
            const custodianPrivateKey = custodianDoc.hospital.privateKey;

            // Find all active records of the patient created under the same hospital/custodian
            const records = await tx.medicalRecord.findMany({
                where: {
                    patientId: request.patientId,
                    doctor: {
                        hospitalId: doctor.hospitalId
                    },
                    deletedAt: null
                }
            });

            if (records.length > 0) {
                for (const r of records) {
                    let sharedAesKey: string | null = null;
                    if (r.encryptedAesKey) {
                        try {
                            // Decrypt symmetric AES key using custodian's Private RSA Key
                            const plainAesKey = decryptAsymmetric(r.encryptedAesKey, custodianPrivateKey);
                            // Encrypt symmetric AES key using recipient's Public RSA Key
                            sharedAesKey = encryptAsymmetric(plainAesKey, recipientPublicKey);
                        } catch (err) {
                            console.error(`Failed to re-wrap key for record ${r.id}:`, err);
                        }
                    }

                    await tx.sharedRecord.create({
                        data: {
                            requestId: req.id,
                            recordId: r.id,
                            encryptedAesKey: sharedAesKey
                        }
                    });
                }
            }

            return req;
        });

        // Log double-sided successful audit trail
        await this.logAudit(userId, "APPROVE_CONSENT", "DataRequest", requestId, {
            action: "HOSPITAL_APPROVED",
            doctorName: doctor.name,
            hospitalName: doctor.hospital.name,
            patientName: request.patient.name,
            requestingDoctor: request.requestingDoctor.name,
            requestingHospital: request.requestingDoctor.hospital.name
        });

        // Notify Requesting doctor and Patient
        await this.sendNotification(
            request.requestingDoctor.userId,
            "CONSENT_UPDATE",
            `Dual consent successfully achieved! You now have secure access to Patient ${request.patient.name}'s records.`
        );

        await this.sendNotification(
            request.patient.userId,
            "CONSENT_UPDATE",
            `Records have been securely exchanged between Princeton-Plainsboro and St. Sebastian Clinic under your authorization.`
        );

        return result;
    }

    async listRequests(userId: string, role: string) {
        if (role === "PATIENT") {
            const patient = await prisma.patient.findFirst({ where: { userId } });
            if (!patient) return [];

            return await prisma.dataRequest.findMany({
                where: { patientId: patient.id },
                include: {
                    requestingDoctor: { include: { hospital: true } },
                    targetDoctor: { include: { hospital: true } },
                    patient: true
                },
                orderBy: { createdAt: "desc" }
            });
        }

        if (role === "DOCTOR") {
            const doctor = await prisma.doctor.findFirst({ where: { userId } });
            if (!doctor) return [];

            return await prisma.dataRequest.findMany({
                where: {
                    OR: [
                        { requestingDoctorId: doctor.id },
                        { targetDoctorId: doctor.id }
                    ]
                },
                include: {
                    requestingDoctor: { include: { hospital: true } },
                    targetDoctor: { include: { hospital: true } },
                    patient: true
                },
                orderBy: { createdAt: "desc" }
            });
        }

        if (role === "HOSPITAL_ADMIN") {
            const adminUser = await prisma.user.findUnique({
                where: { id: userId },
                include: { tenant: true }
            });
            if (!adminUser || !adminUser.tenantId) return [];

            // Return double-sided audit-ready requests where hospital is either the requesting or holding side
            return await prisma.dataRequest.findMany({
                where: {
                    OR: [
                        { requestingDoctor: { hospital: { tenantId: adminUser.tenantId } } },
                        { targetDoctor: { hospital: { tenantId: adminUser.tenantId } } }
                    ]
                },
                include: {
                    requestingDoctor: { include: { hospital: true } },
                    targetDoctor: { include: { hospital: true } },
                    patient: true
                },
                orderBy: { createdAt: "desc" }
            });
        }

        // Super Admin sees everything
        if (role === "SUPER_ADMIN") {
            return await prisma.dataRequest.findMany({
                include: {
                    requestingDoctor: { include: { hospital: true } },
                    targetDoctor: { include: { hospital: true } },
                    patient: true
                },
                orderBy: { createdAt: "desc" }
            });
        }

        return [];
    }

    async getSharedRecords(userId: string, requestId: string) {
        // Fetch the requesting doctor
        const doctor = await prisma.doctor.findFirst({
            where: { userId },
            include: { hospital: true }
        });
        if (!doctor) {
            throw new AppError("Only licensed clinicians are authorized to access shared records.", 403);
        }

        // Fetch the request
        const request = await prisma.dataRequest.findUnique({
            where: { id: requestId },
            include: {
                patient: true,
                requestingDoctor: { include: { hospital: true } }
            }
        });

        if (!request) {
            throw new AppError("Shared request not found.", 404);
        }

        // Access check: Ensure the requesting doctor is either the recipient doctor or emergency authorized
        if (request.status !== "APPROVED" && request.requestingDoctorId !== doctor.id) {
            throw new AppError("Access to this dossier is restricted. Awaiting patient consent approval.", 403);
        }

        // Fetch all SharedRecord mappings for this request, along with the actual MedicalRecord
        const sharedRecords = await prisma.sharedRecord.findMany({
            where: { requestId },
            include: {
                record: {
                    include: {
                        doctor: {
                            include: { hospital: true }
                        }
                    }
                }
            }
        });

        // Ensure the recipient hospital private key is present to decrypt the record keys
        if (!doctor.hospital.privateKey) {
            throw new AppError("Recipient hospital private key not set. Cryptographic verification failed.", 500);
        }

        const recipientPrivateKey = doctor.hospital.privateKey;

        // Decrypt the records!
        const decryptedRecords = sharedRecords.map((sr: any) => {
            const record = sr.record;
            let diagnosis = record.diagnosis;
            let prescription = record.prescription;
            let notes = record.notes;

            // Decrypt symmetric AES key using recipient's Private RSA Key
            if (sr.encryptedAesKey) {
                try {
                    const plainAesKeyHex = decryptAsymmetric(sr.encryptedAesKey, recipientPrivateKey);
                    const aesKey = Buffer.from(plainAesKeyHex, "hex");

                    if (record.diagnosis) diagnosis = decryptPacked(record.diagnosis, aesKey);
                    if (record.prescription) prescription = decryptPacked(record.prescription, aesKey);
                    if (record.notes) notes = decryptPacked(record.notes, aesKey);
                } catch (err) {
                    console.error(`Failed to decrypt record ${record.id}:`, err);
                    diagnosis = "[ENCRYPTED - CRYPTO VERIFICATION FAILED]";
                    prescription = "[ENCRYPTED - CRYPTO VERIFICATION FAILED]";
                    notes = "[ENCRYPTED - CRYPTO VERIFICATION FAILED]";
                }
            }

            return {
                id: record.id,
                patientId: record.patientId,
                patientName: request.patient.name,
                doctorId: record.doctorId,
                doctorName: record.doctor.name,
                specialty: record.doctor.specialization ?? "Clinical Medicine",
                diagnosis,
                prescription,
                notes,
                createdAt: record.createdAt,
                files: []
            };
        });

        // Write audit log entry for viewing these shared files (immutability)
        await this.logAudit(userId, "VIEW_RECORD", "DataRequest", requestId, {
            action: "VIEW_SHARED_DOSSIER",
            doctorName: doctor.name,
            hospitalName: doctor.hospital.name,
            patientName: request.patient.name,
            recordsViewedCount: decryptedRecords.length
        });

        return decryptedRecords;
    }
}
