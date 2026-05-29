import { Router } from "express";

import { SuperAdminController } from "../controllers/superadmin.controller";
import { checkPermission } from "../middleware/rbac.middleware";

const router = Router();
const controller = new SuperAdminController();

router.post("/add", checkPermission("SUPER_ADMIN_MANAGE"), controller.addSuperAdmin);
router.get("/list", checkPermission("SUPER_ADMIN_MANAGE"), controller.listSuperAdmin);
router.get("/detail/:id", checkPermission("SUPER_ADMIN_MANAGE"), controller.detailSuperAdmin);
router.put("/edit/:id", checkPermission("SUPER_ADMIN_MANAGE"), controller.editSuperAdmin);
router.delete("/delete/:id", checkPermission("SUPER_ADMIN_MANAGE"), controller.deleteSuperAdmin);

export default router;
