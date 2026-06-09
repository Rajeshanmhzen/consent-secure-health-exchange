import { TenantRepository } from "../repository/tenant.repository";
import {
    CreateHospitalTenantPayload,
    CreateTenantPayload,
    CreateTenantUserPayload,
    TenantUserListParams,
    UpdateTenantUserPayload,
    TenantListParams,
    UpdateTenantPayload
} from "../types/tenant.types";
import { AppError } from "../utils/appError";
import { hashPassword } from "../utils/password";

export class TenantService {
    private repository = new TenantRepository();

    async addTenant(data: CreateTenantPayload) {
        return await this.repository.createTenant(data);
    }

    async editTenant(tenantId: string, data: UpdateTenantPayload) {
        return await this.repository.updateTenant(tenantId, data);
    }

    async detailTenant(tenantId: string) {
        return await this.repository.getTenantById(tenantId);
    }

    async listTenants(params: TenantListParams) {
        return await this.repository.listTenants(params);
    }

    async deleteTenant(tenantId: string) {
        return await this.repository.deleteTenant(tenantId);
    }

    async hardDeleteTenant(tenantId: string) {
        return await this.repository.hardDeleteTenant(tenantId);
    }

    async restoreTenant(tenantId: string) {
        return await this.repository.restoreTenant(tenantId);
    }

    async bulkSoftDeleteTenants(tenantIds: string[]) {
        return await this.repository.bulkSoftDeleteTenants(tenantIds);
    }

    async bulkHardDeleteTenants(tenantIds: string[]) {
        return await this.repository.bulkHardDeleteTenants(tenantIds);
    }

    async bulkRestoreTenants(tenantIds: string[]) {
        return await this.repository.bulkRestoreTenants(tenantIds);
    }

    async addHospitalTenant(data: CreateHospitalTenantPayload) {
        const existing = await this.repository.findUserByEmail(data.adminEmail);
        if (existing) {
            throw new AppError("Admin email already exists.", 409, "EMAIL_EXISTS");
        }

        const passwordHash = await hashPassword(data.adminPassword);
        return await this.repository.createHospitalTenantWithAdmin(
            data,
            passwordHash
        );
    }

    async addTenantUser(data: CreateTenantUserPayload) {
        const existing = await this.repository.findUserByEmail(data.email);
        if (existing) {
            throw new AppError("User email already exists.", 409, "EMAIL_EXISTS");
        }

        if (data.phone) {
            const existingPhone = await this.repository.findUserByPhone(data.phone);
            if (existingPhone) {
                throw new AppError("User phone already exists.", 409, "PHONE_EXISTS");
            }
        }

        const tenant = await this.repository.getTenantById(data.tenantId);
        if (!tenant) {
            throw new AppError("Tenant not found.", 404, "TENANT_NOT_FOUND");
        }

        if (data.role === "DOCTOR" || data.role === "RECEPTIONIST") {
            const hospital = data.hospitalId
                ? await this.repository.getHospitalById(data.hospitalId)
                : null;

            if (!hospital) {
                throw new AppError("Hospital not found.", 404, "HOSPITAL_NOT_FOUND");
            }

            if (hospital.tenantId !== data.tenantId) {
                throw new AppError(
                    "Hospital does not belong to this tenant.",
                    400,
                    "HOSPITAL_TENANT_MISMATCH"
                );
            }
        }

        const passwordHash = await hashPassword(data.password);
        return await this.repository.createTenantUser(data, passwordHash);
    }

    async listTenantUsers(params: TenantUserListParams) {
        return await this.repository.listTenantUsers(params);
    }

    async updateTenantUser(userId: string, data: UpdateTenantUserPayload) {
        const passwordHash = data.password
            ? await hashPassword(data.password)
            : undefined;

        return await this.repository.updateTenantUser(userId, {
            email: data.email,
            passwordHash,
            phone: data.phone,
            isActive: data.isActive,
            isVerified: data.isVerified,
            name: data.name,
            specialization: data.specialization,
            dob: data.dob,
            gender: data.gender,
            bloodGroup: data.bloodGroup,
            allergies: data.allergies
        });
    }

    async softDeleteTenantUser(userId: string) {
        return await this.repository.softDeleteTenantUser(userId);
    }

    async hardDeleteTenantUser(userId: string) {
        return await this.repository.hardDeleteTenantUser(userId);
    }

    async restoreTenantUser(userId: string) {
        return await this.repository.restoreTenantUser(userId);
    }

    async bulkSoftDeleteTenantUsers(userIds: string[]) {
        return await this.repository.bulkSoftDeleteTenantUsers(userIds);
    }

    async bulkHardDeleteTenantUsers(userIds: string[]) {
        return await this.repository.bulkHardDeleteTenantUsers(userIds);
    }

    async bulkRestoreTenantUsers(userIds: string[]) {
        return await this.repository.bulkRestoreTenantUsers(userIds);
    }
}
