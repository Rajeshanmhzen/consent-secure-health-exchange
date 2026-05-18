import { MedicalRecordRepository } from "../repository/medicalRecord.repository";
import {
    CreateMedicalRecordPayload,
    MedicalRecordListParams,
    UpdateMedicalRecordPayload
} from "../types/medicalRecord.types";

export class MedicalRecordService {
    private repository = new MedicalRecordRepository();

    async createMedicalRecord(data: CreateMedicalRecordPayload) {
        return await this.repository.createMedicalRecord(data);
    }

    async detailMedicalRecord(recordId: string) {
        return await this.repository.getMedicalRecordById(recordId);
    }

    async listMedicalRecords(params: MedicalRecordListParams) {
        return await this.repository.listMedicalRecords(params);
    }

    async updateMedicalRecord(recordId: string, data: UpdateMedicalRecordPayload) {
        return await this.repository.updateMedicalRecord(recordId, data);
    }

    async softDeleteMedicalRecord(recordId: string) {
        return await this.repository.softDeleteMedicalRecord(recordId);
    }

    async hardDeleteMedicalRecord(recordId: string) {
        return await this.repository.hardDeleteMedicalRecord(recordId);
    }
}
