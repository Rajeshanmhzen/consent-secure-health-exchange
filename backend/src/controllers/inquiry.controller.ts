import { Request, Response } from "express";
import { InquiryService } from "../services/inquiry.service";
import { CreateInquiryPayload, InquiryListParams, UpdateInquiryPayload } from "../types/inquiry.types";
import { createInquirySchema, inquiryIdParamSchema, inquiryStatsSchema, listInquirySchema, updateInquirySchema } from "../validation/inquiry.validation";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { formatPagination } from "../utils/formatPagination";

export class InquiryController {
    private service = new InquiryService();

    create = asyncHandler(async (req: Request, res: Response) => {
        const payload = createInquirySchema.parse(req.body) as CreateInquiryPayload;
        const result = await this.service.create(payload);
        return sendSuccess(res, "Inquiry submitted successfully", result, 201);
    });

    list = asyncHandler(async (req: Request, res: Response) => {
        const params = listInquirySchema.parse(req.query) as InquiryListParams;
        const result = await this.service.list(params);
        const formattedResult = formatPagination({
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            },
            dataKey: "inquiries"
        });
        return sendSuccess(res, "Inquiry list fetched successfully", formattedResult);
    });

    detail = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = inquiryIdParamSchema.parse(req.params);
        const result = await this.service.detail(id);
        return sendSuccess(res, "Inquiry details fetched successfully", result);
    });

    stats = asyncHandler(async (req: Request, res: Response) => {
        const params = inquiryStatsSchema.parse(req.query);
        const result = await this.service.stats(params.search);
        return sendSuccess(res, "Inquiry stats fetched successfully", result);
    });

    update = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = inquiryIdParamSchema.parse(req.params);
        const payload = updateInquirySchema.parse(req.body) as UpdateInquiryPayload;
        const result = await this.service.update(id, payload);
        return sendSuccess(res, "Inquiry updated successfully", result);
    });
}
