interface IFormatPagination <T>{
    data: T[],
    pagination: {total:number; page:number; limit:number; totalPages:number},
    dataKey: string
}

export function formatPagination<T>({data, pagination, dataKey}: IFormatPagination<T>) {
    return {
        [dataKey]: data,
        ...pagination
    } as Record<string, unknown>;
}