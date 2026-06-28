import { request } from "./api";

export type EmergencyBypass = {
    id: string;
    patientId: string;
    requestingDoctorId: string;
    reason: string;
    grantedAt: string;
    expiresAt: string;
    isUsed: boolean;
    patient?: {
        name: string;
        dob: string;
    };
    requestingDoctor?: {
        name: string;
        hospital: {
            name: string;
        };
    };
};

export const emergencyApi = {
    override: (payload: { patientEmail: string; reason: string }) => {
        return request("/emergency/override", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    getActive: () => {
        return request("/emergency/active", {
            method: "GET"
        });
    },

    getHistory: () => {
        return request("/emergency/history", {
            method: "GET"
        });
    },

    getRecords: (accessId: string) => {
        return request(`/emergency/records/${accessId}`, {
            method: "GET"
        });
    }
};
