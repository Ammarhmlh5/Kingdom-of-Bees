import { analyticsMatchingService } from './analytics-matching.service';
import { logger } from '../utils/logger';

import prisma from '../config/prisma';

export interface FlightAssessmentData {
    date: string;
    time: string;
    duration: number;
    beeCount: number;
    notes?: string;
}

export interface PollenAssessmentData {
    date: string;
    time: string;
    duration: number;
    beeCount: number;
    pollenColors?: string;
    notes?: string;
}

export interface WeatherData {
    date: string;
    time: string;
    temperature?: number;
    rainfall?: number;
    notes?: string;
}

export class AssessmentService {
    /**
     * Record flight assessment for a hive
     */
    async recordFlightAssessment(
        apiaryId: string,
        hiveId: string,
        userId: string,
        data: FlightAssessmentData
    ) {
        const dateStr = data.date && data.time ? `${data.date}T${data.time}` : new Date().toISOString();
        const assessmentDate = new Date(dateStr);
        if (isNaN(assessmentDate.getTime())) throw new Error('تاريخ أو وقت غير صالح');
        const hive = await prisma.hive.findUnique({ where: { id: hiveId } });

        const result = await prisma.apiaryOperation.create({
            data: {
                apiaryId,
                hiveId,
                operationType: 'OTHER',
                description: `تقييم طيران النحل للخلية ${hive?.hiveNumber || ''}`,
                operationDate: assessmentDate,
                data: {
                    assessmentType: 'FLIGHT_ASSESSMENT',
                    duration: data.duration,
                    beeCount: data.beeCount,
                    beesPerMinute: Math.round(data.beeCount / data.duration),
                    notes: data.notes
                },
                performedBy: userId
            }
        });

        // Trigger background analytics processing
        analyticsMatchingService.processOperationAsync(
            apiaryId,
            hiveId,
            result.id,
            'FLIGHT_ASSESSMENT',
            data
        );

        return result;
    }

    /**
     * Record pollen assessment for a hive
     */
    async recordPollenAssessment(
        apiaryId: string,
        hiveId: string,
        userId: string,
        data: PollenAssessmentData
    ) {
        const pollenDateStr = data.date && data.time ? `${data.date}T${data.time}` : new Date().toISOString();
        const assessmentDate = new Date(pollenDateStr);
        if (isNaN(assessmentDate.getTime())) throw new Error('تاريخ أو وقت غير صالح');
        const hive = await prisma.hive.findUnique({ where: { id: hiveId } });

        const result = await prisma.apiaryOperation.create({
            data: {
                apiaryId,
                hiveId,
                operationType: 'OTHER',
                description: `تقييم حبوب اللقاح للخلية ${hive?.hiveNumber || ''}`,
                operationDate: assessmentDate,
                data: {
                    assessmentType: 'POLLEN_ASSESSMENT',
                    duration: data.duration,
                    beeCount: data.beeCount,
                    pollenCarryingBees: data.beeCount,
                    pollenColors: data.pollenColors,
                    notes: data.notes
                },
                performedBy: userId
            }
        });

        // Trigger background analytics processing
        analyticsMatchingService.processOperationAsync(
            apiaryId,
            hiveId,
            result.id,
            'POLLEN_ASSESSMENT',
            data
        );

        return result;
    }

    /**
     * Record weather data for an apiary
     */
    async recordWeatherData(
        apiaryId: string,
        userId: string,
        data: WeatherData
    ) {
        const weatherDateStr = data.date && data.time ? `${data.date}T${data.time}` : new Date().toISOString();
        const recordDate = new Date(weatherDateStr);
        if (isNaN(recordDate.getTime())) throw new Error('تاريخ أو وقت غير صالح');

        const result = await prisma.apiaryOperation.create({
            data: {
                apiaryId,
                operationType: 'OTHER',
                description: 'تسجيل بيانات الطقس والظروف الجوية للمنحل',
                operationDate: recordDate,
                data: {
                    assessmentType: 'WEATHER_LOG',
                    temperature: data.temperature,
                    rainfall: data.rainfall,
                    source: 'manual',
                    notes: data.notes
                },
                performedBy: userId
            }
        });

        // Trigger background analytics processing
        analyticsMatchingService.processOperationAsync(
            apiaryId,
            null,
            result.id,
            'WEATHER_LOG',
            data
        );

        return result;
    }

    /**
     * Auto-fetch weather data for a specific date from Open-Meteo Archive API
     * and save as ApiaryOperation
     */
    async recordAutoWeatherData(
        apiaryId: string,
        userId: string,
        date: string
    ) {
        const apiary = await prisma.apiary.findUnique({
            where: { id: apiaryId },
            select: { locationLat: true, locationLng: true, name: true }
        });

        if (!apiary) throw new Error('المنحل غير موجود');
        if (!apiary.locationLat || !apiary.locationLng) throw new Error('المنحل لا يملك إحداثيات موقع');

        const lat = Number(apiary.locationLat);
        const lng = Number(apiary.locationLng);
        if (isNaN(lat) || isNaN(lng)) throw new Error('إحداثيات الموقع غير صالحة');

        // Fetch from Open-Meteo Archive API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(
            `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`فشل جلب بيانات الطقس: ${response.status}`);

        const data: any = await response.json();
        if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
            throw new Error('لا توجد بيانات طقس متاحة لهذا التاريخ');
        }

        const idx = 0;
        const tempMax = data.daily.temperature_2m_max?.[idx];
        const tempMin = data.daily.temperature_2m_min?.[idx];
        const temperature = tempMax != null && tempMin != null
            ? Math.round((tempMax + tempMin) / 2)
            : (tempMax ?? tempMin ?? null);
        const rainfall = data.daily.precipitation_sum?.[idx] ?? 0;
        const windSpeed = data.daily.wind_speed_10m_max?.[idx] ?? null;
        const weatherCode = data.daily.weather_code?.[idx] ?? null;
        const conditions = weatherCode != null ? this.getWeatherConditionText(weatherCode) : 'غير معروف';

        const recordDate = new Date(date);
        if (isNaN(recordDate.getTime())) throw new Error('تاريخ غير صالح');

        const result = await prisma.apiaryOperation.create({
            data: {
                apiaryId,
                operationType: 'OTHER',
                description: `بيانات الطقس التلقائية - ${apiary.name || 'المنحل'} - ${date}`,
                operationDate: recordDate,
                data: {
                    assessmentType: 'WEATHER_LOG',
                    source: 'api',
                    temperature,
                    rainfall,
                    windSpeed,
                    weatherCode,
                    conditions,
                    tempMax,
                    tempMin
                },
                performedBy: userId
            }
        });

        // Also cache to weatherData table
        try {
            await prisma.weatherData.create({
                data: {
                    apiaryId,
                    date: recordDate,
                    time: recordDate,
                    source: 'API',
                    apiProvider: 'Open-Meteo',
                    temperatureCelsius: temperature,
                    rainfallMm: rainfall,
                    windSpeedKmh: windSpeed,
                    conditions
                }
            });
        } catch (cacheError) {
            logger.warn('Failed to cache auto weather data:', cacheError);
        }

        return result;
    }

    private getWeatherConditionText(code: number): string {
        const conditions: Record<number, string> = {
            0: 'صافي', 1: 'صافي في الغالب', 2: 'غائم جزئياً', 3: 'غائم',
            45: 'ضباب', 48: 'ضباب متجمد', 51: 'رذاذ خفيف', 53: 'رذاذ',
            55: 'رذاذ كثيف', 61: 'مطر خفيف', 63: 'مطر', 65: 'مطر غزير',
            71: 'ثلج خفيف', 73: 'ثلج', 75: 'ثلج كثيف', 95: 'عاصفة رعدية'
        };
        return conditions[code] || 'غير معروف';
    }
}

export const assessmentService = new AssessmentService();
