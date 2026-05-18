import { Prisma } from "../generated/prisma";

import prisma from "../config/prisma";
import {
    buildPaginationResult,
    normalizePagination,
    PaginationResult
} from "../utils/pagination";
import {
    CreateMedicalRecordPayload,
    MedicalRecordListItem,
    MedicalRecordListParams,
    UpdateMedicalRecordPayload
} from "../types/medicalRecord.types";

export class MedicalRecordRepository {
    async createMedicalRecord(data: CreateMedicalRecordPayload) {
        return await prisma.medicalRecord.create({
            data: {
                patientId: data.patientId,
                doctorId: data.doctorId,
                diagnosis: data.diagnosis ?? null,
                prescription: data.prescription ?? null,
                notes: data.notes ?? null
            }
        });
    }

    async getMedicalRecordById(recordId: string, includeDeleted = false) {
        return await prisma.medicalRecord.findFirst({
            where: {
                id: recordId,
                ...(includeDeleted ? {} : { deletedAt: null })
            }
        });
    }

    async listMedicalRecords(
        params: MedicalRecordListParams
    ): Promise<PaginationResult<MedicalRecordListItem>> {
        const { page, limit, skip, take } = normalizePagination(params);
        const where: Prisma.MedicalRecordWhereInput = {
            ...(params.patientId ? { patientId: params.patientId } : {}),
            ...(params.doctorId ? { doctorId: params.doctorId } : {}),
            ...(params.includeDeleted ? {} : { deletedAt: null })
        };

        const [total, data] = (await prisma.$transaction([
            prisma.medicalRecord.count({ where }),
            prisma.medicalRecord.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" }
            })
        ])) as [number, MedicalRecordListItem[]];

        return buildPaginationResult(data, total, page, limit);
    }

    async updateMedicalRecord(recordId: string, data: UpdateMedicalRecordPayload) {
        return await prisma.medicalRecord.update({
            where: { id: recordId },
            data: {
                diagnosis: data.diagnosis ?? null,
                prescription: data.prescription ?? null,
                notes: data.notes ?? null
            }
        });
    }

    async softDeleteMedicalRecord(recordId: string) {
        return await prisma.medicalRecord.update({
            where: { id: recordId },
            data: {
                deletedAt: new Date()
            }
        });
    }

    async hardDeleteMedicalRecord(recordId: string) {
        return await prisma.$transaction(async (tx) => {
            await tx.recordFile.deleteMany({ where: { recordId } });
            await tx.sharedRecord.deleteMany({ where: { recordId } });
            return await tx.medicalRecord.delete({ where: { id: recordId } });
        });
    }
}
