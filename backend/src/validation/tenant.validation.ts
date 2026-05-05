import { z } from "zod";

const optionalString = z.string().trim().min(1).optional();

export const tenantIdParamSchema = z.object({
    id: z.string().trim().min(1)
});

export const createTenantSchema = z.object({
    name: z.string().trim().min(1),
    type: z.enum(["HOSPITAL"]),
    isActive: z.boolean().optional()
});

export const updateTenantSchema = z.object({
    name: z.string().trim().min(1).optional(),
    type: z.enum(["HOSPITAL"]).optional(),
    isActive: z.boolean().optional()
});

export const listTenantSchema = z.object({
    page: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().optional()
    ),
    limit: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().optional()
    ),
    search: optionalString,
    type: z.enum(["HOSPITAL"]).optional(),
    isActive: z.preprocess(
        (value) => {
            if (value === undefined) return undefined;
            if (value === "true") return true;
            if (value === "false") return false;
            return value;
        },
        z.boolean().optional()
    )
});

export const createHospitalTenantSchema = z.object({
    tenantName: z.string().trim().min(1),
    hospitalName: z.string().trim().min(1),
    hospitalEmail: z.string().trim().email().nullable().optional(),
    adminEmail: z.string().trim().email(),
    adminPassword: z.string().min(6),
    adminPhone: z.string().trim().min(1).nullable().optional(),
    isTenantActive: z.boolean().optional(),
    isAdminActive: z.boolean().optional(),
    isAdminVerified: z.boolean().optional()
});
