import { Request, Response } from "express";
import prisma from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { changePasswordSchema, updateNotificationPreferenceSchema, updateProfileSchema } from "../validation/user.validation";
import { publishRealtimeEvent } from "../socket.io/realtime";
import { AppError } from "../utils/appError";
import { comparePassword, hashPassword } from "../utils/password";
import { verifyAccessToken } from "../utils/jwt";
import crypto from "crypto";
import { signAccessToken, signRefreshToken, getExpiryDate, getRequiredEnv } from "../utils/jwt";

type AuthenticatedRequest = Request & {
    user?: {
        id: string;
        role: string;
    };
    file?: Express.Multer.File;
};

const PROFILE_IMAGE_FOLDER = "profile-images";
const DOCTOR_FILE_FOLDER = "doctor-files";

function buildUploadUrl(folder: string, fileName: string) {
    return `/uploads/${folder}/${fileName}`;
}

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

    getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const authUser = req.user;
        if (!authUser) {
            throw new AppError("Unauthorized", 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
            include: {
                doctor: true,
                patient: true,
                receptionist: true,
                superAdmin: true
            }
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return sendSuccess(res, "Profile retrieved successfully", user);
    });

    updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const authUser = req.user;
        if (!authUser) {
            throw new AppError("Unauthorized", 401);
        }

        const payload = updateProfileSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
            include: {
                doctor: true,
                patient: true,
                receptionist: true,
                superAdmin: true
            }
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const updatedUser = await prisma.$transaction(async (tx) => {
            const nextUser = await tx.user.update({
                where: { id: authUser.id },
                data: {
                    email: payload.email,
                    phone: payload.phone !== undefined ? payload.phone : undefined
                }
            });

            if (user.role === "DOCTOR" && user.doctor) {
                await tx.doctor.update({
                    where: { userId: authUser.id },
                    data: {
                        name: payload.name,
                        specialization: payload.specialization ?? undefined,
                        licenseNumber: payload.licenseNumber ?? undefined
                    }
                });
            }

            if (user.role === "PATIENT" && user.patient) {
                await tx.patient.update({
                    where: { userId: authUser.id },
                    data: {
                        name: payload.name,
                        dob: payload.dob ?? undefined,
                        gender: payload.gender ?? undefined,
                        bloodGroup: payload.bloodGroup ?? undefined,
                        allergies: payload.allergies ?? undefined
                    }
                });
            }

            if (user.role === "RECEPTIONIST" && user.receptionist) {
                await tx.receptionist.update({
                    where: { userId: authUser.id },
                    data: {
                        name: payload.name
                    }
                });
            }

            if (user.role === "SUPER_ADMIN" && user.superAdmin) {
                await tx.superAdmin.update({
                    where: { userId: authUser.id },
                    data: {
                        fullName: payload.name
                    }
                });
            }

            return nextUser;
        });

        return sendSuccess(res, "Profile updated successfully", updatedUser);
    });

    updateProfileImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const authUser = req.user;
        if (!authUser) {
            throw new AppError("Unauthorized", 401);
        }

        if (!req.file) {
            throw new AppError("Profile image is required", 400);
        }

        const profileImageUrl = buildUploadUrl(PROFILE_IMAGE_FOLDER, req.file.filename);

        const updatedUser = await prisma.user.update({
            where: { id: authUser.id },
            data: {
                profileImageUrl
            }
        });

        return sendSuccess(res, "Profile image updated successfully", {
            id: updatedUser.id,
            profileImageUrl: updatedUser.profileImageUrl
        });
    });

    changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const authUser = req.user;
        if (!authUser) {
            throw new AppError("Unauthorized", 401);
        }

        const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const isMatch = await comparePassword(oldPassword, user.passwordHash);
        if (!isMatch) {
            throw new AppError("Current password is incorrect", 400);
        }

        const passwordHash = await hashPassword(newPassword);

        const accessToken = signAccessToken({ sub: authUser.id, role: user.role });
        const refreshToken = signRefreshToken({ sub: authUser.id });
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const expiresAt = getExpiryDate(getRequiredEnv("REFRESH_TOKEN_EXPIRES_IN"));

        await prisma.$transaction([
            prisma.user.update({
                where: { id: authUser.id },
                data: { passwordHash },
            }),
            prisma.refreshToken.updateMany({
                where: { userId: authUser.id, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
            prisma.refreshToken.create({
                data: { userId: authUser.id, tokenHash, expiresAt },
            }),
        ]);

        return sendSuccess(res, "Password changed successfully", {
            accessToken,
            refreshToken,
        });
    });


    uploadDoctorFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const authUser = req.user;
        if (!authUser) {
            throw new AppError("Unauthorized", 401);
        }

        if (authUser.role !== "DOCTOR") {
            throw new AppError("Only doctors can upload user files", 403);
        }

        if (!req.file) {
            throw new AppError("Doctor file is required", 400);
        }

        const fileUrl = buildUploadUrl(DOCTOR_FILE_FOLDER, req.file.filename);

        const savedFile = await prisma.userFile.create({
            data: {
                userId: authUser.id,
                uploadedById: authUser.id,
                fileUrl,
                fileType: req.file.mimetype,
                fileName: req.file.originalname
            }
        });

        return sendSuccess(res, "Doctor file uploaded successfully", savedFile, 201);
    });
}
