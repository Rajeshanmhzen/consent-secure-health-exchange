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

const roleSchema = z.preprocess(
    (value) => {
        if (typeof value !== "string") return value;
        const upper = value.toUpperCase();
        return upper === "ADMIN" ? "HOSPITAL_ADMIN" : upper;
    },
    z.enum(["DOCTOR", "PATIENT", "RECEPTIONIST", "HOSPITAL_ADMIN"])
);

export const createTenantUserSchema = z
    .object({
        tenantId: z.string().trim().min(1),
        hospitalId: z.string().trim().min(1).nullable().optional(),
        email: z.string().trim().email(),
        password: z.string().min(6),
        role: roleSchema,
        phone: z.string().trim().min(1).nullable().optional(),
        isActive: z.boolean().optional(),
        isVerified: z.boolean().optional(),

        name: z.string().trim().min(1).optional(),
        specialization: z.string().trim().min(1).nullable().optional(),
        dob: z.preprocess(
            (value) => (value ? new Date(String(value)) : value),
            z.date().nullable().optional()
        ),
        gender: z.string().trim().min(1).nullable().optional(),
        bloodGroup: z.string().trim().min(1).nullable().optional(),
        allergies: z.string().trim().min(1).nullable().optional()
    })
    .superRefine((data, ctx) => {
        if (data.role === "DOCTOR") {
            if (!data.hospitalId) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "hospitalId is required for doctor",
                    path: ["hospitalId"]
                });
            }
            if (!data.name) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "name is required for doctor",
                    path: ["name"]
                });
            }
        }

        if (data.role === "RECEPTIONIST" && !data.hospitalId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "hospitalId is required for receptionist",
                path: ["hospitalId"]
            });
        }

        if (data.role === "PATIENT" && !data.name) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "name is required for patient",
                path: ["name"]
            });
        }
    });

export const tenantUserIdParamSchema = z.object({
    id: z.string().trim().min(1)
});

export const updateTenantUserSchema = z.object({
    email: z.string().trim().email().optional(),
    password: z.string().min(6).optional(),
    phone: z.string().trim().min(1).nullable().optional(),
    isActive: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    name: z.string().trim().min(1).optional(),
    specialization: z.string().trim().min(1).nullable().optional(),
    dob: z.preprocess(
        (value) => (value ? new Date(String(value)) : value),
        z.date().nullable().optional()
    ),
    gender: z.string().trim().min(1).nullable().optional(),
    bloodGroup: z.string().trim().min(1).nullable().optional(),
    allergies: z.string().trim().min(1).nullable().optional()
});

export const listTenantUserSchema = z.object({
    tenantId: z.string().trim().min(1),
    page: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().optional()
    ),
    limit: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().optional()
    ),
    role: z.enum(["DOCTOR", "PATIENT", "RECEPTIONIST", "HOSPITAL_ADMIN"]).optional(),
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
