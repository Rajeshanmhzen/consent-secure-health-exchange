import { Prisma } from "../generated/prisma";
import crypto from "crypto";
import prisma from "../config/prisma";
import { encryptPacked, encryptAsymmetric } from "../utils/crypto.helper";
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
        // Fetch Custodian doctor's hospital Public Key
        const doctor = await prisma.doctor.findUnique({
            where: { id: data.doctorId },
            include: { hospital: true }
        });

        if (!doctor || !doctor.hospital.publicKey) {
            throw new Error("Custodian doctor's hospital has no public keys registered in the network.");
        }

        // Generate a cryptographically secure random 32-byte AES key
        const aesKey = crypto.randomBytes(32);

        // Encrypt the fields symmetrically with independent IVs and tags
        const encryptedDiagnosis = data.diagnosis ? encryptPacked(data.diagnosis, aesKey) : null;
        const encryptedPrescription = data.prescription ? encryptPacked(data.prescription, aesKey) : null;
        const encryptedNotes = data.notes ? encryptPacked(data.notes, aesKey) : null;

        // Wrap the AES key using the hospital's Public RSA Key
        const encryptedAesKey = encryptAsymmetric(aesKey.toString("hex"), doctor.hospital.publicKey);

        return await prisma.medicalRecord.create({
            data: {
                patientId: data.patientId,
                doctorId: data.doctorId,
                diagnosis: encryptedDiagnosis,
                prescription: encryptedPrescription,
                notes: encryptedNotes,
                encryptedAesKey
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
        // Fetch the existing record to get the doctor's hospital Public Key
        const record = await prisma.medicalRecord.findUnique({
            where: { id: recordId },
            include: {
                doctor: {
                    include: { hospital: true }
                }
            }
        });

        if (!record || !record.doctor.hospital.publicKey) {
            throw new Error("Medical record or associated hospital public key not found.");
        }

        // Generate a new AES key for the updated values
        const aesKey = crypto.randomBytes(32);

        // Encrypt updated fields symmetrically
        const encryptedDiagnosis = data.diagnosis ? encryptPacked(data.diagnosis, aesKey) : null;
        const encryptedPrescription = data.prescription ? encryptPacked(data.prescription, aesKey) : null;
        const encryptedNotes = data.notes ? encryptPacked(data.notes, aesKey) : null;

        // Wrap the AES key using the hospital's Public RSA Key
        const encryptedAesKey = encryptAsymmetric(aesKey.toString("hex"), record.doctor.hospital.publicKey);

        return await prisma.medicalRecord.update({
            where: { id: recordId },
            data: {
                diagnosis: encryptedDiagnosis,
                prescription: encryptedPrescription,
                notes: encryptedNotes,
                encryptedAesKey
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
