import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/appError";
import { MedicalRecordRepository } from "../repository/medicalRecord.repository";
import { decryptAsymmetric, decryptPacked } from "../utils/crypto.helper";

type AuthenticatedRequest = Request & {
    user?: { id: string; role: string };
};

function decryptRecord(record: any, privateKey: string) {
    if (!record.encryptedAesKey) return record;
    try {
        const aesKey = Buffer.from(decryptAsymmetric(record.encryptedAesKey, privateKey), "hex");
        return {
            ...record,
            diagnosis: record.diagnosis ? decryptPacked(record.diagnosis, aesKey) : record.diagnosis,
            prescription: record.prescription ? decryptPacked(record.prescription, aesKey) : record.prescription,
            notes: record.notes ? decryptPacked(record.notes, aesKey) : record.notes,
        };
    } catch {
        return record;
    }
}

export class RecordController {
    private repository = new MedicalRecordRepository();

    listRecords = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;
        if (!user) throw new AppError("Unauthorized", 401);

        const search = typeof req.query.search === "string" ? req.query.search : "";

        if (user.role === "PATIENT") {
            const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
            if (!patient) throw new AppError("Patient profile not found", 404);

            const where: any = { patientId: patient.id, deletedAt: null };
            if (search) {
                where.OR = [
                    { diagnosis: { contains: search, mode: "insensitive" } },
                    { doctor: { name: { contains: search, mode: "insensitive" } } },
                ];
            }

            const records = await prisma.medicalRecord.findMany({
                where,
                include: {
                    doctor: { select: { name: true, specialization: true, hospital: { select: { privateKey: true } } } },
                    files: true,
                },
                orderBy: { createdAt: "desc" },
            });

            const decrypted = records.map(r => {
                const privateKey = (r.doctor as any).hospital?.privateKey;
                const result = privateKey ? decryptRecord(r, privateKey) : r;
                const { doctor, ...rest } = result;
                return { ...rest, doctor: { name: doctor.name, specialization: doctor.specialization } };
            });

            return sendSuccess(res, "Records fetched", decrypted);
        }

        if (user.role === "DOCTOR") {
            const doctor = await prisma.doctor.findUnique({
                where: { userId: user.id },
                include: { hospital: { select: { privateKey: true } } }
            });
            if (!doctor) throw new AppError("Doctor profile not found", 404);

            const where: any = { doctorId: doctor.id, deletedAt: null };
            if (search) {
                where.OR = [
                    { patient: { name: { contains: search, mode: "insensitive" } } },
                    { diagnosis: { contains: search, mode: "insensitive" } },
                ];
            }

            const records = await prisma.medicalRecord.findMany({
                where,
                include: {
                    patient: { select: { name: true } },
                    doctor: { select: { name: true, specialization: true } },
                    files: true,
                },
                orderBy: { createdAt: "desc" },
            });

            const privateKey = doctor.hospital?.privateKey;
            const decrypted = privateKey ? records.map(r => decryptRecord(r, privateKey)) : records;

            return sendSuccess(res, "Records fetched", decrypted);
        }

        if (user.role === "RECEPTIONIST") {
            const receptionist = await prisma.receptionist.findUnique({
                where: { userId: user.id },
                include: { hospital: { select: { privateKey: true } } }
            });
            if (!receptionist) throw new AppError("Receptionist profile not found", 404);

            const where: any = { deletedAt: null, doctor: { hospitalId: receptionist.hospitalId } };
            if (search) {
                where.OR = [
                    { patient: { name: { contains: search, mode: "insensitive" } } },
                    { diagnosis: { contains: search, mode: "insensitive" } },
                ];
            }

            const records = await prisma.medicalRecord.findMany({
                where,
                include: {
                    patient: { select: { name: true } },
                    doctor: { select: { name: true, specialization: true } },
                    files: true,
                },
                orderBy: { createdAt: "desc" },
            });

            const privateKey = receptionist.hospital?.privateKey;
            const decrypted = privateKey ? records.map(r => decryptRecord(r, privateKey)) : records;

            return sendSuccess(res, "Records fetched", decrypted);
        }

        if (user.role === "HOSPITAL_ADMIN") {
            const adminUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { tenantId: true, tenant: { select: { hospital: { select: { privateKey: true } } } } }
            });
            if (!adminUser?.tenantId) return sendSuccess(res, "Records fetched", []);

            const where: any = {
                deletedAt: null,
                doctor: { hospital: { tenantId: adminUser.tenantId } }
            };
            if (search) {
                where.OR = [
                    { patient: { name: { contains: search, mode: "insensitive" } } },
                    { diagnosis: { contains: search, mode: "insensitive" } },
                ];
            }

            const records = await prisma.medicalRecord.findMany({
                where,
                include: {
                    patient: { select: { name: true } },
                    doctor: { select: { name: true, specialization: true } },
                    files: true,
                },
                orderBy: { createdAt: "desc" },
            });

            const privateKey = adminUser.tenant?.hospital?.privateKey;
            const decrypted = privateKey ? records.map(r => decryptRecord(r, privateKey)) : records;

            return sendSuccess(res, "Records fetched", decrypted);
        }

        const where: any = { deletedAt: null };
        if (search) {
            where.OR = [
                { patient: { name: { contains: search, mode: "insensitive" } } },
                { diagnosis: { contains: search, mode: "insensitive" } },
            ];
        }

        const records = await prisma.medicalRecord.findMany({
            where,
            include: {
                patient: { select: { name: true } },
                doctor: { select: { name: true, specialization: true } },
                files: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return sendSuccess(res, "Records fetched", records);
    });

    getRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;
        if (!user) throw new AppError("Unauthorized", 401);

        const id = req.params.id as string;

        const record = await prisma.medicalRecord.findFirst({
            where: { id, deletedAt: null },
            include: {
                patient: { select: { name: true } },
                doctor: { select: { name: true, specialization: true, hospital: { select: { privateKey: true } } } },
                files: true,
            },
        });

        if (!record) throw new AppError("Record not found", 404);

        // Ownership / visibility check
        if (user.role === "DOCTOR") {
            const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
            if (!doctor || record.doctorId !== doctor.id) throw new AppError("Access denied", 403);
        } else if (user.role === "PATIENT") {
            const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
            if (!patient || record.patientId !== patient.id) throw new AppError("Access denied", 403);
        } else if (user.role === "RECEPTIONIST") {
            const receptionist = await prisma.receptionist.findUnique({ where: { userId: user.id } });
            if (!receptionist) throw new AppError("Access denied", 403);
            const belongsToHospital = (record.doctor as any).hospital !== null;
            if (!belongsToHospital) throw new AppError("Access denied", 403);
        }

        const privateKey = (record.doctor as any).hospital?.privateKey;
        const { doctor, ...rest } = record as any;
        const decrypted = privateKey ? decryptRecord(rest, privateKey) : rest;

        return sendSuccess(res, "Record fetched", {
            ...decrypted,
            doctor: { name: doctor.name, specialization: doctor.specialization }
        });
    });

    createRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;
        if (!user || user.role !== "DOCTOR") {
            throw new AppError("Only doctors can create medical records", 403);
        }

        const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
        if (!doctor) throw new AppError("Doctor profile not found", 404);

        const { patientId, diagnosis, prescription, notes } = req.body;
        if (!patientId || !diagnosis) {
            throw new AppError("patientId and diagnosis are required", 400);
        }

        const patient = await prisma.patient.findFirst({ 
            where: { 
                OR: [
                    { id: patientId },
                    { userId: patientId }
                ] 
            } 
        });
        if (!patient) throw new AppError("Patient not found", 404);

        // Creates record with AES-256-GCM encryption via repository
        const newRecord = await this.repository.createMedicalRecord({
            patientId: patient.id,
            doctorId: doctor.id,
            diagnosis,
            prescription: prescription || null,
            notes: notes || null,
        });

        if (req.file) {
            const fileUrl = `/uploads/record-files/${req.file.filename}`;
            await prisma.recordFile.create({
                data: {
                    recordId: newRecord.id,
                    fileUrl,
                    fileType: req.file.mimetype,
                    fileName: req.file.originalname,
                },
            });
        }

        const record = await prisma.medicalRecord.findUnique({
            where: { id: newRecord.id },
            include: {
                patient: { select: { name: true } },
                doctor: { select: { name: true, specialization: true } },
                files: true,
            },
        });

        return sendSuccess(res, "Medical record created successfully", record, 201);
    });

    updateRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;
        if (!user || user.role !== "DOCTOR") throw new AppError("Only doctors can update medical records", 403);

        const id = req.params.id as string;
        const { diagnosis, prescription, notes } = req.body;

        const doctor = await prisma.doctor.findUnique({
            where: { userId: user.id },
            include: { hospital: { select: { privateKey: true } } }
        });
        if (!doctor) throw new AppError("Doctor profile not found", 404);

        const existing = await prisma.medicalRecord.findFirst({ where: { id, doctorId: doctor.id, deletedAt: null } });
        if (!existing) throw new AppError("Record not found or not owned by you", 404);

        // Re-encrypts all fields with a fresh AES key via repository
        await this.repository.updateMedicalRecord(id, {
            diagnosis,
            prescription: prescription || null,
            notes: notes || null,
        });

        if (req.file) {
            const fileUrl = `/uploads/record-files/${req.file.filename}`;
            await prisma.recordFile.create({
                data: {
                    recordId: id,
                    fileUrl,
                    fileType: req.file.mimetype,
                    fileName: req.file.originalname,
                },
            });
        }

        const updated = await prisma.medicalRecord.findUnique({
            where: { id },
            include: {
                patient: { select: { name: true } },
                doctor: { select: { name: true, specialization: true } },
                files: true,
            },
        });

        const privateKey = doctor.hospital?.privateKey;
        const updatedAny = updated as any;
        const { doctor: updatedDoctor, ...updatedRest } = updatedAny ?? {};
        const decrypted = privateKey && updated ? decryptRecord(updatedRest, privateKey) : updatedRest;

        return sendSuccess(res, "Medical record updated successfully", updatedDoctor
            ? { ...decrypted, doctor: { name: updatedDoctor.name, specialization: updatedDoctor.specialization } }
            : decrypted
        );
    });

    deleteRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;
        if (!user || user.role !== "DOCTOR") throw new AppError("Only doctors can delete medical records", 403);

        const id = req.params.id as string;
        const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
        if (!doctor) throw new AppError("Doctor profile not found", 404);

        const existing = await prisma.medicalRecord.findFirst({ where: { id, doctorId: doctor.id, deletedAt: null } });
        if (!existing) throw new AppError("Record not found or not owned by you", 404);

        await prisma.medicalRecord.update({ where: { id }, data: { deletedAt: new Date() } });

        return sendSuccess(res, "Medical record deleted successfully", null);
    });
}
