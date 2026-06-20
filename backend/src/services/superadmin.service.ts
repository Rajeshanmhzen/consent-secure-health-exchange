import { SupAdminRepository } from "../repository/supadmin.repository";
import {
    CreateSuperAdminInput,
    CreateSuperAdminPayload,
    SuperAdminListParams,
    SuperAdminUpdateData,
    UpdateSuperAdminPayload
} from "../types/superadmin.types";
import { hashPassword } from "../utils/password";

export class SuperAdminService {
    private repository = new SupAdminRepository();

    async addSuperAdmin(data: CreateSuperAdminPayload) {
        const existing = await this.repository.findByEmail(data.email);
        if (existing) {
            throw new Error("Super admin already exists.");
        }

        const passwordHash = await hashPassword(data.password);
        const createData: CreateSuperAdminInput = {
            email: data.email,
            passwordHash,
            fullName: data.fullName,
            phone: data.phone,
            isActive: data.isActive,
            isVerified: data.isVerified
        };

        return await this.repository.addSuperAdmin(createData);
    }

    async editSuperAdmin(superAdminId: string, data: UpdateSuperAdminPayload) {
        if (data.email) {
            const existing = await this.repository.findByEmail(data.email);
            if (existing && existing.id !== superAdminId) {
                throw new Error("Email already exists.");
            }
        }

        const passwordHash = data.password
            ? await hashPassword(data.password)
            : undefined;

        const updateData: SuperAdminUpdateData = {
            fullName: data.fullName,
            user: {
                update: {
                    email: data.email,
                    passwordHash,
                    phone: data.phone,
                    isActive: data.isActive,
                    isVerified: data.isVerified
                }
            }
        };

        return await this.repository.editSuperAdmin(superAdminId, updateData);
    }

    async detailSuperAdmin(superAdminId: string) {
        return await this.repository.detailSuperAdmin(superAdminId);
    }

    async listSuperAdmins(params: SuperAdminListParams) {
        return await this.repository.listSuperAdmins(params);
    }

    async softDeleteSuperAdmin(superAdminId: string) {
        return await this.repository.softDeleteSuperAdmin(superAdminId);
    }

    async hardDeleteSuperAdmin(superAdminId: string) {
        return await this.repository.hardDeleteSuperAdmin(superAdminId);
    }

    async restoreSuperAdmin(superAdminId: string) {
        return await this.repository.restoreSuperAdmin(superAdminId);
    }
}