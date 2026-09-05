import { NextFunction, Request, Response } from "express";

export type ApiPerformanceStatus = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ApiPerformanceMetric = {
    route: string;
    requests: number;
    errors: number;
    errorRate: number;
    averageLatencyMs: number;
    lastLatencyMs: number;
    status: ApiPerformanceStatus;
};

type RequestSample = {
    latencyMs: number;
    isError: boolean;
    recordedAt: number;
};

const WINDOW_MS = 5 * 60 * 1000;
const MAX_SAMPLES_PER_ROUTE = 200;
const samplesByRoute = new Map<string, RequestSample[]>();

const getStatus = (averageLatencyMs: number, errorRate: number): ApiPerformanceStatus => {
    if (averageLatencyMs >= 1000 || errorRate >= 0.1) return "CRITICAL";
    if (averageLatencyMs >= 500 || errorRate >= 0.05) return "HIGH";
    if (averageLatencyMs >= 200 || errorRate >= 0.01) return "MEDIUM";
    return "LOW";
};

const getRoute = (req: Request) => `${req.method} ${req.baseUrl}${req.path}`;

export const trackApiPerformance = (req: Request, res: Response, next: NextFunction) => {
    const startedAt = process.hrtime.bigint();

    res.on("finish", () => {
        const route = getRoute(req);
        const latencyMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        const samples = samplesByRoute.get(route) ?? [];
        const now = Date.now();

        samples.push({
            latencyMs,
            isError: res.statusCode >= 500,
            recordedAt: now
        });

        samplesByRoute.set(
            route,
            samples.filter(sample => sample.recordedAt >= now - WINDOW_MS).slice(-MAX_SAMPLES_PER_ROUTE)
        );
    });

    next();
};

export const getApiPerformance = (page = 1, limit = 8): {
    windowMinutes: number;
    overall: ApiPerformanceMetric;
    endpoints: ApiPerformanceMetric[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
} => {
    const now = Date.now();
    const metrics = Array.from(samplesByRoute.entries()).map(([route, routeSamples]) => {
        const samples = routeSamples.filter(sample => sample.recordedAt >= now - WINDOW_MS);
        samplesByRoute.set(route, samples);

        const requests = samples.length;
        const errors = samples.filter(sample => sample.isError).length;
        const averageLatencyMs = requests === 0
            ? 0
            : samples.reduce((total, sample) => total + sample.latencyMs, 0) / requests;

        return {
            route,
            requests,
            errors,
            errorRate: requests === 0 ? 0 : errors / requests,
            averageLatencyMs,
            lastLatencyMs: samples.at(-1)?.latencyMs ?? 0,
            status: getStatus(averageLatencyMs, requests === 0 ? 0 : errors / requests)
        } satisfies ApiPerformanceMetric;
    }).filter(metric => metric.requests > 0);

    const allSamples = metrics.flatMap(metric => {
        const routeSamples = samplesByRoute.get(metric.route) ?? [];
        return routeSamples;
    });
    const errors = allSamples.filter(sample => sample.isError).length;
    const averageLatencyMs = allSamples.length === 0
        ? 0
        : allSamples.reduce((total, sample) => total + sample.latencyMs, 0) / allSamples.length;
    const errorRate = allSamples.length === 0 ? 0 : errors / allSamples.length;

    const sortedMetrics = metrics.sort((a, b) => b.requests - a.requests);
    const total = sortedMetrics.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    return {
        windowMinutes: WINDOW_MS / 60_000,
        overall: {
            route: "ALL API ROUTES",
            requests: allSamples.length,
            errors,
            errorRate,
            averageLatencyMs,
            lastLatencyMs: allSamples.at(-1)?.latencyMs ?? 0,
            status: getStatus(averageLatencyMs, errorRate)
        },
        endpoints: sortedMetrics.slice((currentPage - 1) * limit, currentPage * limit),
        pagination: { total, page: currentPage, limit, totalPages }
    };
};