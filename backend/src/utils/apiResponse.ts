import {Response} from "express";

interface SuccessResponse<T> {
    success: true;
    message: string;
    data: T;
    meta?: {
        total?: number;
        page?: number;
        pageSize?: number;
    };
    requestId?: string;
};

interface ErrorResponse {
    success: false;
    message: string;
    errors?: any;
    requestId?: string;
};

export const sendSuccess = <T>(
    res: Response,
    message: string,
    data: T,
    statusCode: number = 200,
    meta?: any
) => {
    const requestId = res.locals?.requestId;
    const response: SuccessResponse<T> = {
        success: true,
        message,
        data,
        meta,
        requestId,
    };
    return res.status(statusCode).json(response);
};


export const sendError = (
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: any
) => {
    const requestId = res.locals?.requestId;
    const response: ErrorResponse = {
        success: false,
        message,
        errors,
        requestId,
    };
    return res.status(statusCode).json(response);
};