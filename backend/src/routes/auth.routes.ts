import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const controller = new AuthController();

router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/forgot-password", controller.forgotPassword);
router.post("/verify-otp", controller.verifyOtp);
router.post("/reset-password", controller.resetPassword);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);

export default router;
