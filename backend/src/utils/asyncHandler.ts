import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, isAppError } from "./appError";

export function asynHandler(fn:Function) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try{
            const result = await fn(req,res,next);
            return result;
        } catch(error:any) {
            if(res.headersSent) {
                return next(error);
            }
            if (error instanceof ZodError) {
                const appError = new AppError(
                    "Validation failed",
                    400,
                    "VALIDATION_ERROR",
                    error.flatten()
                );
                return res.status(appError.statusCode).json({
                    message: appError.message,
                    code: appError.code,
                    details: appError.details
                });
            }
            if(isAppError(error)) {
                return res.status(error.statusCode).json({
                    message: error.message,
                    code: error.code,
                    details: error.details
                });
            }
            return res.status(500).json({ message: "Internal Server Error" });
        }
    };
};