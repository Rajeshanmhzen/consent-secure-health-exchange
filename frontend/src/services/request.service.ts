import { request } from "./api";

export type HieRequest = {
    id: string;
    patientId: string;
    requestingDoctorId: string;
    targetDoctorId: string;
    reason: string | null;
    status: "PENDING" | "PATIENT_APPROVED" | "APPROVED" | "REJECTED";
    createdAt: string;
    patient: {
        id: string;
        name: string;
        dob: string;
    };
    requestingDoctor: {
        id: string;
        name: string;
        hospital: {
            id: string;
            name: string;
        };
    };
    targetDoctor: {
        id: string;
        name: string;
        hospital: {
            id: string;
            name: string;
        };
    };
};

export const requestApi = {
    create: (payload: { patientId: string; targetDoctorId: string; reason: string }) => {
        return request("/requests/create", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    patientConsent: (payload: { requestId: string; action: "APPROVE" | "REJECT" }) => {
        return request("/requests/patient-consent", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    sendConsentOtp: (requestId: string) => {
        return request("/requests/consent/send-otp", {
            method: "POST",
            body: JSON.stringify({ requestId })
        });
    },

    verifyConsentOtp: (requestId: string, otpCode: string) => {
        return request("/requests/consent/verify-otp", {
            method: "POST",
            body: JSON.stringify({ requestId, otpCode })
        });
    },

    hospitalConsent: (payload: { requestId: string; action: "APPROVE" | "REJECT" }) => {
        return request("/requests/hospital-consent", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    list: () => {
        return request("/requests/list", {
            method: "GET"
        });
    },

    listAllPatients: (hospitalId?: string) => {
        const q = hospitalId ? `?hospitalId=${encodeURIComponent(hospitalId)}` : ''
        return request(`/requests/all-patients${q}`, {
            method: "GET"
        });
    },

    listAllDoctors: (hospitalId?: string) => {
        const q = hospitalId ? `?hospitalId=${encodeURIComponent(hospitalId)}` : ''
        return request(`/requests/all-doctors${q}`, {
            method: "GET"
        });
    },

    listAllHospitals: () => {
        return request("/requests/all-hospitals", {
            method: "GET"
        });
    },

    getSharedRecords: (requestId: string) => {
        return request(`/requests/shared-records/${requestId}`, {
            method: "GET"
        });
    }
};
