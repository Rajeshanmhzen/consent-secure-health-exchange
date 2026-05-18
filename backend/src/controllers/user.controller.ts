import { Request, Response } from "express";
import prisma from "../config/prisma";
import { verifyAccessToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { updateNotificationPreferenceSchema } from "../validation/user.validation";
import { publishRealtimeEvent } from "../socket.io/realtime";

export class UserController {
    getPreferences = asyncHandler(async (req: Request, res: Response) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendError(res, "Unauthorized", 401);
        }
        const token = authHeader.split(" ")[1];
        let userId: string;
        try {
            const payload = verifyAccessToken(token);
            userId = payload.sub as string;
        } catch (err) {
            return sendError(res, "Invalid or expired token", 401);
        }

        // Find or create notification preference
        let pref = await prisma.notificationPreference.findUnique({
            where: { userId }
        });

        if (!pref) {
            pref = await prisma.notificationPreference.create({
                data: {
                    userId,
                    emailEnabled: true,
                    smsEnabled: false,
                    inAppEnabled: true
                }
            });
        }

        return sendSuccess(res, "Notification preferences retrieved successfully", pref);
    });

    updatePreferences = asyncHandler(async (req: Request, res: Response) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendError(res, "Unauthorized", 401);
        }
        const token = authHeader.split(" ")[1];
        let userId: string;
        try {
            const payload = verifyAccessToken(token);
            userId = payload.sub as string;
        } catch (err) {
            return sendError(res, "Invalid or expired token", 401);
        }

        const { emailEnabled, smsEnabled, inAppEnabled } = updateNotificationPreferenceSchema.parse(req.body);

        const pref = await prisma.notificationPreference.upsert({
            where: { userId },
            update: {
                emailEnabled: emailEnabled !== undefined ? emailEnabled : undefined,
                smsEnabled: smsEnabled !== undefined ? smsEnabled : undefined,
                inAppEnabled: inAppEnabled !== undefined ? inAppEnabled : undefined,
            },
            create: {
                userId,
                emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
                smsEnabled: smsEnabled !== undefined ? smsEnabled : false,
                inAppEnabled: inAppEnabled !== undefined ? inAppEnabled : true,
            }
        });

        publishRealtimeEvent({
            type: "NOTIFICATION_PREFERENCES_CHANGED",
            payload: { userId }
        });

        return sendSuccess(res, "Notification preferences updated successfully", pref);
    });
}
