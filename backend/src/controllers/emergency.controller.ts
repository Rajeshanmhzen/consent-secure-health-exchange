import { Request, Response } from "express";
import { EmergencyService } from "../services/emergency.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/appError";

export class EmergencyController {
    private service = new EmergencyService();

    triggerOverride = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user || user.role !== "DOCTOR") {
            throw new AppError("Only licensed clinicians are authorized to bypass clinical locks.", 403);
        }

                const { patientEmail, reason } = req.body;
        if (!patientEmail || !reason) {
            throw new AppError("Bypass requires patient target identification email and explicit critical clinical justification.", 400);
        }

        const result = await this.service.triggerOverride(user.id, { patientEmail, reason });
        return sendSuccess(res, "CRITICAL: Emergency record override bypass authorized. Access granted for 24 hours.", result, 201);
    });

    getActiveOverrides = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user || (user.role !== "DOCTOR" && user.role !== "HOSPITAL_ADMIN")) {
            throw new AppError("Unauthorized.", 403);
        }

        const result = await this.service.getActiveOverrides(user.id, user.role);
        return sendSuccess(res, "Active emergency bypass sessions loaded.", result);
    });

    getHistory = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user) {
            throw new AppError("Unauthorized.", 401);
        }

        const result = await this.service.getHistory(user.id, user.role);
        return sendSuccess(res, "Emergency bypass audit history fetched.", result);
    });
}
