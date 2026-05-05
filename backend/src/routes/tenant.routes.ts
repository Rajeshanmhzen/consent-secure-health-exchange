import { Router } from "express";

import { TenantController } from "../controllers/tenant.controller";

const router = Router();
const controller = new TenantController();

router.post("/add", controller.addTenant);
router.post("/hospital/add", controller.addHospitalTenant);
router.get("/list", controller.listTenant);
router.get("/detail/:id", controller.detailTenant);
router.put("/edit/:id", controller.editTenant);
router.delete("/delete/:id", controller.deleteTenant);

export default router;
