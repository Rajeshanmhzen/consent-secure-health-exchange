import { Router } from "express";
import { RecordController } from "../controllers/record.controller";
import { checkPermission } from "../middleware/rbac.middleware";
import { uploadRecordFile } from "../middleware/fileUpload";

const router = Router();
const controller = new RecordController();

router.get("/list", checkPermission("RECORD_LIST"), controller.listRecords);
router.post("/create", checkPermission("RECORD_CREATE"), uploadRecordFile.single("recordFile"), controller.createRecord);
router.get("/:id", checkPermission("RECORD_LIST"), controller.getRecord);
router.put("/:id", checkPermission("RECORD_EDIT"), uploadRecordFile.single("recordFile"), controller.updateRecord);
router.delete("/:id", checkPermission("RECORD_DELETE"), controller.deleteRecord);

export default router;
