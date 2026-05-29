import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/apiResponse";
import { verifyAccessToken } from "../utils/jwt";

// ================= RBAC PERMISSIONS =================
export type Permission =
    | "SUPER_ADMIN_MANAGE"
    
    | "TENANT_CREATE"
    | "TENANT_LIST"
    | "TENANT_VIEW"
    | "TENANT_EDIT"
    | "TENANT_DELETE"
    
    | "USER_CREATE"
    | "USER_LIST"
    | "USER_EDIT"
    | "USER_DELETE"
    
    | "PLAN_MANAGE"
    | "PLAN_VIEW"
    
    | "SUBSCRIPTION_MANAGE"
    | "SUBSCRIPTION_VIEW"
    | "PREFERENCES_MANAGE"
    | "DATA_REQUEST_CREATE"
    | "DATA_REQUEST_LIST"
    | "CONSENT_MANAGE"
    | "EMERGENCY_OVERRIDE";

// ================= ROLE TO PERMISSIONS MAP =================
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    SUPER_ADMIN: [
        "SUPER_ADMIN_MANAGE",
        "TENANT_CREATE",
        "TENANT_LIST",
        "TENANT_VIEW",
        "TENANT_EDIT",
        "TENANT_DELETE",
        "USER_CREATE",
        "USER_LIST",
        "USER_EDIT",
        "USER_DELETE",
        "PLAN_MANAGE",
        "PLAN_VIEW",
        "SUBSCRIPTION_MANAGE",
        "SUBSCRIPTION_VIEW",
        "PREFERENCES_MANAGE",
        "DATA_REQUEST_CREATE",
        "DATA_REQUEST_LIST",
        "CONSENT_MANAGE",
        "EMERGENCY_OVERRIDE"
    ],
    HOSPITAL_ADMIN: [
        "TENANT_VIEW",
        "TENANT_EDIT",
        "USER_CREATE",
        "USER_LIST",
        "USER_EDIT",
        "USER_DELETE",
        "PLAN_VIEW",
        "PREFERENCES_MANAGE",
        "DATA_REQUEST_LIST"
    ],
    DOCTOR: [
        "USER_LIST",
        "PLAN_VIEW",
        "PREFERENCES_MANAGE",
        "DATA_REQUEST_CREATE",
        "DATA_REQUEST_LIST",
        "EMERGENCY_OVERRIDE"
    ],
    RECEPTIONIST: [
        "USER_LIST",
        "PREFERENCES_MANAGE"
    ],
    PATIENT: [
        "PREFERENCES_MANAGE",
        "DATA_REQUEST_LIST",
        "CONSENT_MANAGE"
    ]
};

/**
 * Express middleware to enforce Role-Based Access Control (RBAC)
 * validates the client request's JSON Web Token and cross-references
 * their role against the required permissions list.
 */
export const checkPermission = (requiredPermission: Permission) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendError(res, "Unauthorized: Access token is missing", 401);
        }

        try {
            const token = authHeader.split(" ")[1];
            const payload = verifyAccessToken(token);
            const role = payload.role as string | undefined;

            if (!role) {
                return sendError(res, "Forbidden: User role not defined in token credentials", 403);
            }

            const permissions = ROLE_PERMISSIONS[role] || [];
            if (!permissions.includes(requiredPermission)) {
                return sendError(
                    res,
                    `Forbidden: Your role (${role}) does not have the required permission: ${requiredPermission}`,
                    403
                );
            }

            // Inject credentials so that request handlers down the pipeline have access to it
            (req as any).user = {
                id: payload.sub as string,
                role
            };

            return next();
        } catch {
            return sendError(res, "Unauthorized: Invalid or expired session credentials", 401);
        }
    };
};
