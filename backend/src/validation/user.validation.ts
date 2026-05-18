import { z } from "zod";

export const updateNotificationPreferenceSchema = z.object({
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    inAppEnabled: z.boolean().optional()
}).refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one notification setting is required"
);
