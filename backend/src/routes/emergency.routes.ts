import { Router } from "express";
import { EmergencyController } from "../controllers/emergency.controller";
import { checkPermission } from "../middleware/rbac.middleware";

const router = Router();
const controller = new EmergencyController();

router.post("/override", checkPermission("EMERGENCY_OVERRIDE"), controller.triggerOverride);
router.get("/active", checkPermission("EMERGENCY_OVERRIDE"), controller.getActiveOverrides);
router.get("/records/:accessId", checkPermission("EMERGENCY_OVERRIDE"), controller.getEmergencyRecords);
router.get("/history", checkPermission("PREFERENCES_MANAGE"), controller.getHistory); // Accessible by Doctors, Patients, Admins who have PREFERENCES_MANAGE

export default router;
