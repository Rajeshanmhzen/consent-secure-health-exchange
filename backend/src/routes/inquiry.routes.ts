import { Router } from "express";
import { InquiryController } from "../controllers/inquiry.controller";
import { requireRole } from "../middleware/auth.middleware";

const router = Router();
const controller = new InquiryController();

router.post("/add", controller.create);
router.get("/list", requireRole("SUPER_ADMIN"), controller.list);
router.get("/stats", requireRole("SUPER_ADMIN"), controller.stats);
router.get("/detail/:id", requireRole("SUPER_ADMIN"), controller.detail);
router.put("/edit/:id", requireRole("SUPER_ADMIN"), controller.update);

export default router;
