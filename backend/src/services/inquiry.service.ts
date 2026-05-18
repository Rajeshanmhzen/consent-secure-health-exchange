import { InquiryRepository } from "../repository/inquiry.repository";
import { CreateInquiryPayload, InquiryListParams, UpdateInquiryPayload } from "../types/inquiry.types";
import { AppError } from "../utils/appError";
import { publishRealtimeEvent } from "../socket.io/realtime";

export class InquiryService {
    private repository = new InquiryRepository();

    async create(data: CreateInquiryPayload) {
        const inquiry = await this.repository.create(data);
        publishRealtimeEvent({ type: "INQUIRY_CHANGED", payload: { id: inquiry.id } });
        publishRealtimeEvent({ type: "DASHBOARD_STATS_CHANGED" });
        return inquiry;
    }

    async list(params: InquiryListParams) {
        return await this.repository.list(params);
    }

    async detail(id: string) {
        const inquiry = await this.repository.detail(id);
        if (!inquiry) {
            throw new AppError("Inquiry not found.", 404);
        }
        return inquiry;
    }

    async stats(search?: string) {
        return await this.repository.stats(search);
    }

    async update(id: string, data: UpdateInquiryPayload) {
        await this.detail(id);
        const inquiry = await this.repository.update(id, data);
        publishRealtimeEvent({ type: "INQUIRY_CHANGED", payload: { id: inquiry.id } });
        publishRealtimeEvent({ type: "DASHBOARD_STATS_CHANGED" });
        return inquiry;
    }
}
