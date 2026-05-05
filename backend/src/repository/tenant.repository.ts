import { Prisma } from "../generated/prisma";

import prisma from "../config/prisma";
import {
    buildPaginationResult,
    normalizePagination,
    PaginationResult
} from "../utils/pagination";
import {
    CreateHospitalTenantPayload,
    CreateTenantPayload,
    TenantListItem,
    TenantListParams,
    TenantUpdateData
} from "../types/tenant.types";

export class TenantRepository {
    async createTenant(data: CreateTenantPayload) {
        return await prisma.tenant.create({
            data: {
                name: data.name,
                type: data.type,
                isActive: data.isActive ?? true
            }
        });
    }

    async updateTenant(tenantId: string, data: TenantUpdateData) {
        return await prisma.tenant.update({
            where: { id: tenantId },
            data
        });
    }

    async getTenantById(tenantId: string) {
        return await prisma.tenant.findUnique({
            where: { id: tenantId }
        });
    }

    async listTenants(
        params: TenantListParams
    ): Promise<PaginationResult<TenantListItem>> {
        const { page, limit, skip, take } = normalizePagination(params);
        const where: Prisma.TenantWhereInput = {
            ...(params.search
                ? {
                      name: {
                          contains: params.search,
                          mode: "insensitive"
                      }
                  }
                : {}),
            ...(params.type ? { type: params.type } : {}),
            ...(params.isActive === undefined ? {} : { isActive: params.isActive })
        };

        const [total, data] = (await prisma.$transaction([
            prisma.tenant.count({ where }),
            prisma.tenant.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" }
            })
        ])) as [number, TenantListItem[]];

        return buildPaginationResult(data, total, page, limit);
    }

    async deleteTenant(tenantId: string) {
        return await prisma.tenant.delete({
            where: { id: tenantId }
        });
    }

    async findUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    async createHospitalTenantWithAdmin(
        data: CreateHospitalTenantPayload,
        passwordHash: string
    ) {
        return await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: data.tenantName,
                    type: "HOSPITAL",
                    isActive: data.isTenantActive ?? true
                }
            });

            const hospital = await tx.hospital.create({
                data: {
                    tenantId: tenant.id,
                    name: data.hospitalName,
                    email: data.hospitalEmail ?? null
                }
            });

            const adminUser = await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    email: data.adminEmail,
                    passwordHash,
                    role: "HOSPITAL_ADMIN",
                    phone: data.adminPhone ?? null,
                    isActive: data.isAdminActive ?? true,
                    isVerified: data.isAdminVerified ?? false
                },
                select: {
                    id: true,
                    tenantId: true,
                    email: true,
                    role: true,
                    phone: true,
                    isActive: true,
                    isVerified: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            return {
                tenant,
                hospital,
                adminUser
            };
        });
    }
}
