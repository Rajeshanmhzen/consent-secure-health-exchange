import { Prisma, TenantType } from "../generated/prisma";

import { PaginationParams } from "../utils/pagination";

export type CreateTenantPayload = {
	name: string;
	type: TenantType;
	isActive?: boolean;
};

export type UpdateTenantPayload = {
	name?: string;
	type?: TenantType;
	isActive?: boolean;
};

export type TenantListParams = PaginationParams & {
	search?: string;
	type?: TenantType;
	isActive?: boolean;
};

export type TenantUpdateData = Prisma.TenantUpdateInput;

export type TenantListItem = Prisma.TenantGetPayload<{}>;

export type CreateHospitalTenantPayload = {
	tenantName: string;
	hospitalName: string;
	hospitalEmail?: string | null;
	adminEmail: string;
	adminPassword: string;
	adminPhone?: string | null;
	isTenantActive?: boolean;
	isAdminActive?: boolean;
	isAdminVerified?: boolean;
};