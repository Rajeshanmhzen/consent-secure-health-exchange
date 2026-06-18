import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/appError";

type AuthenticatedRequest = Request & {
    user?: { id: string; role: string };
};

export class RecordController {
    listRecords = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;
        if (!user) throw new AppError("Unauthorized", 401);

        const search = (req.query.search as string) || "";

        if (user.role === "PATIENT") {
            const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
            if (!patient) {
                throw new AppError("Patient profile not found", 404);
            }

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
                    doctor: { select: { name: true, specialization: true } },
                    files: true,
                },
                orderBy: { createdAt: "desc" },
            });

            return sendSuccess(res, "Records fetched", records);
        }

        if (user.role === "DOCTOR") {
            const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
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
                    files: true,
                },
                orderBy: { createdAt: "desc" },
            });

            return sendSuccess(res, "Records fetched", records);
        }

        if (user.role === "RECEPTIONIST") {
            const receptionist = await prisma.receptionist.findUnique({ where: { userId: user.id } });
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

            return sendSuccess(res, "Records fetched", records);
        }

        // HOSPITAL_ADMIN: scope to records from doctors in their hospital
        if (user.role === "HOSPITAL_ADMIN") {
            const adminUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { tenantId: true }
            });
            if (!adminUser?.tenantId) {
                return sendSuccess(res, "Records fetched", []);
            }

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
            return sendSuccess(res, "Records fetched", records);
        }

        // Fallback (SUPER_ADMIN, etc.) - all records
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

        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) throw new AppError("Patient not found", 404);

        const record = await prisma.$transaction(async (tx) => {
            const newRecord = await tx.medicalRecord.create({
                data: {
                    patientId,
                    doctorId: doctor.id,
                    diagnosis,
                    prescription: prescription || null,
                    notes: notes || null,
                },
            });

            // If a file was uploaded, create a RecordFile entry
            if (req.file) {
                const fileUrl = `/uploads/record-files/${req.file.filename}`;
                await tx.recordFile.create({
                    data: {
                        recordId: newRecord.id,
                        fileUrl,
                        fileType: req.file.mimetype,
                        fileName: req.file.originalname,
                    },
                });
            }

            return await tx.medicalRecord.findUnique({
                where: { id: newRecord.id },
                include: {
                    patient: { select: { name: true } },
                    doctor: { select: { name: true, specialization: true } },
                    files: true,
                },
            });
        });

        return sendSuccess(res, "Medical record created successfully", record, 201);
    });
}
