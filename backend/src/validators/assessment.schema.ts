import { z } from 'zod';

export const recordWeatherDataSchema = z.object({
    temperature: z.number().optional(),
    humidity: z.number().min(0).max(100).optional(),
    windSpeed: z.number().min(0).optional(),
    rainfall: z.number().min(0).optional(),
    date: z.string().optional(),
    notes: z.string().optional(),
});

export const recordAutoWeatherDataSchema = z.object({
    date: z.string().min(1, 'التاريخ مطلوب'),
});

export const recordFlightAssessmentSchema = z.object({
    flightActivity: z.string().optional(),
    orientationFlights: z.boolean().optional(),
    foragingActivity: z.string().optional(),
    weatherConditions: z.string().optional(),
    notes: z.string().optional(),
    date: z.string().optional(),
});

export const recordPollenAssessmentSchema = z.object({
    pollenAmount: z.string().optional(),
    pollenColors: z.array(z.string()).optional(),
    forageSources: z.array(z.string()).optional(),
    notes: z.string().optional(),
    date: z.string().optional(),
});
