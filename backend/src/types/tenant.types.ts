import { Prisma, TenantType, UserRole } from "../generated/prisma";

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

export type CreateTenantUserPayload = {
	tenantId: string;
	hospitalId?: string | null;
	email: string;
	password: string;
	role: UserRole;
	phone?: string | null;
	isActive?: boolean;
	isVerified?: boolean;

	name?: string;
	specialization?: string | null;
	dob?: Date | null;
	gender?: string | null;
	bloodGroup?: string | null;
	allergies?: string | null;
};

export type UpdateTenantUserPayload = {
	email?: string;
	password?: string;
	phone?: string | null;
	isActive?: boolean;
	isVerified?: boolean;

	name?: string;
	specialization?: string | null;
	dob?: Date | null;
	gender?: string | null;
	bloodGroup?: string | null;
	allergies?: string | null;
};

export type UpdateTenantUserInput = Omit<UpdateTenantUserPayload, "password"> & {
	passwordHash?: string;
};

export type TenantUserListParams = PaginationParams & {
	tenantId: string;
	role?: UserRole;
	isActive?: boolean;
	includeDeleted?: boolean;
	deletedOnly?: boolean;
};

export type TenantUserWithProfile = Prisma.UserGetPayload<{
	include: {
		doctor: true;
		patient: true;
		receptionist: true;
	};
}>;
