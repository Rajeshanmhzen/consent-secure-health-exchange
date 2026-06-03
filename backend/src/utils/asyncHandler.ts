import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError, isAppError } from "./appError";

export function asyncHandler(fn: Function) {
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
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    return res.status(409).json({
                        message: "Duplicate value already exists",
                        code: "UNIQUE_CONSTRAINT_FAILED",
                        details: error.meta
                    });
                }

                if (error.code === "P2003") {
                    return res.status(400).json({
                        message: "Invalid related record id",
                        code: "FOREIGN_KEY_CONSTRAINT_FAILED",
                        details: error.meta
                    });
                }
            }
            console.error("Unhandled request error:", error);

            return res.status(500).json({
                message: "Internal Server Error",
                ...(process.env.NODE_ENV === "production"
                    ? {}
                    : {
                          error: error?.message,
                          stack: error?.stack
                      })
            });
        }
    };
}
