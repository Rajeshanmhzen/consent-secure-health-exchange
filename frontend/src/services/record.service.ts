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

export const recordApi = {
    list: (search?: string) => {
        const q = search ? `?search=${encodeURIComponent(search)}` : ''
        return request<ApiResponse<MedicalRecord[]>>(`/records/list${q}`)
    },
    create: (payload: { patientId: string; diagnosis: string; prescription?: string; notes?: string; recordFile?: File | null }) => {
        const formData = new FormData()
        formData.append('patientId', payload.patientId)
        formData.append('diagnosis', payload.diagnosis)
        if (payload.prescription) formData.append('prescription', payload.prescription)
        if (payload.notes) formData.append('notes', payload.notes)
        if (payload.recordFile) formData.append('recordFile', payload.recordFile)
        // Use raw fetch via the base request, but override Content-Type to be auto-set by browser
        return request<ApiResponse<MedicalRecord>>('/records/create', {
            method: 'POST',
            body: formData,
            rawBody: true,
        })
    },
}