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
router.post("/user/restore/:id", checkPermission("USER_EDIT"), controller.restoreTenantUser);
router.post("/user/bulk/soft-delete", checkPermission("USER_DELETE"), controller.bulkSoftDeleteTenantUsers);
router.post("/user/bulk/hard-delete", checkPermission("USER_DELETE"), controller.bulkHardDeleteTenantUsers);
router.post("/user/bulk/restore", checkPermission("USER_EDIT"), controller.bulkRestoreTenantUsers);

router.get("/list", checkPermission("TENANT_LIST"), controller.listTenant);
router.get("/detail/:id", checkPermission("TENANT_VIEW"), controller.detailTenant);
router.put("/edit/:id", checkPermission("TENANT_EDIT"), controller.editTenant);
router.delete("/delete/:id", checkPermission("TENANT_DELETE"), controller.deleteTenant);
router.delete("/hard-delete/:id", checkPermission("TENANT_DELETE"), controller.hardDeleteTenant);
router.post("/restore/:id", checkPermission("TENANT_EDIT"), controller.restoreTenant);

router.post("/bulk/soft-delete", checkPermission("TENANT_DELETE"), controller.bulkSoftDeleteTenants);
router.post("/bulk/hard-delete", checkPermission("TENANT_DELETE"), controller.bulkHardDeleteTenants);
router.post("/bulk/restore", checkPermission("TENANT_EDIT"), controller.bulkRestoreTenants);

export default router;
