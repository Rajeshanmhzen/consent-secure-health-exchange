import prisma from "../config/prisma";
import { AppError } from "../utils/appError";
import { AuditAction, NotificationType } from "../generated/prisma";

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
        const result = await prisma.$transaction(async (tx) => {
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

        if (request.status !== "PENDING") {
            throw new AppError("This request is no longer pending patient consent.", 400);
        }

        if (action === "REJECT") {
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
                `Patient ${patient.name} has rejected your record sharing request.`
            );

            return result;
        }

        // Approve Consent
        const result = await prisma.$transaction(async (tx) => {
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
        const result = await prisma.$transaction(async (tx) => {
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
                const sharedData = records.map(r => ({
                    requestId: req.id,
                    recordId: r.id
                }));
                await tx.sharedRecord.createMany({
                    data: sharedData,
                    skipDuplicates: true
                });
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
}
