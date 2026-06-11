import { z } from "zod";

const optionalTrimmedString = z.string().trim().min(1).optional();

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
}).refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
});

export const updateNotificationPreferenceSchema = z.object({
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    inAppEnabled: z.boolean().optional()
}).refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one notification setting is required"
);

export const updateProfileSchema = z.object({
    email: z.string().trim().email().optional(),
    phone: z.string().trim().min(1).nullable().optional(),
    name: optionalTrimmedString,
    specialization: z.string().trim().min(1).nullable().optional(),
    licenseNumber: z.string().trim().min(1).nullable().optional(),
    dob: z.preprocess(
        (value) => (value ? new Date(String(value)) : value),
        z.date().nullable().optional()
    ),
    gender: z.string().trim().min(1).nullable().optional(),
    bloodGroup: z.string().trim().min(1).nullable().optional(),
    allergies: z.string().trim().min(1).nullable().optional()
}).refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one profile field is required"
);
