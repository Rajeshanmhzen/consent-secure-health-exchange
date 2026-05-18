import { Inquiry } from "../generated/prisma";

export const INQUIRY_STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED"] as const;
export const INQUIRY_TYPES = ["Sales / Demo", "Implementation Support", "Partnership", "General Question"] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export type CreateInquiryPayload = {
    firstName: string;
    lastName: string;
    workEmail: string;
    phoneNumber?: string;
    organization?: string;
    inquiryType: InquiryType;
    message: string;
};

export type UpdateInquiryPayload = {
    status: InquiryStatus;
};

export type InquiryListParams = {
    page?: number;
    limit?: number;
    search?: string;
    status?: InquiryStatus;
};

export type InquiryEntity = Inquiry;
