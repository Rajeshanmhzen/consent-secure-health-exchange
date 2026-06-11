import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { generateRsaKeypair } from "../utils/crypto.helper";
import {
    buildPaginationResult,
    normalizePagination,
    PaginationResult
} from "../utils/pagination";
import {
    CreateHospitalTenantPayload,
    CreateTenantPayload,
    CreateTenantUserPayload,
    UpdateTenantUserInput,
    TenantUserListParams,
    TenantUserWithProfile,
    TenantListItem,
    TenantListParams,
    UpdateTenantPayload
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

    async updateTenant(tenantId: string, data: UpdateTenantPayload) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const tenant = await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    name: data.name,
                    type: data.type,
                    isActive: data.isActive
                }
            });

            if (data.hospitalName !== undefined || data.hospitalEmail !== undefined) {
                const updateData: any = {};
                if (data.hospitalName !== undefined) updateData.name = data.hospitalName;
                if (data.hospitalEmail !== undefined) updateData.email = data.hospitalEmail;

                await tx.hospital.updateMany({
                    where: { tenantId },
                    data: updateData
                });
            }

            return tenant;
        });
    }

    async getTenantById(tenantId: string) {
        return await prisma.tenant.findUnique({
            where: { id: tenantId }
        });
    }

    async getHospitalById(hospitalId: string) {
        return await prisma.hospital.findUnique({
            where: { id: hospitalId }
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
            ...(params.isActive === undefined ? {} : { isActive: params.isActive }),
            ...(params.deletedOnly
                ? { deletedAt: { not: null } }
                : params.includeDeleted
                  ? {}
                  : { deletedAt: null })
        };

        const [total, data] = (await prisma.$transaction([
            prisma.tenant.count({ where }),
            prisma.tenant.findMany({
                where,
                include: {
                    hospital: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                },
                skip,
                take,
                orderBy: { createdAt: "desc" }
            })
        ])) as [number, TenantListItem[]];

        return buildPaginationResult(data, total, page, limit);
    }

    async deleteTenant(tenantId: string) {
        return await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                deletedAt: new Date(),
                isActive: false
            }
        });
    }

    async hardDeleteTenant(tenantId: string) {
        return await prisma.tenant.delete({
            where: { id: tenantId }
        });
    }

    async restoreTenant(tenantId: string) {
        return await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                deletedAt: null,
                isActive: true
            }
        });
    }

    async bulkSoftDeleteTenants(tenantIds: string[]) {
        return await prisma.tenant.updateMany({
            where: { id: { in: tenantIds } },
            data: {
                deletedAt: new Date(),
                isActive: false
            }
        });
    }

    async bulkHardDeleteTenants(tenantIds: string[]) {
        return await prisma.tenant.deleteMany({
            where: { id: { in: tenantIds } }
        });
    }

    async bulkRestoreTenants(tenantIds: string[]) {
        return await prisma.tenant.updateMany({
            where: { id: { in: tenantIds } },
            data: {
                deletedAt: null,
                isActive: true
            }
        });
    }

    async findUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    async findUserByPhone(phone: string) {
        return await prisma.user.findUnique({
            where: { phone }
        });
    }

    async createHospitalTenantWithAdmin(
        data: CreateHospitalTenantPayload,
        passwordHash: string
    ) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: data.tenantName,
                    type: "HOSPITAL",
                    isActive: data.isTenantActive ?? true
                }
            });

            const keys = generateRsaKeypair();
            const hospital = await tx.hospital.create({
                data: {
                    tenantId: tenant.id,
                    name: data.hospitalName,
                    email: data.hospitalEmail ?? null,
                    publicKey: keys.publicKey,
                    privateKey: keys.privateKey
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

    async createTenantUser(data: CreateTenantUserPayload, passwordHash: string) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.create({
                data: {
                    tenantId: data.tenantId,
                    email: data.email,
                    passwordHash,
                    role: data.role,
                    phone: data.phone ?? null,
                    isActive: data.isActive ?? true,
                    isVerified: data.isVerified ?? false
                }
            });

            if (data.role === "DOCTOR") {
                const doctor = await tx.doctor.create({
                    data: {
                        userId: user.id,
                        name: data.name as string,
                        specialization: data.specialization ?? null,
                        licenseNumber: data.licenseNumber ?? null,
                        hospitalId: data.hospitalId as string
                    }
                });

                return { user, doctor };
            }

            if (data.role === "RECEPTIONIST") {
                const receptionist = await tx.receptionist.create({
                    data: {
                        userId: user.id,
                        name: data.name as string,
                        hospitalId: data.hospitalId as string
                    }
                });

                return { user, receptionist };
            }

            if (data.role === "PATIENT") {
                const patient = await tx.patient.create({
                    data: {
                        userId: user.id,
                        name: data.name as string,
                        dob: data.dob ?? null,
                        gender: data.gender ?? null,
                        bloodGroup: data.bloodGroup ?? null,
                        allergies: data.allergies ?? null
                    }
                });

                return { user, patient };
            }

            return { user };
        });
    }

    async listTenantUsers(
        params: TenantUserListParams
    ): Promise<PaginationResult<TenantUserWithProfile>> {
        const { page, limit, skip, take } = normalizePagination(params);
        const where: Prisma.UserWhereInput = {
            tenantId: params.tenantId,
            role: params.role,
            ...(params.isActive === undefined ? {} : { isActive: params.isActive }),
            ...(params.deletedOnly
                ? { deletedAt: { not: null } }
                : params.includeDeleted
                  ? {}
                  : { deletedAt: null })
        };

        const [total, data] = (await prisma.$transaction([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                include: {
                    doctor: true,
                    patient: true,
                    receptionist: true
                },
                skip,
                take,
                orderBy: { createdAt: "desc" }
            })
        ])) as [number, TenantUserWithProfile[]];

        return buildPaginationResult(data, total, page, limit);
    }

    async getTenantUserById(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
            include: {
                doctor: true,
                patient: true,
                receptionist: true
            }
        });
    }

    async updateTenantUser(userId: string, data: UpdateTenantUserInput) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return null;
            }

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    email: data.email,
                    passwordHash: data.passwordHash,
                    phone: data.phone ?? null,
                    isActive: data.isActive,
                    isVerified: data.isVerified
                }
            });

            if (user.role === "DOCTOR") {
                await tx.doctor.update({
                    where: { userId },
                    data: {
                        name: data.name,
                        specialization: data.specialization ?? null,
                        licenseNumber: data.licenseNumber ?? null
                    }
                });
            }

            if (user.role === "PATIENT") {
                await tx.patient.update({
                    where: { userId },
                    data: {
                        name: data.name,
                        dob: data.dob ?? null,
                        gender: data.gender ?? null,
                        bloodGroup: data.bloodGroup ?? null,
                        allergies: data.allergies ?? null
                    }
                });
            }

            if (user.role === "RECEPTIONIST") {
                await tx.receptionist.update({
                    where: { userId },
                    data: {
                        name: data.name
                    }
                });
            }

            return updatedUser;
        });
    }

    async softDeleteTenantUser(userId: string) {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: new Date(),
                isActive: false
            }
        });
    }

    async hardDeleteTenantUser(userId: string) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return null;
            }

            if (user.role === "DOCTOR") {
                await tx.doctor.delete({ where: { userId } });
            }

            if (user.role === "PATIENT") {
                await tx.patient.delete({ where: { userId } });
            }

            if (user.role === "RECEPTIONIST") {
                await tx.receptionist.delete({ where: { userId } });
            }

            await tx.refreshToken.deleteMany({ where: { userId } });
            await tx.notificationPreference.deleteMany({ where: { userId } });
            await tx.notification.deleteMany({ where: { userId } });
            await tx.oTP.deleteMany({ where: { userId } });
            await tx.auditLog.deleteMany({ where: { userId } });

            return await tx.user.delete({ where: { id: userId } });
        });
    }

    async restoreTenantUser(userId: string) {
        return await prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: null,
                isActive: true
            }
        });
    }

    async bulkSoftDeleteTenantUsers(userIds: string[]) {
        return await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: {
                deletedAt: new Date(),
                isActive: false
            }
        });
    }

    async bulkHardDeleteTenantUsers(userIds: string[]) {
        return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const users = await tx.user.findMany({ where: { id: { in: userIds } } });
            
            await tx.doctor.deleteMany({ where: { userId: { in: userIds } } });
            await tx.patient.deleteMany({ where: { userId: { in: userIds } } });
            await tx.receptionist.deleteMany({ where: { userId: { in: userIds } } });
            await tx.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
            await tx.notificationPreference.deleteMany({ where: { userId: { in: userIds } } });
            await tx.notification.deleteMany({ where: { userId: { in: userIds } } });
            await tx.oTP.deleteMany({ where: { userId: { in: userIds } } });
            await tx.auditLog.deleteMany({ where: { userId: { in: userIds } } });

            return await tx.user.deleteMany({ where: { id: { in: userIds } } });
        });
    }

    async bulkRestoreTenantUsers(userIds: string[]) {
        return await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: {
                deletedAt: null,
                isActive: true
            }
        });
    }
}
