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
                return sendSuccess(res, "Records fetched", []);
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

        const record = await prisma.medicalRecord.create({
            data: {
                patientId,
                doctorId: doctor.id,
                diagnosis,
                prescription: prescription || null,
                notes: notes || null,
            },
            include: {
                patient: { select: { name: true } },
                doctor: { select: { name: true, specialization: true } },
                files: true,
            },
        });

        return sendSuccess(res, "Medical record created successfully", record, 201);
    });
}