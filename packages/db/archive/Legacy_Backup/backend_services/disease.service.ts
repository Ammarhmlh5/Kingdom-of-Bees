import { prisma } from '../config/database';
import { DiseaseRecord, DiseaseStatus, Prisma } from '@prisma/client';
import { GeoAlertService } from './geo-alert.service';

export class DiseaseService {

    // --- Disease Library (Read Operations) ---

    static async getAllDiseases() {
        return prisma.diseaseLibrary.findMany({
            include: {
                treatments: true
            }
        });
    }

    static async getDiseaseById(id: string) {
        return prisma.diseaseLibrary.findUnique({
            where: { id },
            include: {
                treatments: true
            }
        });
    }

    static async getTreatmentById(id: string) {
        return prisma.diseaseTreatment.findUnique({
            where: { id }
        });
    }

    // --- Disease Records (Write Operations) ---

    static async createDiseaseRecord(data: {
        apiaryId: string;
        diseaseId: string;
        detectedBy: string;
        affectedHives: string[];
        date?: Date;
        notes?: string;
    }) {
        const disease = await prisma.diseaseLibrary.findUnique({
            where: { id: data.diseaseId },
            select: { nameAr: true, nameEn: true, contagiousness: true }
        });

        if (!disease) throw new Error('Disease not found');

        const record = await prisma.diseaseRecord.create({
            data: {
                apiaryId: data.apiaryId,
                diseaseId: data.diseaseId,
                detectedBy: data.detectedBy,
                firstDetectedDate: data.date || new Date(),
                affectedHives: data.affectedHives,
                totalAffectedHives: data.affectedHives.length,
                status: DiseaseStatus.ACTIVE,
                notes: data.notes
            }
        });

        // Trigger Geo Alert if contagious
        if (disease.contagiousness !== 'NONE' && disease.contagiousness !== 'LOW') {
            // Fire and forget mechanism to not block the request
            GeoAlertService.broadcastDiseaseAlert(
                data.apiaryId,
                disease.nameAr || disease.nameEn,
                data.diseaseId
            ).catch(err => console.error('Failed to broadcast disease alert:', err));
        }

        return record;
    }

    static async updateDiseaseRecord(id: string, data: Partial<DiseaseRecord>) {
        return prisma.diseaseRecord.update({
            where: { id },
            data: data as any
        });
    }

    static async getUserRecords(userId: string) {
        return prisma.diseaseRecord.findMany({
            where: {
                OR: [
                    { apiary: { ownerId: userId } },
                    { apiary: { members: { some: { userId: userId } } } }
                ]
            },
            include: {
                disease: true,
                apiary: { select: { name: true, id: true } }
            },
            orderBy: { firstDetectedDate: 'desc' }
        });
    }

    static async getApiaryDiseaseRecords(apiaryId: string) {
        return prisma.diseaseRecord.findMany({
            where: { apiaryId },
            include: {
                disease: true,
                detector: {
                    select: { fullName: true }
                }
            },
            orderBy: { firstDetectedDate: 'desc' }
        });
    }

    static async getActiveDiseasesInArea(lat: number, lng: number, radiusKm: number = 10) {
        // This requires calculating distance from all apiaries with active diseases
        // Simplified: Get all active records, filter by apiary location
        // Optimization: Filter by a bounding box first if possible, but Prisma + Json/NoPostGIS makes it hard.

        // 1. Get all active disease records
        const activeRecords = await prisma.diseaseRecord.findMany({
            where: { status: { in: ['ACTIVE', 'TREATING'] } },
            include: {
                disease: { select: { nameAr: true, nameEn: true } },
                apiary: { select: { locationLat: true, locationLng: true } }
            }
        });

        // 2. Filter by distance
        // Using a simple Haversine implementation or reusing GeoAlertService logic (if exposed)
        // We'll duplicate the math briefly or make GeoAlertService helper public

        // Note: This is an expensive operation for a large dataset, ideal for a database function

        // Helper to calc distance (Can assume GeoAlertService has logic, but for simplicity here)
        const deg2rad = (deg: number) => deg * (Math.PI / 180);
        const getDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371;
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        return activeRecords.filter(record => {
            if (!record.apiary.locationLat || !record.apiary.locationLng) return false;
            const d = getDist(lat, lng, Number(record.apiary.locationLat), Number(record.apiary.locationLng));
            return d <= radiusKm;
        }).map(r => ({
            disease: r.disease.nameAr,
            date: r.firstDetectedDate,
            distanceKm: getDist(lat, lng, Number(r.apiary.locationLat), Number(r.apiary.locationLng)).toFixed(1)
        }));
    }
}
