import { Router } from "express";

import { SuperAdminController } from "../controllers/superadmin.controller";

const router = Router();
const controller = new SuperAdminController();

router.post("/add", controller.addSuperAdmin);
router.get("/list", controller.listSuperAdmin);
router.get("/detail/:id", controller.detailSuperAdmin);
router.put("/edit/:id", controller.editSuperAdmin);
router.delete("/delete/:id", controller.deleteSuperAdmin);

export default router;
