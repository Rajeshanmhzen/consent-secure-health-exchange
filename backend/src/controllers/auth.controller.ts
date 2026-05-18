import { Request, Response } from "express";
import { AuthRepository } from "../repository/auth.repository";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema
} from "../validation/auth.validation";

const repo = new AuthRepository();

export class AuthController {
    login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = loginSchema.parse(req.body);
        const result = await repo.login(email, password);
        if (!result) return sendError(res, "Invalid email or password", 401);
        return sendSuccess(res, result.message ?? "Login successful", {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    });

    register = asyncHandler(async (req: Request, res: Response) => {
        const data = registerSchema.parse(req.body);
        try {
            const result = await repo.register(data);
            return sendSuccess(res, result.message ?? "Registration successful", {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            }, 201);
        } catch (err: any) {
            if (err.message === "EMAIL_TAKEN") return sendError(res, "Email already in use", 409);
            throw err;
        }
    });

    forgotPassword = asyncHandler(async (req: Request, res: Response) => {
        const { email } = forgotPasswordSchema.parse(req.body);
        await repo.forgotPassword(email);
        return sendSuccess(res, "If this email exists, a reset code has been sent", null);
    });

    verifyOtp = asyncHandler(async (req: Request, res: Response) => {
        const { email, code } = verifyOtpSchema.parse(req.body);
        const valid = await repo.verifyOtp(email, code);
        if (!valid) return sendError(res, "Invalid or expired code", 400);
        return sendSuccess(res, "Code verified", null);
    });

    resetPassword = asyncHandler(async (req: Request, res: Response) => {
        const { email, code, newPassword } = resetPasswordSchema.parse(req.body);
        const success = await repo.resetPassword(email, code, newPassword);
        if (!success) return sendError(res, "Invalid or expired code", 400);
        return sendSuccess(res, "Password reset successfully", null);
    });

    refresh = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        if (!refreshToken) return sendError(res, "Refresh token required", 400);
        const result = await repo.refresh(refreshToken);
        if (!result) return sendError(res, "Invalid or expired refresh token", 401);
        return sendSuccess(res, "Token refreshed", {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    });

    logout = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        if (!refreshToken) return sendError(res, "Refresh token required", 400);
        const result = await repo.logout(refreshToken);
        return sendSuccess(res, result.message, null);
    });
}
