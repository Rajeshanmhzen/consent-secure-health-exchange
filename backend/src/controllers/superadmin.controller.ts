import { Request, Response } from "express";
import { ZodError } from "zod";

import { SuperAdminService } from "../services/superadmin.service";
import {
    CreateSuperAdminPayload,
    SuperAdminListParams,
    UpdateSuperAdminPayload
} from "../types/superadmin.types";
import {
    createSuperAdminSchema,
    listSuperAdminSchema,
    superAdminIdParamSchema,
    updateSuperAdminSchema
} from "../validation/superadmin.validation";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/appError";
import { formatPagination } from "../utils/formatPagination";

export class SuperAdminController {
    private service = new SuperAdminService();

    addSuperAdmin = asyncHandler(async (req: Request, res: Response) => {
        const payload = createSuperAdminSchema.parse(req.body) as CreateSuperAdminPayload;
        const result = await this.service.addSuperAdmin(payload);
        return sendSuccess(res, "Super admin added successfully", result, 201);
    });

    listSuperAdmin = asyncHandler(async (req: Request, res: Response) => {
        const params = listSuperAdminSchema.parse(req.query) as SuperAdminListParams;
        const result = await this.service.listSuperAdmins(params);
        const formattedResult = formatPagination({
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            },
            dataKey: "superAdmins"
        });
        return sendSuccess(res, "Super admin list fetched", formattedResult);
    });

    detailSuperAdmin = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = superAdminIdParamSchema.parse(req.params);
        const result = await this.service.detailSuperAdmin(id);
        if (!result) {
            throw new AppError("Super admin not found", 404);
        }
        return sendSuccess(res, "Super admin detail fetched", result);
    });

    editSuperAdmin = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = superAdminIdParamSchema.parse(req.params);
        const payload = updateSuperAdminSchema.parse(req.body) as UpdateSuperAdminPayload;
        const result = await this.service.editSuperAdmin(id, payload);
        return sendSuccess(res, "Super admin updated successfully", result);
    });

    softDeleteSuperAdmin = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = superAdminIdParamSchema.parse(req.params);
        const result = await this.service.softDeleteSuperAdmin(id);
        if (!result) {
            throw new AppError("Super admin not found", 404);
        }
        return sendSuccess(res, "Super admin soft deleted successfully", result);
    });

    hardDeleteSuperAdmin = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = superAdminIdParamSchema.parse(req.params);
        const result = await this.service.hardDeleteSuperAdmin(id);
        if (!result) {
            throw new AppError("Super admin not found", 404);
        }
        return sendSuccess(res, "Super admin hard deleted successfully", result);
    });

    restoreSuperAdmin = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = superAdminIdParamSchema.parse(req.params);
        const result = await this.service.restoreSuperAdmin(id);
        if (!result) {
            throw new AppError("Super admin not found", 404);
        }
        return sendSuccess(res, "Super admin restored successfully", result);
    });
}