import { z } from 'zod';

export const updateNotificationSettingsSchema = z.object({
    channels: z.object({
        push: z.boolean().optional(),
        email: z.boolean().optional(),
        sms: z.boolean().optional(),
    }).optional(),
    types: z.object({
        inspectionReminders: z.boolean().optional(),
        feedingReminders: z.boolean().optional(),
        harvestReminders: z.boolean().optional(),
        diseaseAlerts: z.boolean().optional(),
        swarmAlerts: z.boolean().optional(),
        weatherAlerts: z.boolean().optional(),
    }).optional(),
    quietHours: z.object({
        enabled: z.boolean(),
        start: z.string().optional(),
        end: z.string().optional(),
    }).optional(),
});
