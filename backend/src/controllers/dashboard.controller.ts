import { Request, Response } from "express";
import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

export class DashboardController {
    superAdminStats = asyncHandler(async (_req: Request, res: Response) => {
        const [
            totalTenants,
            totalPlans,
            totalSubscriptions,
            totalUsers,
            auditEvents,
            totalInquiries
        ] = await prisma.$transaction([
            prisma.tenant.count(),
            prisma.plan.count(),
            prisma.subscription.count(),
            prisma.user.count({ where: { deletedAt: null } }),
            prisma.auditLog.count(),
            prisma.inquiry.count()
        ]);

        return sendSuccess(res, "Dashboard stats fetched successfully", {
            totalTenants,
            totalPlans,
            totalSubscriptions,
            totalUsers,
            auditEvents,
            totalInquiries
        });
    });
}
