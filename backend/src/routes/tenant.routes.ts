import { Router } from "express";

import { TenantController } from "../controllers/tenant.controller";

const router = Router();
const controller = new TenantController();

router.post("/add", controller.addTenant);
router.post("/hospital/add", controller.addHospitalTenant);
router.post("/user/add", controller.addTenantUser);
router.get("/user/list", controller.listTenantUsers);
router.put("/user/edit/:id", controller.editTenantUser);
router.delete("/user/soft-delete/:id", controller.softDeleteTenantUser);
router.delete("/user/hard-delete/:id", controller.hardDeleteTenantUser);
router.get("/list", controller.listTenant);
router.get("/detail/:id", controller.detailTenant);
router.put("/edit/:id", controller.editTenant);
router.delete("/delete/:id", controller.deleteTenant);

export default router;
