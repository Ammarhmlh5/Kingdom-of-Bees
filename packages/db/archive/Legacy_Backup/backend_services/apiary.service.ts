import { PrismaClient, ApiaryType } from '@prisma/client';
import { apiaryRepository } from '../repositories/apiary.repository';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

interface CreateApiaryData {
    name: string;
    type: ApiaryType;
    locationLat: number;
    locationLng: number;
    establishedDate: Date | string;
    region?: string;
    description?: string;
    workerCount?: number;
    isPublic?: boolean;
    hivesConfig?: { templateId: string; count: number }[];
    hivesCounts?: {
        langstroth: number;
        traditional: number;
        nuc: number;
    };
}

export class ApiaryService {
    async getAll(userId: string) {
        // Get apiaries where user is owner OR member
        const apiaries = await prisma.apiary.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId, status: 'ACTIVE' } } }
                ]
            },
            include: {
                members: {
                    where: { userId },
                    select: { role: true }
                },
                _count: {
                    select: { hives: true }
                }
            }
        });

        // Add userRole to each apiary
        return apiaries.map(apiary => ({
            ...apiary,
            currentHiveCount: apiary._count.hives,
            userRole: apiary.ownerId === userId ? 'OWNER' : apiary.members[0]?.role || 'VIEWER'
        }));
    }

    async getById(id: string, userId: string) {
        const apiary = await apiaryRepository.findById(id, userId);
        if (!apiary) {
            throw new AppError('Apiary not found', 404);
        }
        return apiary;
    }

    async create(data: CreateApiaryData, userId: string) {
        const { hivesConfig, hivesCounts, ...apiaryData } = data;

        // Validate required fields
        if (!apiaryData.name || apiaryData.name.trim().length === 0) {
            throw new AppError('اسم المنحل مطلوب', 400);
        }

        if (!apiaryData.type) {
            throw new AppError('نوع المنحل مطلوب', 400);
        }

        // Check for duplicate name
        const duplicate = await prisma.apiary.findFirst({
            where: {
                ownerId: userId,
                name: apiaryData.name
            }
        });

        if (duplicate) {
            throw new AppError('يوجد منحل بهذا الاسم مسبقاً', 400);
        }


        // Convert establishedDate to Date object if it's a string
        const establishedDate = typeof apiaryData.establishedDate === 'string'
            ? new Date(apiaryData.establishedDate)
            : apiaryData.establishedDate;

        return prisma.$transaction(async (tx) => {
            const apiary = await tx.apiary.create({
                data: {
                    name: apiaryData.name,
                    type: apiaryData.type as ApiaryType, // Explicit cast to enum
                    locationLat: apiaryData.locationLat,
                    locationLng: apiaryData.locationLng,
                    establishedDate: establishedDate,
                    region: apiaryData.region,
                    description: apiaryData.description,
                    workerCount: apiaryData.workerCount || 0,
                    isPublic: apiaryData.isPublic || false,
                    ownerId: userId
                }
            });

            // 1. Template Config Logic
            if (hivesConfig && Array.isArray(hivesConfig)) {
                for (const config of hivesConfig) {
                    const template = await tx.hiveTemplate.findUnique({ where: { id: config.templateId } });
                    if (template) {
                        let hiveCounter = await tx.hive.count({ where: { apiaryId: apiary.id } });

                        for (let i = 0; i < config.count; i++) {
                            hiveCounter++;
                            const hiveNumber = `H-${hiveCounter}`;
                            await tx.hive.create({
                                data: {
                                    apiaryId: apiary.id,
                                    hiveNumber: hiveNumber,
                                    hiveType: template.type,
                                    status: 'ACTIVE',
                                }
                            });
                        }
                    }
                }
            }

            // 2. Simple Counts Logic (for Quick Wizard)
            if (hivesCounts) {
                const typesMap: { [key: string]: 'LANGSTROTH' | 'BALADI' | 'NUCLEUS' } = {
                    'langstroth': 'LANGSTROTH',
                    'traditional': 'BALADI',
                    'nuc': 'NUCLEUS'
                };

                const createHives = async (type: 'LANGSTROTH' | 'BALADI' | 'NUCLEUS', count: number) => {
                    let hiveCounter = await tx.hive.count({ where: { apiaryId: apiary.id } });
                    for (let i = 0; i < count; i++) {
                        hiveCounter++;
                        await tx.hive.create({
                            data: {
                                apiaryId: apiary.id,
                                hiveNumber: `H-${hiveCounter}`,
                                hiveType: type,
                                status: 'ACTIVE'
                            }
                        });
                    }
                };

                if (hivesCounts.langstroth > 0) await createHives(typesMap.langstroth, hivesCounts.langstroth);
                if (hivesCounts.traditional > 0) await createHives(typesMap.traditional, hivesCounts.traditional);
                if (hivesCounts.nuc > 0) await createHives(typesMap.nuc, hivesCounts.nuc);
            }

            // 3. Update hive counts after all hives are created
            const totalHivesCreated = await tx.hive.count({ where: { apiaryId: apiary.id } });
            const updatedApiary = await tx.apiary.update({
                where: { id: apiary.id },
                data: {
                    currentHiveCount: totalHivesCreated,
                    initialHiveCount: totalHivesCreated
                }
            });

            return updatedApiary;
        });
    }

    async update(id: string, data: any, userId: string) {
        const apiary = await apiaryRepository.findById(id, userId);
        if (!apiary) {
            throw new AppError('Apiary not found', 404);
        }
        return apiaryRepository.update(id, data, userId);
    }

    async delete(id: string, userId: string) {
        const apiary = await apiaryRepository.findById(id, userId);
        if (!apiary) {
            throw new AppError('Apiary not found', 404);
        }
        return apiaryRepository.delete(id, userId);
    }
    async getDashboardStats(userId: string) {
        // 1. Get total hives and apiaries
        const apiaries = await prisma.apiary.findMany({
            where: { ownerId: userId, isActive: true },
            include: {
                _count: { select: { hives: true } },
                hives: {
                    select: {
                        strengthScore: true,
                        alerts: true // Fetch all alerts, filter in memory if needed
                    }
                }
            }
        });

        const totalApiaries = apiaries.length;
        const totalHives = apiaries.reduce((acc, curr) => acc + curr._count.hives, 0);

        // 2. Calculate Health Score (Average strength of all hives)
        let totalStrength = 0;
        let hivesWithStrength = 0;
        let totalAlerts = 0;

        apiaries.forEach((apiary: any) => {
            apiary.hives.forEach((hive: any) => {
                if (hive.strengthScore) {
                    totalStrength += hive.strengthScore;
                    hivesWithStrength++;
                }
                // Check if alerts exist
                if (hive.alerts) {
                    totalAlerts += hive.alerts.length;
                }
            });
        });

        const averageHealth = hivesWithStrength > 0 ? Math.round(totalStrength / hivesWithStrength) : 0;

        // 3. Calculate Production (Total Honey Harvested)
        const production = await prisma.honeyHarvest.aggregate({
            where: {
                hive: {
                    apiary: {
                        ownerId: userId
                    }
                }
            },
            _sum: {
                quantityKg: true
            }
        });

        const totalProduction = production._sum.quantityKg || 0;

        return {
            totalHives,
            totalApiaries,
            healthScore: averageHealth,
            healthRating: averageHealth >= 90 ? 'EXCELLENT' : averageHealth >= 70 ? 'GOOD' : averageHealth >= 50 ? 'FAIR' : 'POOR',
            productionKg: totalProduction,
            activeAlerts: totalAlerts
        };
    }
}

export const apiaryService = new ApiaryService();
