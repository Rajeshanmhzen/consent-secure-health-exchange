import { z } from "zod";

const optionalString = z.string().trim().min(1).optional();

export const planIdParamSchema = z.object({
    id: z.string().trim().uuid()
});

export const subscriptionIdParamSchema = z.object({
    id: z.string().trim().uuid()
});

export const createPlanSchema = z.object({
    name: z.string().trim().min(2, "Plan name must be at least 2 characters"),
    monthlyPrice: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().nonnegative("Monthly price must be a non-negative number")
    ),
    yearlyPrice: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().nonnegative("Yearly price must be a non-negative number")
    ),
    currency: z.string().trim().min(1).default("USD").optional(),
    description: z.string().trim().optional().nullable(),
    features: z.array(z.string().trim()).default([]).optional(),
    isActive: z.boolean().default(true).optional()
});

export const updatePlanSchema = z.object({
    name: z.string().trim().min(2).optional(),
    monthlyPrice: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().nonnegative().optional()
    ),
    yearlyPrice: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().nonnegative().optional()
    ),
    currency: z.string().trim().min(1).optional(),
    description: z.string().trim().optional().nullable(),
    features: z.array(z.string().trim()).optional(),
    isActive: z.boolean().optional()
});

export const listPlanSchema = z.object({
    page: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().optional()
    ),
    limit: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().optional()
    ),
    search: optionalString
});

export const createSubscriptionSchema = z.object({
    tenantId: z.string().trim().uuid("Invalid tenant ID format"),
    planId: z.string().trim().uuid("Invalid plan ID format"),
    status: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED"]).default("TRIALING").optional(),
    billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY").optional(),
    startsAt: z.string().datetime().or(z.string().date()).optional(),
    endsAt: z.string().datetime().or(z.string().date()).optional().nullable(),
    trialEndsAt: z.string().datetime().or(z.string().date()).optional().nullable()
});

export const updateSubscriptionSchema = z.object({
    tenantId: z.string().trim().uuid().optional(),
    planId: z.string().trim().uuid().optional(),
    status: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED"]).optional(),
    billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional(),
    startsAt: z.string().datetime().or(z.string().date()).optional(),
    endsAt: z.string().datetime().or(z.string().date()).optional().nullable(),
    trialEndsAt: z.string().datetime().or(z.string().date()).optional().nullable()
});

export const listSubscriptionSchema = z.object({
    page: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().optional()
    ),
    limit: z.preprocess(
        (value) => (value === undefined ? undefined : Number(value)),
        z.number().int().positive().optional()
    ),
    search: optionalString,
    status: z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED"]).optional()
});
