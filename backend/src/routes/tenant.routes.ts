import { Router } from "express";

import { TenantController } from "../controllers/tenant.controller";
import { checkPermission } from "../middleware/rbac.middleware";

const router = Router();
const controller = new TenantController();

router.post("/add", checkPermission("TENANT_CREATE"), controller.addTenant);
router.post("/hospital/add", checkPermission("TENANT_CREATE"), controller.addHospitalTenant);
router.post("/user/add", checkPermission("USER_CREATE"), controller.addTenantUser);
router.get("/user/list", checkPermission("USER_LIST"), controller.listTenantUsers);
router.put("/user/edit/:id", checkPermission("USER_EDIT"), controller.editTenantUser);
router.delete("/user/soft-delete/:id", checkPermission("USER_DELETE"), controller.softDeleteTenantUser);
router.delete("/user/hard-delete/:id", checkPermission("USER_DELETE"), controller.hardDeleteTenantUser);
router.get("/list", checkPermission("TENANT_LIST"), controller.listTenant);
router.get("/detail/:id", checkPermission("TENANT_VIEW"), controller.detailTenant);
router.put("/edit/:id", checkPermission("TENANT_EDIT"), controller.editTenant);
router.delete("/delete/:id", checkPermission("TENANT_DELETE"), controller.deleteTenant);

export default router;
