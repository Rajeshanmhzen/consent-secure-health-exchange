import { Request, Response } from "express";

import { TenantService } from "../services/tenant.service";
import {
    CreateHospitalTenantPayload,
    CreateTenantPayload,
    CreateTenantUserPayload,
    TenantUserListParams,
    UpdateTenantUserPayload,
    TenantListParams,
    UpdateTenantPayload
} from "../types/tenant.types";
import { formatPagination } from "../utils/formatPagination";
import {
    createHospitalTenantSchema,
    createTenantSchema,
    createTenantUserSchema,
    listTenantUserSchema,
    tenantUserIdParamSchema,
    updateTenantUserSchema,
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

    addTenantUser = asyncHandler(async (req: Request, res: Response) => {
        const payload = createTenantUserSchema.parse(req.body) as CreateTenantUserPayload;
        const result = await this.service.addTenantUser(payload);
        return sendSuccess(res, "Tenant user created successfully", result, 201);
    });

    listTenantUsers = asyncHandler(async (req: Request, res: Response) => {
        const params = listTenantUserSchema.parse(req.query) as TenantUserListParams;
        const result = await this.service.listTenantUsers(params);
        const formattedResult = formatPagination({
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            },
            dataKey: "users"
        });
        return sendSuccess(res, "Tenant user list fetched", formattedResult);
    });

    editTenantUser = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = tenantUserIdParamSchema.parse(req.params);
        const payload = updateTenantUserSchema.parse(req.body) as UpdateTenantUserPayload;
        const result = await this.service.updateTenantUser(id, payload);
        if (!result) {
            throw new AppError("User not found", 404);
        }
        return sendSuccess(res, "Tenant user updated successfully", result);
    });

    softDeleteTenantUser = asyncHandler(
        async (req: Request<{ id: string }>, res: Response) => {
            const { id } = tenantUserIdParamSchema.parse(req.params);
            const result = await this.service.softDeleteTenantUser(id);
            return sendSuccess(res, "Tenant user soft deleted successfully", result);
        }
    );

    hardDeleteTenantUser = asyncHandler(
        async (req: Request<{ id: string }>, res: Response) => {
            const { id } = tenantUserIdParamSchema.parse(req.params);
            const result = await this.service.hardDeleteTenantUser(id);
            if (!result) {
                throw new AppError("User not found", 404);
            }
            return sendSuccess(res, "Tenant user hard deleted successfully", result);
        }
    );
}
