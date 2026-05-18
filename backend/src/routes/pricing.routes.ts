import { Router } from "express";
import { PricingController } from "../controllers/pricing.controller";
import { checkPermission } from "../middleware/rbac.middleware";

const router = Router();
const controller = new PricingController();

// Plan Routes
router.post("/plans/add", checkPermission("PLAN_MANAGE"), controller.addPlan);
router.get("/plans/list", controller.listPlans);
router.get("/plans/detail/:id", checkPermission("PLAN_VIEW"), controller.detailPlan);
router.put("/plans/edit/:id", checkPermission("PLAN_MANAGE"), controller.editPlan);
router.delete("/plans/delete/:id", checkPermission("PLAN_MANAGE"), controller.deletePlan);

// Subscription Routes
router.post("/subscriptions/add", checkPermission("SUBSCRIPTION_MANAGE"), controller.addSubscription);
router.get("/subscriptions/list", checkPermission("SUBSCRIPTION_MANAGE"), controller.listSubscriptions);
router.get("/subscriptions/detail/:id", checkPermission("SUBSCRIPTION_MANAGE"), controller.detailSubscription);
router.put("/subscriptions/edit/:id", checkPermission("SUBSCRIPTION_MANAGE"), controller.editSubscription);
router.delete("/subscriptions/delete/:id", checkPermission("SUBSCRIPTION_MANAGE"), controller.deleteSubscription);

export default router;
