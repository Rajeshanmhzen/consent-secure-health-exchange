import { request } from "./api";
import type { ApiResponse } from "../types/auth.types";

export type RecordFile = {
    id: string
    recordId: string
    fileUrl: string
    fileType: string | null
    fileName: string | null
    uploadedAt: string
}

export type MedicalRecord = {
    id: string
    patientId: string
    doctorId: string
    diagnosis: string | null
    prescription: string | null
    notes: string | null
    createdAt: string
    patient: { name: string }
    doctor: { name: string; specialization: string | null }
    files: RecordFile[]
}

const buildFormData = (payload: { patientId?: string; diagnosis: string; prescription?: string; notes?: string; recordFile?: File | null }) => {
    const formData = new FormData()
    if (payload.patientId) formData.append('patientId', payload.patientId)
    formData.append('diagnosis', payload.diagnosis)
    if (payload.prescription) formData.append('prescription', payload.prescription)
    if (payload.notes) formData.append('notes', payload.notes)
    if (payload.recordFile) formData.append('recordFile', payload.recordFile)
    return formData
}

export const recordApi = {
    list: (search?: string) => {
        const q = search ? `?search=${encodeURIComponent(search)}` : ''
        return request<ApiResponse<MedicalRecord[]>>(`/records/list${q}`)
    },
    get: (id: string) =>
        request<ApiResponse<MedicalRecord>>(`/records/${id}`),
    create: (payload: { patientId: string; diagnosis: string; prescription?: string; notes?: string; recordFile?: File | null }) =>
        request<ApiResponse<MedicalRecord>>('/records/create', {
            method: 'POST',
            body: buildFormData(payload),
            rawBody: true,
        }),
    update: (id: string, payload: { diagnosis: string; prescription?: string; notes?: string; recordFile?: File | null }) =>
        request<ApiResponse<MedicalRecord>>(`/records/${id}`, {
            method: 'PUT',
            body: buildFormData(payload),
            rawBody: true,
        }),
    delete: (id: string) =>
        request<ApiResponse<null>>(`/records/${id}`, { method: 'DELETE' }),
}