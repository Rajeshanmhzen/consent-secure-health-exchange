import { Request, Response } from "express";
import { PricingService } from "../services/pricing.service";
import {
    CreatePlanPayload,
    UpdatePlanPayload,
    PlanListParams,
    CreateSubscriptionPayload,
    UpdateSubscriptionPayload,
    SubscriptionListParams
} from "../types/pricing.types";
import {
    createPlanSchema,
    updatePlanSchema,
    listPlanSchema,
    planIdParamSchema,
    createSubscriptionSchema,
    updateSubscriptionSchema,
    listSubscriptionSchema,
    subscriptionIdParamSchema
} from "../validation/pricing.validation";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { formatPagination } from "../utils/formatPagination";

export class PricingController {
    private service = new PricingService();

    // ================= PLAN CONTROLLERS =================
    addPlan = asyncHandler(async (req: Request, res: Response) => {
        const payload = createPlanSchema.parse(req.body) as CreatePlanPayload;
        const result = await this.service.addPlan(payload);
        return sendSuccess(res, "Plan created successfully", result, 201);
    });

    listPlans = asyncHandler(async (req: Request, res: Response) => {
        const params = listPlanSchema.parse(req.query) as PlanListParams;
        const result = await this.service.listPlans(params);
        const formattedResult = formatPagination({
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            },
            dataKey: "plans"
        });
        return sendSuccess(res, "Plan list fetched successfully", formattedResult);
    });

    detailPlan = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = planIdParamSchema.parse(req.params);
        const result = await this.service.detailPlan(id);
        return sendSuccess(res, "Plan details fetched successfully", result);
    });

    editPlan = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = planIdParamSchema.parse(req.params);
        const payload = updatePlanSchema.parse(req.body) as UpdatePlanPayload;
        const result = await this.service.editPlan(id, payload);
        return sendSuccess(res, "Plan updated successfully", result);
    });

    deletePlan = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = planIdParamSchema.parse(req.params);
        const result = await this.service.deletePlan(id);
        return sendSuccess(res, "Plan deleted successfully", result);
    });

    // ================= SUBSCRIPTION CONTROLLERS =================
    addSubscription = asyncHandler(async (req: Request, res: Response) => {
        const payload = createSubscriptionSchema.parse(req.body) as CreateSubscriptionPayload;
        const result = await this.service.addSubscription(payload);
        return sendSuccess(res, "Subscription created successfully", result, 201);
    });

    listSubscriptions = asyncHandler(async (req: Request, res: Response) => {
        const params = listSubscriptionSchema.parse(req.query) as SubscriptionListParams;
        const result = await this.service.listSubscriptions(params);
        const formattedResult = formatPagination({
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            },
            dataKey: "subscriptions"
        });
        return sendSuccess(res, "Subscription list fetched successfully", formattedResult);
    });

    detailSubscription = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = subscriptionIdParamSchema.parse(req.params);
        const result = await this.service.detailSubscription(id);
        return sendSuccess(res, "Subscription details fetched successfully", result);
    });

    editSubscription = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = subscriptionIdParamSchema.parse(req.params);
        const payload = updateSubscriptionSchema.parse(req.body) as UpdateSubscriptionPayload;
        const result = await this.service.editSubscription(id, payload);
        return sendSuccess(res, "Subscription updated successfully", result);
    });

    deleteSubscription = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = subscriptionIdParamSchema.parse(req.params);
        const result = await this.service.deleteSubscription(id);
        return sendSuccess(res, "Subscription deleted successfully", result);
    });
}
