import prisma from '../config/prisma';

export class AdminDiseaseService {
    // ==========================================
    // DISEASE LIBRARY CRUD
    // ==========================================

    async getAllDiseases() {
        return prisma.diseaseLibrary.findMany({
            orderBy: { nameAr: 'asc' },
            include: {
                treatments: true // Include treatments so the admin can see them
            }
        });
    }

    async getDiseaseById(id: string) {
        return prisma.diseaseLibrary.findUnique({
            where: { id },
            include: { treatments: true }
        });
    }

    async createDisease(data: any) {
        return prisma.diseaseLibrary.create({
            data: {
                nameAr: data.nameAr,
                nameEn: data.nameEn,
                scientificName: data.scientificName,
                diseaseType: data.diseaseType || 'PARASITIC',
                severity: data.severity || 'MODERATE',
                contagiousness: data.contagiousness || 'HIGH',
                mortalityRate: data.mortalityRate,
                symptoms: data.symptoms || [],
                diagnosisMethods: data.diagnosisMethods || [],
                treatable: data.treatable ?? true,
                burningRequired: data.burningRequired ?? false,
                quarantineRequired: data.quarantineRequired ?? false,
                quarantineDurationDays: data.quarantineDurationDays,
                reportingMandatory: data.reportingMandatory ?? false,
                preventionMethods: data.preventionMethods || [],
            }
        });
    }

    async updateDisease(id: string, data: any) {
        return prisma.diseaseLibrary.update({
            where: { id },
            data: {
                nameAr: data.nameAr,
                nameEn: data.nameEn,
                scientificName: data.scientificName,
                diseaseType: data.diseaseType,
                severity: data.severity,
                contagiousness: data.contagiousness,
                mortalityRate: data.mortalityRate,
                symptoms: data.symptoms,
                diagnosisMethods: data.diagnosisMethods,
                treatable: data.treatable,
                burningRequired: data.burningRequired,
                quarantineRequired: data.quarantineRequired,
                quarantineDurationDays: data.quarantineDurationDays,
                reportingMandatory: data.reportingMandatory,
                preventionMethods: data.preventionMethods,
            }
        });
    }

    async deleteDisease(id: string) {
        return prisma.diseaseLibrary.delete({
            where: { id }
        });
    }

    // ==========================================
    // DISEASE TREATMENTS CRUD
    // ==========================================

    async getTreatmentsByDisease(diseaseId: string) {
        return prisma.diseaseTreatment.findMany({
            where: { diseaseId },
            orderBy: { nameAr: 'asc' }
        });
    }

    async createTreatment(diseaseId: string, data: any) {
        return prisma.diseaseTreatment.create({
            data: {
                diseaseId,
                nameAr: data.nameAr,
                nameEn: data.nameEn,
                description: data.description,
                type: data.type || 'CHEMICAL',
                applicationMethod: data.applicationMethod || 'غير محدد',
                dosage: data.dosage,
                durationDays: data.durationDays,
                frequency: data.frequency,
                season: data.season || [],
                temperatureMin: data.temperatureMin,
                temperatureMax: data.temperatureMax,
                honeySafe: data.honeySafe ?? false,
                withdrawalPeriod: data.withdrawalPeriod,
                effectiveness: data.effectiveness
            }
        });
    }

    async updateTreatment(id: string, data: any) {
        return prisma.diseaseTreatment.update({
            where: { id },
            data: {
                nameAr: data.nameAr,
                nameEn: data.nameEn,
                description: data.description,
                type: data.type,
                applicationMethod: data.applicationMethod,
                dosage: data.dosage,
                durationDays: data.durationDays,
                frequency: data.frequency,
                season: data.season,
                temperatureMin: data.temperatureMin,
                temperatureMax: data.temperatureMax,
                honeySafe: data.honeySafe,
                withdrawalPeriod: data.withdrawalPeriod,
                effectiveness: data.effectiveness
            }
        });
    }

    async deleteTreatment(id: string) {
        return prisma.diseaseTreatment.delete({
            where: { id }
        });
    }
}

export const adminDiseaseService = new AdminDiseaseService();
