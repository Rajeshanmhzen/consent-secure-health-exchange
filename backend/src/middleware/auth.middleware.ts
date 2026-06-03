import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/apiResponse";
import { verifyAccessToken } from "../utils/jwt";

export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendError(res, "Unauthorized", 401);
        }

        try {
            const token = authHeader.split(" ")[1];
            const payload = verifyAccessToken(token);
            const role = payload.role as string | undefined;

            if (!role || !allowedRoles.includes(role)) {
                return sendError(res, "Forbidden", 403);
            }

            // Inject user credentials so controllers have access
            (req as any).user = {
                id: payload.sub as string,
                role
            };

            return next();
        } catch {
            return sendError(res, "Invalid or expired token", 401);
        }
    };
};
