import { Prisma } from "../generated/prisma";

import { PaginationParams } from "../utils/pagination";

export type CreateMedicalRecordPayload = {
    patientId: string;
    doctorId: string;
    diagnosis?: string | null;
    prescription?: string | null;
    notes?: string | null;
};

export type UpdateMedicalRecordPayload = {
    diagnosis?: string | null;
    prescription?: string | null;
    notes?: string | null;
};

export type MedicalRecordListParams = PaginationParams & {
    patientId?: string;
    doctorId?: string;
    includeDeleted?: boolean;
};

export type MedicalRecordListItem = Prisma.MedicalRecordGetPayload<{}>;
