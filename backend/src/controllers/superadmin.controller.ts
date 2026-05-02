import { Request, Response } from "express";
import { ZodError } from "zod";

import { SuperAdminService } from "@/services/superadmin.service";
import {
    CreateSuperAdminPayload,
    SuperAdminListParams,
    UpdateSuperAdminPayload
} from "@/types/superadmin.types";
import {
    createSuperAdminSchema,
    listSuperAdminSchema,
    superAdminIdParamSchema,
    updateSuperAdminSchema
} from "@/validation/superadmin.validation";
import { asynHandler } from "@/utils/asyncHandler";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/appError";

export class SuperAdminController {
    private service = new SuperAdminService();

    addSuperAdmin = asynHandler(async (req: Request, res: Response) => {
        const payload = createSuperAdminSchema.parse(req.body) as CreateSuperAdminPayload;
        const result = await this.service.addSuperAdmin(payload);
        return sendSuccess(res, "Super admin added successfully", result, 201);
    });

    listSuperAdmin = asynHandler(async (req: Request, res: Response) => {
        const params = listSuperAdminSchema.parse(req.query) as SuperAdminListParams;
        const result = await this.service.listSuperAdmins(params);
        return sendSuccess(res, "Super admin list fetched", result);
    });

    detailSuperAdmin = asynHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = superAdminIdParamSchema.parse(req.params);
        const result = await this.service.detailSuperAdmin(id);
        if (!result) {
            throw new AppError("Super admin not found", 404);
        }
        return sendSuccess(res, "Super admin detail fetched", result);
    });

    editSuperAdmin = asynHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = superAdminIdParamSchema.parse(req.params);
        const payload = updateSuperAdminSchema.parse(req.body) as UpdateSuperAdminPayload;
        const result = await this.service.editSuperAdmin(id, payload);
        return sendSuccess(res, "Super admin updated successfully", result);
    });

    deleteSuperAdmin = asynHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = superAdminIdParamSchema.parse(req.params);
        const result = await this.service.deleteSuperAdmin(id);
        return sendSuccess(res, "Super admin deleted successfully", result);
    });
}