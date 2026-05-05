import { Request, Response } from "express";

import { TenantService } from "../services/tenant.service";
import {
    CreateHospitalTenantPayload,
    CreateTenantPayload,
    TenantListParams,
    UpdateTenantPayload
} from "../types/tenant.types";
import { formatPagination } from "../utils/formatPagination";
import {
    createHospitalTenantSchema,
    createTenantSchema,
    listTenantSchema,
    tenantIdParamSchema,
    updateTenantSchema
} from "../validation/tenant.validation";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/appError";

export class TenantController {
    private service = new TenantService();

    addTenant = asyncHandler(async (req: Request, res: Response) => {
        const payload = createTenantSchema.parse(req.body) as CreateTenantPayload;
        const result = await this.service.addTenant(payload);
        return sendSuccess(res, "Tenant created successfully", result, 201);
    });

    listTenant = asyncHandler(async (req: Request, res: Response) => {
        const params = listTenantSchema.parse(req.query) as TenantListParams;
        const result = await this.service.listTenants(params);
        const formattedResult = formatPagination({
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            },
            dataKey: "hospitals"
        });
        return sendSuccess(res, "Tenant list fetched", formattedResult);
    });

    detailTenant = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = tenantIdParamSchema.parse(req.params);
        const result = await this.service.detailTenant(id);
        if (!result) {
            throw new AppError("Tenant not found", 404);
        }
        return sendSuccess(res, "Tenant detail fetched", result);
    });

    editTenant = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = tenantIdParamSchema.parse(req.params);
        const payload = updateTenantSchema.parse(req.body) as UpdateTenantPayload;
        const result = await this.service.editTenant(id, payload);
        return sendSuccess(res, "Tenant updated successfully", result);
    });

    deleteTenant = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = tenantIdParamSchema.parse(req.params);
        const result = await this.service.deleteTenant(id);
        return sendSuccess(res, "Tenant deleted successfully", result);
    });

    addHospitalTenant = asyncHandler(async (req: Request, res: Response) => {
        const payload = createHospitalTenantSchema.parse(
            req.body
        ) as CreateHospitalTenantPayload;
        const result = await this.service.addHospitalTenant(payload);
        const formattedResult = {
            tenant: result.tenant,
            hospital: result.hospital,
            adminUser: {
                id: result.adminUser.id,
                email: result.adminUser.email,
                role: result.adminUser.role,
                phone: result.adminUser.phone,
                isActive: result.adminUser.isActive,
                isVerified: result.adminUser.isVerified,
                createdAt: result.adminUser.createdAt
            }
        };
        return sendSuccess(res, "Hospital tenant created successfully", formattedResult, 201);
    });
}
