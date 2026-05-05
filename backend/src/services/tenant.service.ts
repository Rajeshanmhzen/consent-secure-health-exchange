import { TenantRepository } from "../repository/tenant.repository";
import {
    CreateHospitalTenantPayload,
    CreateTenantPayload,
    TenantListParams,
    UpdateTenantPayload
} from "../types/tenant.types";
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

    async addHospitalTenant(data: CreateHospitalTenantPayload) {
        const existing = await this.repository.findUserByEmail(data.adminEmail);
        if (existing) {
            throw new Error("Admin email already exists.");
        }

        const passwordHash = await hashPassword(data.adminPassword);
        return await this.repository.createHospitalTenantWithAdmin(
            data,
            passwordHash
        );
    }
}
