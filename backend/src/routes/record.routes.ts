import { Router } from "express";
import { RecordController } from "../controllers/record.controller";
import { checkPermission } from "../middleware/rbac.middleware";

const router = Router();
const controller = new RecordController();

router.get("/list", checkPermission("RECORD_LIST"), controller.listRecords);
router.post("/create", checkPermission("RECORD_CREATE"), controller.createRecord);

export default router;
