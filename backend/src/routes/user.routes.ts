import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { checkPermission } from "../middleware/rbac.middleware";

const router = Router();
const controller = new UserController();

router.get("/preferences", checkPermission("PREFERENCES_MANAGE"), controller.getPreferences);
router.put("/preferences", checkPermission("PREFERENCES_MANAGE"), controller.updatePreferences);

export default router;
