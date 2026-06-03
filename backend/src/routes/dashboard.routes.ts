import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { requireRole } from "../middleware/auth.middleware";

const router = Router();
const controller = new DashboardController();

router.get("/superadmin/stats", requireRole("SUPER_ADMIN"), controller.superAdminStats);
router.get("/superadmin/audit", requireRole("SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "PATIENT"), controller.getAuditLogs);

export default router;
