import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
});

export const registerSchema = z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    email: z.string().trim().email(),
    phone: z.string().trim().min(1).optional(),
    password: z.string().min(6),
});

export const forgotPasswordSchema = z.object({
    email: z.string().trim().email(),
});

export const verifyOtpSchema = z.object({
    email: z.string().trim().email(),
    code: z.string().trim().length(6),
});

export const resetPasswordSchema = z.object({
    email: z.string().trim().email(),
    code: z.string().trim().length(6),
    newPassword: z.string().min(6),
});
