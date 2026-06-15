import { Request, Response } from "express";
import { RequestService } from "../services/request.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/appError";

export class RequestController {
    private service = new RequestService();

    createRequest = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user || user.role !== "DOCTOR") {
            throw new AppError("Only doctors can submit record access requests.", 403);
        }

        const { patientId, targetDoctorId, reason } = req.body;
        if (!patientId || !targetDoctorId || !reason) {
            throw new AppError("Missing patientId, targetDoctorId or reason justification.", 400);
        }

        const result = await this.service.createRequest(user.id, { patientId, targetDoctorId, reason });
        return sendSuccess(res, "Data access request created successfully. Consent is pending patient approval.", result, 201);
    });

    patientConsent = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user || user.role !== "PATIENT") {
            throw new AppError("Only the patient can manage their personal consent options.", 403);
        }

        const { requestId, action } = req.body;
        if (!requestId || !action || (action !== "APPROVE" && action !== "REJECT")) {
            throw new AppError("Missing requestId or valid action (APPROVE/REJECT).", 400);
        }

        const result = await this.service.processPatientConsent(user.id, requestId, action);
        return sendSuccess(res, `Request successfully ${action.toLowerCase()}ed by patient.`, result);
    });

    sendConsentOtp = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user || user.role !== "PATIENT") {
            throw new AppError("Only the patient can request consent verification.", 403);
        }

        const { requestId } = req.body;
        if (!requestId) {
            throw new AppError("Missing requestId.", 400);
        }

        await this.service.sendConsentOtp(user.id, requestId);
        return sendSuccess(res, "Verification code sent to your registered email.", null);
    });

    verifyConsentOtp = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user || user.role !== "PATIENT") {
            throw new AppError("Only the patient can authorize consent.", 403);
        }

        const { requestId, otpCode } = req.body;
        if (!requestId || !otpCode) {
            throw new AppError("Missing requestId or otpCode.", 400);
        }

        const result = await this.service.verifyConsentOtp(user.id, requestId, otpCode);
        return sendSuccess(res, "Consent authorized successfully via OTP verification.", result);
    });

    hospitalConsent = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user || user.role !== "DOCTOR") {
            throw new AppError("Only clinical target doctors can authorize cross-hospital releases.", 403);
        }

        const { requestId, action } = req.body;
        if (!requestId || !action || (action !== "APPROVE" && action !== "REJECT")) {
            throw new AppError("Missing requestId or valid action (APPROVE/REJECT).", 400);
        }

        const result = await this.service.processHospitalConsent(user.id, requestId, action);
        return sendSuccess(res, `Request successfully ${action.toLowerCase()}ed by hospital custodian.`, result);
    });

    listRequests = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user) {
            throw new AppError("Unauthorized session.", 401);
        }

        const result = await this.service.listRequests(user.id, user.role);
        return sendSuccess(res, "Data requests list fetched successfully.", result);
    });

    listAllPatients = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user) {
            throw new AppError("Unauthorized session.", 401);
        }
        const hospitalId = (req.query.hospitalId as string) || undefined;
        const result = await this.service.listAllPatients(hospitalId);
        return sendSuccess(res, "Patients fetched.", result);
    });

    listAllDoctors = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user) {
            throw new AppError("Unauthorized session.", 401);
        }
        const hospitalId = (req.query.hospitalId as string) || undefined;
        const result = await this.service.listAllDoctors(user.id, hospitalId);
        return sendSuccess(res, "Doctors fetched.", result);
    });

    listAllHospitals = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user) {
            throw new AppError("Unauthorized session.", 401);
        }
        const result = await this.service.listAllHospitals();
        return sendSuccess(res, "Hospitals fetched.", result);
    });

    getSharedRecords = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user || user.role !== "DOCTOR") {
            throw new AppError("Only licensed clinicians are authorized to access shared records.", 403);
        }

        const { requestId } = req.params as { requestId: string };
        if (!requestId) {
            throw new AppError("Missing required requestId parameter.", 400);
        }

        const result = await this.service.getSharedRecords(user.id, requestId);
        return sendSuccess(res, "Decrypted shared records fetched successfully.", result);
    });
}
