import { PricingRepository } from "../repository/pricing.repository";
import { TenantRepository } from "../repository/tenant.repository";
import {
    CreatePlanPayload,
    UpdatePlanPayload,
    PlanListParams,
    CreateSubscriptionPayload,
    UpdateSubscriptionPayload,
    SubscriptionListParams
} from "../types/pricing.types";
import { AppError } from "../utils/appError";

export class PricingService {
    private repository = new PricingRepository();
    private tenantRepository = new TenantRepository();

    // ================= PLAN SERVICES =================
    async addPlan(data: CreatePlanPayload) {
        const existing = await this.repository.findByPlanName(data.name);
        if (existing) {
            throw new AppError("Plan with this name already exists.", 400);
        }
        return await this.repository.addPlan(data);
    }

    async editPlan(id: string, data: UpdatePlanPayload) {
        const plan = await this.repository.detailPlan(id);
        if (!plan) {
            throw new AppError("Plan not found.", 404);
        }

        if (data.name && data.name !== plan.name) {
            const existing = await this.repository.findByPlanName(data.name);
            if (existing) {
                throw new AppError("Plan with this name already exists.", 400);
            }
        }

        return await this.repository.editPlan(id, data);
    }

    async detailPlan(id: string) {
        const plan = await this.repository.detailPlan(id);
        if (!plan) {
            throw new AppError("Plan not found.", 404);
        }
        return plan;
    }

    async listPlans(params: PlanListParams) {
        return await this.repository.listPlans(params);
    }

    async deletePlan(id: string) {
        const plan = await this.repository.detailPlan(id);
        if (!plan) {
            throw new AppError("Plan not found.", 404);
        }

        const linkedSubscriptionsCount = await this.repository.countPlanSubscriptions(id);
        if (linkedSubscriptionsCount > 0) {
            throw new AppError(
                "Cannot delete plan because it is referenced by existing subscriptions. Please deactivate the plan instead.",
                400
            );
        }

        return await this.repository.deletePlan(id);
    }

    // ================= SUBSCRIPTION SERVICES =================
    async addSubscription(data: CreateSubscriptionPayload) {
        // Validate Plan
        const plan = await this.repository.detailPlan(data.planId);
        if (!plan) {
            throw new AppError("Selected subscription plan does not exist.", 404);
        }
        if (!plan.isActive) {
            throw new AppError("Cannot subscribe to an inactive plan.", 400);
        }

        // Validate Tenant
        const tenant = await this.tenantRepository.getTenantById(data.tenantId);
        if (!tenant) {
            throw new AppError("Selected hospital tenant does not exist.", 404);
        }

        return await this.repository.addSubscription(data);
    }

    async editSubscription(id: string, data: UpdateSubscriptionPayload) {
        const subscription = await this.repository.detailSubscription(id);
        if (!subscription) {
            throw new AppError("Subscription not found.", 404);
        }

        if (data.planId && data.planId !== subscription.planId) {
            const plan = await this.repository.detailPlan(data.planId);
            if (!plan) {
                throw new AppError("Selected plan does not exist.", 404);
            }
            if (!plan.isActive) {
                throw new AppError("Cannot change subscription to an inactive plan.", 400);
            }
        }

        if (data.tenantId && data.tenantId !== subscription.tenantId) {
            const tenant = await this.tenantRepository.getTenantById(data.tenantId);
            if (!tenant) {
                throw new AppError("Selected tenant does not exist.", 404);
            }
        }

        return await this.repository.editSubscription(id, data);
    }

    async detailSubscription(id: string) {
        const subscription = await this.repository.detailSubscription(id);
        if (!subscription) {
            throw new AppError("Subscription not found.", 404);
        }
        return subscription;
    }

    async listSubscriptions(params: SubscriptionListParams) {
        return await this.repository.listSubscriptions(params);
    }

    async deleteSubscription(id: string) {
        const subscription = await this.repository.detailSubscription(id);
        if (!subscription) {
            throw new AppError("Subscription not found.", 404);
        }

        return await this.repository.deleteSubscription(id);
    }
}
