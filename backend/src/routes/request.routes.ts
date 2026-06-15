import { Router } from "express";
import { RequestController } from "../controllers/request.controller";
import { checkPermission } from "../middleware/rbac.middleware";

const router = Router();
const controller = new RequestController();

router.post("/create", checkPermission("DATA_REQUEST_CREATE"), controller.createRequest);
router.post("/patient-consent", checkPermission("CONSENT_MANAGE"), controller.patientConsent);
router.post("/consent/send-otp", checkPermission("CONSENT_MANAGE"), controller.sendConsentOtp);
router.post("/consent/verify-otp", checkPermission("CONSENT_MANAGE"), controller.verifyConsentOtp);
router.post("/hospital-consent", checkPermission("DATA_REQUEST_CREATE"), controller.hospitalConsent);
router.get("/list", checkPermission("DATA_REQUEST_LIST"), controller.listRequests);
router.get("/shared-records/:requestId", checkPermission("DATA_REQUEST_LIST"), controller.getSharedRecords);

export default router;
