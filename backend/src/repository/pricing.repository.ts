import { Prisma, Plan, Subscription, SubscriptionStatus } from "@prisma/client";
import prisma from "../config/prisma";
import {
    buildPaginationResult,
    normalizePagination,
    PaginationResult
} from "../utils/pagination";
import {
    CreatePlanPayload,
    UpdatePlanPayload,
    PlanListParams,
    CreateSubscriptionPayload,
    UpdateSubscriptionPayload,
    SubscriptionListParams,
    SubscriptionWithRelations
} from "../types/pricing.types";

export class PricingRepository {
    // ================= PLAN METHODS =================
    async findByPlanName(name: string): Promise<Plan | null> {
        return await prisma.plan.findUnique({
            where: { name }
        });
    }

    async addPlan(data: CreatePlanPayload): Promise<Plan> {
        return await prisma.plan.create({
            data: {
                name: data.name,
                monthlyPrice: data.monthlyPrice,
                yearlyPrice: data.yearlyPrice,
                currency: data.currency ?? "USD",
                description: data.description ?? null,
                features: data.features ? (data.features as any) : Prisma.DbNull,
                isActive: data.isActive ?? true
            }
        });
    }

    async editPlan(id: string, data: UpdatePlanPayload): Promise<Plan> {
        return await prisma.plan.update({
            where: { id },
            data: {
                name: data.name,
                monthlyPrice: data.monthlyPrice,
                yearlyPrice: data.yearlyPrice,
                currency: data.currency,
                description: data.description,
                features: data.features ? (data.features as any) : undefined,
                isActive: data.isActive
            }
        });
    }

    async detailPlan(id: string): Promise<Plan | null> {
        return await prisma.plan.findUnique({
            where: { id }
        });
    }

    async listPlans(params: PlanListParams): Promise<PaginationResult<Plan>> {
        const { page, limit, skip, take } = normalizePagination(params);
        const where: Prisma.PlanWhereInput = params.search
            ? {
                  OR: [
                      {
                          name: {
                              contains: params.search,
                              mode: "insensitive"
                          }
                      },
                      {
                          description: {
                              contains: params.search,
                              mode: "insensitive"
                          }
                      }
                  ]
              }
            : {};

        const [total, data] = await prisma.$transaction([
            prisma.plan.count({ where }),
            prisma.plan.findMany({
                where,
                skip,
                take,
                orderBy: {
                    createdAt: "desc"
                }
            })
        ]);

        return buildPaginationResult(data, total, page, limit);
    }

    async deletePlan(id: string): Promise<Plan> {
        return await prisma.plan.delete({
            where: { id }
        });
    }

    async countPlanSubscriptions(planId: string): Promise<number> {
        return await prisma.subscription.count({
            where: { planId }
        });
    }

    // ================= SUBSCRIPTION METHODS =================
    async findActiveSubscriptionForTenant(tenantId: string): Promise<Subscription | null> {
        return await prisma.subscription.findFirst({
            where: {
                tenantId,
                status: {
                    in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]
                }
            }
        });
    }

    async cancelActiveSubscriptionsForTenant(tenantId: string, tx?: Prisma.TransactionClient): Promise<any> {
        const client = tx ?? prisma;
        return await client.subscription.updateMany({
            where: {
                tenantId,
                status: {
                    in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]
                }
            },
            data: {
                status: SubscriptionStatus.CANCELED,
                canceledAt: new Date()
            }
        });
    }

    async addSubscription(data: CreateSubscriptionPayload): Promise<SubscriptionWithRelations> {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Cancel existing active subscriptions inside transaction to maintain exclusivity
            await this.cancelActiveSubscriptionsForTenant(data.tenantId, tx);

            return await tx.subscription.create({
                data: {
                    tenantId: data.tenantId,
                    planId: data.planId,
                    status: data.status ?? SubscriptionStatus.TRIALING,
                    billingCycle: data.billingCycle ?? "MONTHLY",
                    startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
                    endsAt: data.endsAt ? new Date(data.endsAt) : null,
                    trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null
                },
                include: {
                    tenant: true,
                    plan: true
                }
            });
        });
    }

    async editSubscription(id: string, data: UpdateSubscriptionPayload): Promise<SubscriptionWithRelations> {
        return await prisma.subscription.update({
            where: { id },
            data: {
                tenantId: data.tenantId,
                planId: data.planId,
                status: data.status,
                billingCycle: data.billingCycle,
                startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
                endsAt: data.endsAt === null ? null : data.endsAt ? new Date(data.endsAt) : undefined,
                trialEndsAt: data.trialEndsAt === null ? null : data.trialEndsAt ? new Date(data.trialEndsAt) : undefined
            },
            include: {
                tenant: true,
                plan: true
            }
        });
    }

    async detailSubscription(id: string): Promise<SubscriptionWithRelations | null> {
        return await prisma.subscription.findUnique({
            where: { id },
            include: {
                tenant: true,
                plan: true
            }
        });
    }

    async listSubscriptions(
        params: SubscriptionListParams
    ): Promise<PaginationResult<SubscriptionWithRelations>> {
        const { page, limit, skip, take } = normalizePagination(params);
        const where: Prisma.SubscriptionWhereInput = {};

        if (params.status) {
            where.status = params.status;
        }

        if (params.search) {
            where.OR = [
                {
                    tenant: {
                        name: {
                            contains: params.search,
                            mode: "insensitive"
                        }
                    }
                },
                {
                    plan: {
                        name: {
                            contains: params.search,
                            mode: "insensitive"
                        }
                    }
                }
            ];
        }

        const [total, data] = await prisma.$transaction([
            prisma.subscription.count({ where }),
            prisma.subscription.findMany({
                where,
                include: {
                    tenant: true,
                    plan: true
                },
                skip,
                take,
                orderBy: {
                    createdAt: "desc"
                }
            })
        ]);

        return buildPaginationResult(data, total, page, limit);
    }

    async deleteSubscription(id: string): Promise<Subscription> {
        return await prisma.subscription.delete({
            where: { id }
        });
    }
}
