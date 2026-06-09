import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { checkPermission } from "../middleware/rbac.middleware";
import { requireRole } from "../middleware/auth.middleware";
import { uploadDoctorFile, uploadProfileImage } from "../middleware/fileUpload";

const router = Router();
const controller = new UserController();

router.get("/preferences", checkPermission("PREFERENCES_MANAGE"), controller.getPreferences);
router.put("/preferences", checkPermission("PREFERENCES_MANAGE"), controller.updatePreferences);
router.put(
	"/profile",
	requireRole("SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"),
	controller.updateProfile
);
router.put(
	"/profile/image",
	requireRole("SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"),
	uploadProfileImage.single("profileImage"),
	controller.updateProfileImage
);
router.post(
	"/doctor/file",
	requireRole("DOCTOR"),
	uploadDoctorFile.single("userFile"),
	controller.uploadDoctorFile
);

export default router;
