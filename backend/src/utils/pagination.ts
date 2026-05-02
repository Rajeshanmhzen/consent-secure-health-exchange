export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginationResult<T> extends PaginationMeta {
    data: T[];
}

export function normalizePagination(params: PaginationParams) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 10);
    const skip = (page - 1) * limit;
    const take = limit;

    return { page, limit, skip, take };
}

export function buildPaginationResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginationResult<T> {
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
        data,
        total,
        page,
        limit,
        totalPages
    };
}
