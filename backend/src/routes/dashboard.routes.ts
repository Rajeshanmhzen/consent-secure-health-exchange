import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { requireRole } from "../middleware/auth.middleware";

const router = Router();
const controller = new DashboardController();

router.get("/superadmin/stats", requireRole("SUPER_ADMIN"), controller.superAdminStats);

export default router;
