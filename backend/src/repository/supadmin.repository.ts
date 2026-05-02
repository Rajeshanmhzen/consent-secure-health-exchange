import { Prisma } from "../generated/prisma";

import prisma from "../config/prisma";
import {
    buildPaginationResult,
    normalizePagination,
    PaginationResult
} from "../utils/pagination";
import {
    CreateSuperAdminInput,
    SuperAdminListParams,
    SuperAdminWithUser,
    SuperAdminUpdateData
} from "../types/superadmin.types";

export class SupAdminRepository {
    async findByEmail(email: string) {
        return await prisma.superAdmin.findFirst({
            where: {
                user: {
                    is: {
                        email
                    }
                }
            },
            include: {
                user: true
            }
        });
    }

    async addSuperAdmin(data: CreateSuperAdminInput) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash: data.passwordHash,
                    role: "SUPER_ADMIN",
                    phone: data.phone ?? null,
                    isActive: data.isActive ?? true,
                    isVerified: data.isVerified ?? false
                }
            });

            return await tx.superAdmin.create({
                data: {
                    userId: user.id,
                    fullName: data.fullName
                },
                include: {
                    user: true
                }
            });
        });
    }

    async editSuperAdmin(superAdminId: string, data: SuperAdminUpdateData) {
        return await prisma.superAdmin.update({
            where: { id: superAdminId },
            data,
            include: { user: true }
        });
    }

    async detailSuperAdmin(superAdminId: string) {
        return await prisma.superAdmin.findUnique({
            where: { id: superAdminId },
            include: { user: true }
        });
    }

    async listSuperAdmins(
        params: SuperAdminListParams
    ): Promise<PaginationResult<SuperAdminWithUser>> {
        const { page, limit, skip, take } = normalizePagination(params);
        const where: Prisma.SuperAdminWhereInput = params.search
            ? {
                  user: {
                      is: {
                          email: {
                              contains: params.search,
                              mode: "insensitive"
                          }
                      }
                  }
              }
            : {};

        const [total, data] = (await prisma.$transaction([
            prisma.superAdmin.count({ where }),
            prisma.superAdmin.findMany({
                where,
                include: { user: true },
                skip,
                take,
                orderBy: {
                    user: {
                        email: "asc"
                    }
                }
            })
        ])) as [number, SuperAdminWithUser[]];

        return buildPaginationResult(data, total, page, limit);
    }

    async deleteSuperAdmin(superAdminId: string) {
        return await prisma.superAdmin.delete({
            where: { id: superAdminId }
        });
    }
}