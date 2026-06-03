import { Inquiry, Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { buildPaginationResult, normalizePagination, PaginationResult } from "../utils/pagination";
import { CreateInquiryPayload, InquiryListParams, UpdateInquiryPayload } from "../types/inquiry.types";

export class InquiryRepository {
    async create(data: CreateInquiryPayload): Promise<Inquiry> {
        return await prisma.inquiry.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                workEmail: data.workEmail,
                phoneNumber: data.phoneNumber ?? null,
                organization: data.organization ?? null,
                inquiryType: data.inquiryType,
                message: data.message
            }
        });
    }

    async detail(id: string): Promise<Inquiry | null> {
        return await prisma.inquiry.findUnique({ where: { id } });
    }

    async list(params: InquiryListParams): Promise<PaginationResult<Inquiry>> {
        const { page, limit, skip, take } = normalizePagination(params);
        const where: Prisma.InquiryWhereInput = {};

        if (params.status) {
            where.status = params.status;
        }

        if (params.search) {
            where.OR = [
                { firstName: { contains: params.search, mode: "insensitive" } },
                { lastName: { contains: params.search, mode: "insensitive" } },
                { workEmail: { contains: params.search, mode: "insensitive" } },
                { organization: { contains: params.search, mode: "insensitive" } },
                { inquiryType: { contains: params.search, mode: "insensitive" } }
            ];
        }

        const [total, data] = await prisma.$transaction([
            prisma.inquiry.count({ where }),
            prisma.inquiry.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" }
            })
        ]);

        return buildPaginationResult(data, total, page, limit);
    }

    async stats(search?: string) {
        const where: Prisma.InquiryWhereInput = search
            ? {
                  OR: [
                      { firstName: { contains: search, mode: "insensitive" } },
                      { lastName: { contains: search, mode: "insensitive" } },
                      { workEmail: { contains: search, mode: "insensitive" } },
                      { organization: { contains: search, mode: "insensitive" } },
                      { inquiryType: { contains: search, mode: "insensitive" } }
                  ]
              }
            : {};

        const [total, pending, inProgress, resolved] = await prisma.$transaction([
            prisma.inquiry.count({ where }),
            prisma.inquiry.count({ where: { ...where, status: "PENDING" } }),
            prisma.inquiry.count({ where: { ...where, status: "IN_PROGRESS" } }),
            prisma.inquiry.count({ where: { ...where, status: "RESOLVED" } })
        ]);

        return { total, pending, inProgress, resolved };
    }

    async update(id: string, data: UpdateInquiryPayload): Promise<Inquiry> {
        return await prisma.inquiry.update({
            where: { id },
            data: { status: data.status }
        });
    }
}
