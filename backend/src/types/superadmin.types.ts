import { Prisma } from "@prisma/client";

import { PaginationParams } from "../utils/pagination";

export type CreateSuperAdminInput = {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string | null;
    isActive?: boolean;
    isVerified?: boolean;
};

export type CreateSuperAdminPayload = {
    email: string;
    password: string;
    fullName: string;
    phone?: string | null;
    isActive?: boolean;
    isVerified?: boolean;
};

export type UpdateSuperAdminPayload = {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string | null;
    isActive?: boolean;
    isVerified?: boolean;
};

export type SuperAdminUpdateData = Prisma.SuperAdminUpdateInput;

export type SuperAdminListParams = PaginationParams & {
    search?: string;
    isActive?: boolean;
    includeDeleted?: boolean;
    deletedOnly?: boolean;
};

export type SuperAdminWithUser = Prisma.SuperAdminGetPayload<{
    include: { user: true };
}>;
