
import { ApiaryType, Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { apiaryRepository } from '../repositories/apiary.repository';
import { logger } from '../utils/logger';

export class ApiaryService {

    async getMyApiaries(userId: string) {
        // Auto-migrate legacy data from the old usage
        const legacyId = "550e8400-e29b-41d4-a716-446655440000";
        if (userId !== legacyId) {
            await apiaryRepository.migrateLegacyApiaries(legacyId, userId);
        }

        return apiaryRepository.findAllForUser(userId);
    }

    async getApiaryDetails(apiaryId: string, userId: string) {
        // Guard has already checked basic access, but we might want detailed check
        const apiary = await apiaryRepository.findByIdAndAccess(apiaryId, userId);
        if (!apiary) throw new Error('Apiary not found');
        return apiary;
    }

    async createApiary(userId: string, data: {
        name: string, type: string, locationLat?: number, locationLng?: number,
        hivesConfig?: { templateId: string; count: number }[],
        hivesCounts?: { langstroth?: number; traditional?: number; nuc?: number },
        initialHiveCount?: number,
        establishedDate?: string, workerCount?: number, isPublic?: boolean
    }) {
        const typeMapping: Record<string, ApiaryType> = {
            'FIXED': 'STATIONARY',
            'MOBILE': 'MIGRATORY',
            'STATIONARY': 'STATIONARY',
            'MIGRATORY': 'MIGRATORY',
        };
        const mappedType = typeMapping[data.type] || 'STATIONARY';

        let totalHives = data.initialHiveCount ?? 0;
        if (data.hivesConfig && data.hivesConfig.length > 0) {
            totalHives = data.hivesConfig.reduce((sum, c) => sum + c.count, 0);
        } else if (data.hivesCounts) {
            totalHives = (data.hivesCounts.langstroth ?? 0)
                + (data.hivesCounts.traditional ?? 0)
                + (data.hivesCounts.nuc ?? 0);
        }

        const apiary = await apiaryRepository.create({
            owner: { connect: { id: userId } },
            name: data.name,
            type: mappedType,
            locationLat: data.locationLat,
            locationLng: data.locationLng,
            establishedDate: data.establishedDate ? new Date(data.establishedDate) : undefined,
            initialHiveCount: totalHives,
            currentHiveCount: totalHives,
            isActive: true,
            settings: {},
            equipment: {}
        });

        if (totalHives > 0) {
            const hiveRecords: Prisma.HiveCreateManyInput[] = [];
            let hiveCounter = 1;

            if (data.hivesConfig && data.hivesConfig.length > 0) {
                const templateIds = data.hivesConfig.map(c => c.templateId);
                const templates = await prisma.hiveTemplate.findMany({
                    where: { id: { in: templateIds } }
                });
                const templateMap = new Map(templates.map(t => [t.id, t]));

                for (const config of data.hivesConfig) {
                    const template = templateMap.get(config.templateId);
                    if (!template) continue;

                    for (let i = 0; i < config.count; i++) {
                        hiveRecords.push({
                            apiaryId: apiary.id,
                            hiveNumber: String(hiveCounter++).padStart(3, '0'),
                            hiveTypeId: template.hiveTypeId,
                            stories: template.stories ?? 1,
                            framesPerBox: template.framesPerBox ?? 10,
                            frameSize: template.frameSize ?? null,
                            status: 'ACTIVE',
                        });
                    }
                }
            } else if (data.hivesCounts) {
                const typeNameMap: Record<string, string> = {
                    langstroth: 'Langstroth',
                    traditional: 'Baladi',
                    nuc: 'Langstroth',
                };

                const neededTypes = [...new Set(
                    Object.entries(data.hivesCounts)
                        .filter(([, count]) => count && count > 0)
                        .map(([key]) => typeNameMap[key] || 'Langstroth')
                )];

                const hiveTypes = await prisma.hiveType.findMany({
                    where: { nameEn: { in: neededTypes } }
                });
                const hiveTypeMap = new Map(hiveTypes.map(t => [t.nameEn, t.id]));

                for (const [key, count] of Object.entries(data.hivesCounts)) {
                    if (!count || count <= 0) continue;
                    const typeName = typeNameMap[key] || 'Langstroth';
                    const hiveTypeId = hiveTypeMap.get(typeName);
                    if (!hiveTypeId) continue;

                    for (let i = 0; i < count; i++) {
                        hiveRecords.push({
                            apiaryId: apiary.id,
                            hiveNumber: String(hiveCounter++).padStart(3, '0'),
                            hiveTypeId,
                            status: 'ACTIVE',
                        });
                    }
                }
            } else if (data.initialHiveCount && data.initialHiveCount > 0) {
                const defaultType = await prisma.hiveType.findFirst({
                    where: { nameEn: 'Langstroth' }
                });
                if (defaultType) {
                    for (let i = 0; i < data.initialHiveCount; i++) {
                        hiveRecords.push({
                            apiaryId: apiary.id,
                            hiveNumber: String(hiveCounter++).padStart(3, '0'),
                            hiveTypeId: defaultType.id,
                            status: 'ACTIVE',
                        });
                    }
                }
            }

            if (hiveRecords.length > 0) {
                await prisma.hive.createMany({ data: hiveRecords });
            }
        }

        return prisma.apiary.findUnique({
            where: { id: apiary.id },
            include: { _count: { select: { hives: true, members: true } } }
        });
    }

    async updateApiary(apiaryId: string, userId: string, data: any) {
        // Ensure Owner
        const apiary = await apiaryRepository.findById(apiaryId);
        if (!apiary || apiary.ownerId !== userId) {
            throw new Error('Only the owner can edit apiary settings');
        }

        return apiaryRepository.update(apiaryId, data);
    }

    async deleteApiary(apiaryId: string, userId: string) {
        // Ensure Owner
        const apiary = await apiaryRepository.findById(apiaryId);
        if (!apiary || apiary.ownerId !== userId) {
            throw new Error('Only the owner can delete an apiary');
        }
        return apiaryRepository.softDelete(apiaryId);
    }

    async getDashboardStats(userId: string) {
        // Fetch accurate metrics directly from repository aggregation
        const metrics = await apiaryRepository.getDashboardMetrics(userId);
        const apiaries = await apiaryRepository.findAllForUser(userId);

        const totalHives = metrics.hives.length;
        const activeAlerts = metrics.activeAlerts;

        // Calculate Conditions
        let totalConditions = { excellent: 0, good: 0, weak: 0, needsInspection: 0 };
        const now = new Date();

        metrics.hives.forEach((hive: any) => {
            const rating = hive.strengthRating;
            const dueDate = hive.nextInspectionDue ? new Date(hive.nextInspectionDue) : null;

            if (!rating || (dueDate && dueDate < now)) {
                totalConditions.needsInspection++;
            }

            if (rating === 'EXCELLENT') totalConditions.excellent++;
            else if (rating === 'GOOD' || rating === 'VERY_GOOD') totalConditions.good++;
            else if (rating === 'WEAK' || rating === 'CRITICAL') totalConditions.weak++;
        });


        // Calculate Health Percentage (excluding hives that need inspection from the base if they have no rating)
        const ratedHivesCount = totalConditions.excellent + totalConditions.good + totalConditions.weak;
        const healthPercentage = ratedHivesCount > 0
            ? Math.round(((totalConditions.excellent + totalConditions.good) / ratedHivesCount) * 100)
            : 0;

        // Calculate Expected Production (Heuristic: Average 5kg per hive, adjusted by health)
        // Strong hives might produce 10kg, Weak 1kg.
        const expectedProduction = (totalConditions.excellent * 10) + (totalConditions.good * 5) + (totalConditions.weak * 1);

        const recommendations: { type: 'weather' | 'health' | 'alert', message: string, icon: string, time: string }[] = [];

        // 1. Weather Recommendation - Try to get real weather for the first apiary
        let weatherMessage = "";
        if (apiaries.length > 0) {
            try {
                const weather = await this.getWeather(userId, apiaries[0].id);
                if (!weather.isDefault) {
                    if (weather.temperature > 35) {
                        weatherMessage = `درجة الحرارة مرتفعة (${weather.temperature}°م). تأكد من تظليل الخلايا وتوفير مياه قريبة.`;
                    } else if (weather.temperature < 15) {
                        weatherMessage = `الأجواء باردة (${weather.temperature}°م). قلل من فحص الخلايا لتجنب فقدان الحرارة.`;
                    } else {
                        weatherMessage = `الطقس حالياً ${weather.conditions} (${weather.temperature}°م). وقت مثالي للقيام بعمليات الفحص.`;
                    }
                }
            } catch (e) {
                // Fallback to month-based if weather fetch fails
            }
        }

        if (!weatherMessage) {
            const currentMonth = new Date().getMonth();
            if (currentMonth >= 5 && currentMonth <= 8) { // Summer
                weatherMessage = "درجات الحرارة مرتفعة في هذا الموسم. تأكد من توفر مصادر المياه وتظليل الخلايا.";
            } else if (currentMonth >= 0 && currentMonth <= 1) { // Winter
                weatherMessage = "الأجواء باردة ليلاً. تأكد من تقليل فتحات السروح وضم الطوائف الضعيفة.";
            } else {
                weatherMessage = "الطقس معتدل ومناسب لفحص الخلايا وجمع حبوب اللقاح.";
            }
        }

        recommendations.push({
            type: 'weather',
            message: weatherMessage,
            icon: 'thermometer',
            time: 'مباشر'
        });

        // 2. Health Recommendation
        if (totalConditions.needsInspection > 0) {
            recommendations.push({
                type: 'health',
                message: `لديك ${totalConditions.needsInspection} خلايا بحاجة لفحص عاجل لتحديث حالتها الصحية.`,
                icon: 'activity',
                time: 'تنبيه النظام'
            });
        } else if (healthPercentage < 80) {
            recommendations.push({
                type: 'health',
                message: `هناك ${totalConditions.weak} خلايا بحالة ضعيفة تتطلب التدخل الغذائي أو التقوية.`,
                icon: 'activity',
                time: 'بناءً على السجلات'
            });
        } else {
            recommendations.push({
                type: 'health',
                message: "غالبية الخلايا في حالة ممتازة. وقت مناسب للتوسع أو تقسيم الخلايا القوية.",
                icon: 'activity',
                time: 'بناءً على السجلات'
            });
        }

        // 3. Alerts Recommendation
        if (activeAlerts > 0) {
            recommendations.push({
                type: 'alert',
                message: `لدينا ${activeAlerts} تنبيهات نشطة تتطلب اهتمامك الفوري.`,
                icon: 'alert',
                time: 'الآن'
            });
        }

        // Calculate Assessments
        const assessments = this.calculateAggregateAssessments(metrics.hives);
        const feedingRecommendation = this.generateFeedingRecommendation(assessments);

        return {
            totalHives,
            healthPercentage,
            expectedProduction,
            activeAlerts,
            needsInspection: totalConditions.needsInspection,
            ...assessments,
            feedingRecommendation,
            recommendations
        };
    }

    async getApiaryStats(userId: string, apiaryId: string) {
        // Ensure user has access
        await this.getApiaryDetails(apiaryId, userId);

        const metrics = await apiaryRepository.getApiaryMetricsForApiary(apiaryId);

        const totalHives = metrics.hives.length;
        const activeAlerts = metrics.activeAlerts;

        // Calculate Conditions
        let totalConditions = { excellent: 0, good: 0, weak: 0, needsInspection: 0 };
        const now = new Date();

        metrics.hives.forEach((hive: any) => {
            const rating = hive.strengthRating;
            const dueDate = hive.nextInspectionDue ? new Date(hive.nextInspectionDue) : null;

            if (!rating || (dueDate && dueDate < now)) {
                totalConditions.needsInspection++;
            }

            if (rating === 'EXCELLENT') totalConditions.excellent++;
            else if (rating === 'GOOD' || rating === 'VERY_GOOD') totalConditions.good++;
            else if (rating === 'WEAK' || rating === 'CRITICAL') totalConditions.weak++;
        });


        // Calculate Health Percentage
        const ratedHivesCount = totalConditions.excellent + totalConditions.good + totalConditions.weak;
        const healthPercentage = ratedHivesCount > 0
            ? Math.round(((totalConditions.excellent + totalConditions.good) / ratedHivesCount) * 100)
            : 0;

        // Calculate Expected Production
        const expectedProduction = (totalConditions.excellent * 10) + (totalConditions.good * 5) + (totalConditions.weak * 1);

        // Calculate Assessments
        const assessments = this.calculateAggregateAssessments(metrics.hives);
        const feedingRecommendation = this.generateFeedingRecommendation(assessments);

        return {
            totalHives,
            healthPercentage,
            expectedProduction,
            activeAlerts,
            needsInspection: totalConditions.needsInspection,
            ...assessments,
            feedingRecommendation
        };
    }

    async getWeather(userId: string, apiaryId: string) {
        const apiary = await this.getApiaryDetails(apiaryId, userId);

        if (!apiary.locationLat || !apiary.locationLng) {
            return {
                temperature: 30,
                humidity: 20,
                rainfall: 0,
                windSpeed: 10,
                conditions: 'Clear',
                isDefault: true
            };
        }

        const lat = Number(apiary.locationLat);
        const lng = Number(apiary.locationLng);

        // Check cache: return recent API data (within 30 min) to avoid rate limits
        try {
            const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
            const cached = await prisma.weatherData.findFirst({
                where: { apiaryId, source: 'API', createdAt: { gte: thirtyMinAgo } },
                orderBy: { createdAt: 'desc' }
            });
            if (cached) {
                return {
                    temperature: Number(cached.temperatureCelsius),
                    humidity: cached.humidityPercentage,
                    rainfall: Number(cached.rainfallMm),
                    windSpeed: Number(cached.windSpeedKmh),
                    conditions: cached.conditions || 'غير معروف',
                    lastUpdate: cached.createdAt.toISOString(),
                    isDefault: false
                };
            }
        } catch (cacheError) {
            logger.warn('Weather cache check failed, fetching fresh:', cacheError);
        }

        // Fetch from Open-Meteo with 10s timeout
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`Weather API responded with ${response.status}`);

            const data: any = await response.json();

            if (!data.current) throw new Error('Weather API returned unexpected data shape');

            const conditions = this.getWeatherConditionText(data.current.weather_code);

            const weatherResult = {
                temperature: Math.round(data.current.temperature_2m),
                humidity: data.current.relative_humidity_2m,
                rainfall: data.current.precipitation ?? 0,
                windSpeed: Math.round(data.current.wind_speed_10m),
                weatherCode: data.current.weather_code,
                conditions,
                lastUpdate: new Date().toISOString(),
                isDefault: false
            };

            // Cache asynchronously (don't block response)
            try {
                await prisma.weatherData.create({
                    data: {
                        apiaryId,
                        date: new Date(),
                        time: new Date(),
                        source: 'API',
                        apiProvider: 'Open-Meteo',
                        temperatureCelsius: data.current.temperature_2m,
                        humidityPercentage: data.current.relative_humidity_2m,
                        rainfallMm: data.current.precipitation ?? 0,
                        windSpeedKmh: data.current.wind_speed_10m,
                        conditions
                    }
                });
            } catch (cacheSaveError) {
                logger.warn('Failed to cache weather data:', cacheSaveError);
            }

            return weatherResult;
        } catch (error) {
            logger.error('Weather fetch error:', error);

            // Fallback: try any cached data (even stale)
            try {
                const staleCache = await prisma.weatherData.findFirst({
                    where: { apiaryId, source: 'API' },
                    orderBy: { createdAt: 'desc' }
                });
                if (staleCache) {
                    return {
                        temperature: Number(staleCache.temperatureCelsius),
                        humidity: staleCache.humidityPercentage,
                        rainfall: Number(staleCache.rainfallMm),
                        windSpeed: Number(staleCache.windSpeedKmh),
                        conditions: staleCache.conditions || 'غير معروف',
                        lastUpdate: staleCache.createdAt.toISOString(),
                        isDefault: false
                    };
                }
            } catch { /* ignore fallback errors */ }

            // Ultimate fallback: realistic default for Saudi Arabia
            return {
                temperature: 30,
                humidity: 20,
                rainfall: 0,
                windSpeed: 10,
                conditions: 'صافي',
                lastUpdate: new Date().toISOString(),
                isDefault: true
            };
        }
    }

    private calculateAggregateAssessments(hives: any[]) {
        let totalPollen = 0;
        let totalBrood = 0;
        let totalHoney = 0;
        let frameCount = 0;

        hives.forEach(hive => {
            // Priority 1: Frames data
            if (hive.frames && hive.frames.length > 0) {
                totalPollen += hive.frames.reduce((sum: number, f: any) => sum + (f.pollenPercentage || 0), 0) / hive.frames.length;
                totalBrood += hive.frames.reduce((sum: number, f: any) => sum + (f.broodPercentage || 0), 0) / hive.frames.length;
                totalHoney += hive.frames.reduce((sum: number, f: any) => sum + (f.honeyPercentage || 0), 0) / hive.frames.length;
                frameCount++;
            } 
            // Priority 2: Latest Inspection data (normalized to percentages roughly)
            else if (hive.inspections && hive.inspections.length > 0) {
                const ins = hive.inspections[0];
                // Assuming 10 frames box, 1 frame is 10%
                totalPollen += (ins.pollenFramesCount || 0) * 10;
                totalBrood += (ins.broodFramesCount || 0) * 10;
                totalHoney += (ins.honeyFramesCount || 0) * 10;
                frameCount++;
            }
        });

        return {
            avgPollen: frameCount > 0 ? Math.round(totalPollen / frameCount) : 0,
            avgBrood: frameCount > 0 ? Math.round(totalBrood / frameCount) : 0,
            avgHoney: frameCount > 0 ? Math.round(totalHoney / frameCount) : 0
        };
    }

    private getWeatherConditionText(code: number): string {
        const conditions: { [key: number]: string } = {
            0: 'صافي', 1: 'صافي في الغالب', 2: 'غائم جزئياً', 3: 'غائم',
            45: 'ضباب', 48: 'ضباب متجمد', 51: 'رذاذ خفيف', 53: 'رذاذ',
            55: 'رذاذ كثيف', 61: 'مطر خفيف', 63: 'مطر', 65: 'مطر غزير',
            71: 'ثلج خفيف', 73: 'ثلج', 75: 'ثلج كثيف', 95: 'عاصفة رعدية'
        };
        return conditions[code] || 'غير معروف';
    }

    private generateFeedingRecommendation(assessments: { avgPollen: number, avgBrood: number, avgHoney: number }) {
        const currentMonth = new Date().getMonth() + 1; // 1-12
        let recommendedType = 'لا توجد توصية حالياً';
        let recommendedQuantity = 0;
        let unit = '';
        let priority = 'عادي';
        let reasoning = 'المخزون الحالي كافٍ للفترة الحالية.';

        // 1. Sidr Season (Sept-Oct) in Saudi Arabia - Do not feed!
        if (currentMonth >= 9 && currentMonth <= 10) {
            return {
                recommendedType: 'توقف عن التغذية',
                recommendedQuantity: 0,
                unit: '',
                priority: 'هام',
                reasoning: 'نحن في موسم السدر (سبتمبر - أكتوبر). يجب التوقف عن التغذية السكرية لمنع غش العسل.'
            };
        }

        // 2. Winter/Cold Season (Dec - Jan) - Maintenance, thick syrup
        if (currentMonth === 12 || currentMonth === 1) {
            if (assessments.avgHoney < 20) {
                recommendedType = 'محلول سكري مركّز (2:1)';
                recommendedQuantity = 1.5;
                unit = 'لتر/خلية';
                priority = 'عاجل';
                reasoning = 'مخزون العسل منخفض جداً والجو بارد. المحلول المركز (سكر أكثر) يوفر طاقة ممتازة للتدفئة.';
            } else if (assessments.avgHoney < 40) {
                recommendedType = 'محلول سكري مركّز (2:1) أو عجينة فوندان';
                recommendedQuantity = 1.0;
                unit = 'لتر/خلية';
                priority = 'متوسط';
                reasoning = 'مخزون العسل متوسط. يفضل تقديم تغذية داعمة للحفاظ على قوة الخلية خلال الشتاء.';
            }
        } 
        // 3. Spring Build-up (Feb-Apr) - Expansion, thin syrup & pollen
        else if (currentMonth >= 2 && currentMonth <= 4) {
            if (assessments.avgBrood > 30 && assessments.avgPollen < 15) {
                recommendedType = 'عجينة بروتينية (بدائل حبوب اللقاح) مع محلول مخفف (1:1)';
                recommendedQuantity = 0.5; // Kg protein + some syrup
                unit = 'كجم عجينة + 1 لتر/خلية';
                priority = 'عاجل';
                reasoning = 'الملكة نشطة في الربيع والمخزون البروتيني ضعيف. العجينة البروتينية ضرورية لبناء حضنة قوية.';
            } else if (assessments.avgHoney < 30) {
                recommendedType = 'محلول سكري مخفف (1:1)';
                recommendedQuantity = 1.5;
                unit = 'لتر/خلية';
                priority = 'عالي';
                reasoning = 'لتشجيع الملكة على الاستمرار في وضع البيض في بداية الربيع (تغذية تحفيزية).';
            }
        }
        // 4. Summer Dearth (June - August) - Maintenance
        else if (currentMonth >= 6 && currentMonth <= 8) {
            if (assessments.avgPollen < 10) {
                 recommendedType = 'عجينة بروتينية خفيفة';
                 recommendedQuantity = 0.5;
                 unit = 'كجم/خلية';
                 priority = 'عالي';
                 reasoning = 'شح المراعي في الصيف يتطلب دعم بروتيني للحفاظ على عمر الشغالات.';
            } else if (assessments.avgHoney < 25) {
                 recommendedType = 'محلول سكري (1:1)';
                 recommendedQuantity = 1.0;
                 unit = 'لتر/خلية';
                 priority = 'متوسط';
                 reasoning = 'دعم السائل لتقليل إجهاد النحل في البحث عن الرحيق والمياه.';
            }
        }
        // General checks for other months
        else {
             if (assessments.avgHoney < 20) {
                recommendedType = 'محلول سكري (1:1)';
                recommendedQuantity = 1.0;
                unit = 'لتر/خلية';
                priority = 'عالي';
                reasoning = 'مخزون العسل منخفض جداً ويشكل خطراً على الطائفة.';
             }
        }

        return {
            recommendedType,
            recommendedQuantity,
            unit,
            priority,
            reasoning
        };
    }
}
