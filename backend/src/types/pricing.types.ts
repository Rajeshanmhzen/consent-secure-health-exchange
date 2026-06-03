import { Prisma, Plan, Subscription, SubscriptionStatus, BillingCycle } from "@prisma/client";
import { PaginationParams } from "../utils/pagination";

export type CreatePlanPayload = {
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    currency?: string;
    description?: string | null;
    features?: string[];
    isActive?: boolean;
};

export type UpdatePlanPayload = {
    name?: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    currency?: string;
    description?: string | null;
    features?: string[];
    isActive?: boolean;
};

export type PlanListParams = PaginationParams & {
    search?: string;
};

export type CreateSubscriptionPayload = {
    tenantId: string;
    planId: string;
    status?: SubscriptionStatus;
    billingCycle?: BillingCycle;
    startsAt?: Date | string;
    endsAt?: Date | string | null;
    trialEndsAt?: Date | string | null;
};

export type UpdateSubscriptionPayload = {
    tenantId?: string;
    planId?: string;
    status?: SubscriptionStatus;
    billingCycle?: BillingCycle;
    startsAt?: Date | string;
    endsAt?: Date | string | null;
    trialEndsAt?: Date | string | null;
};

export type SubscriptionListParams = PaginationParams & {
    search?: string;
    status?: SubscriptionStatus;
};

export type SubscriptionWithRelations = Prisma.SubscriptionGetPayload<{
    include: { tenant: true; plan: true };
}>;
