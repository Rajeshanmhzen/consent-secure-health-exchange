import { z } from "zod";

const optionalString = z.string().trim().min(1).optional();

export const superAdminIdParamSchema = z.object({
    id: z.string().trim().min(1)
});

export const createSuperAdminSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(6),
    fullName: z.string().trim().min(1),
    phone: z.string().trim().min(1).nullable().optional(),
    isActive: z.boolean().optional(),
    isVerified: z.boolean().optional()
});

export const updateSuperAdminSchema = z.object({
    email: z.string().trim().email().optional(),
    password: z.string().min(6).optional(),
    fullName: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).nullable().optional(),
    isActive: z.boolean().optional(),
    isVerified: z.boolean().optional()
});

export const listSuperAdminSchema = z.object({
    page: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().optional()
    ),
    limit: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().optional()
    ),
    search: optionalString,
    isActive: z.preprocess(
        (value) => {
            if (value === undefined) return undefined;
            if (value === "true") return true;
            if (value === "false") return false;
            return value;
        },
        z.boolean().optional()
    ),
    includeDeleted: z.preprocess(
        (value) => {
            if (value === undefined) return undefined;
            if (value === "true") return true;
            if (value === "false") return false;
            return value;
        },
        z.boolean().optional()
    ),
    deletedOnly: z.preprocess(
        (value) => {
            if (value === undefined) return undefined;
            if (value === "true") return true;
            if (value === "false") return false;
            return value;
        },
        z.boolean().optional()
    )
});
