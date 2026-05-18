import { z } from "zod";
import { INQUIRY_STATUSES, INQUIRY_TYPES } from "../types/inquiry.types";

const safeText = (min: number, max: number, label: string) =>
    z.string()
        .trim()
        .min(min, `${label} is required`)
        .max(max, `${label} must be ${max} characters or less`)
        .regex(/^[\p{L}\p{N}\s.,'’()&/@:+-]+$/u, `${label} contains unsupported characters`);

const optionalSafeText = (max: number, label: string) =>
    z.string()
        .trim()
        .max(max, `${label} must be ${max} characters or less`)
        .regex(/^[\p{L}\p{N}\s.,'’()&/@:+-]*$/u, `${label} contains unsupported characters`)
        .optional()
        .transform((value) => value || undefined);

export const inquiryIdParamSchema = z.object({
    id: z.string().trim().uuid()
});

export const createInquirySchema = z.object({
    firstName: safeText(2, 60, "First name"),
    lastName: safeText(2, 60, "Last name"),
    workEmail: z.string().trim().email("Invalid work email").max(120).toLowerCase(),
    phoneNumber: z.string()
        .trim()
        .max(30)
        .regex(/^[0-9+\-() ]*$/, "Phone number contains unsupported characters")
        .optional()
        .transform((value) => value || undefined),
    organization: optionalSafeText(120, "Organization"),
    inquiryType: z.enum(INQUIRY_TYPES),
    message: safeText(10, 2000, "Message")
});

export const updateInquirySchema = z.object({
    status: z.enum(INQUIRY_STATUSES)
});

export const listInquirySchema = z.object({
    page: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().optional()
    ),
    limit: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().max(100).optional()
    ),
    search: z.string().trim().min(1).max(120).optional(),
    status: z.enum(INQUIRY_STATUSES).optional()
});

export const inquiryStatsSchema = z.object({
    search: z.string().trim().min(1).max(120).optional()
});
