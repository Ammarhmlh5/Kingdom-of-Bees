import { feedingRepository } from '../repositories/feeding.repository';
import { hiveRepository } from '../repositories/hive.repository';
import { FeedingLocation, FeedingContentType, FeedingPurpose } from '@prisma/client';
import { analyticsMatchingService } from './analytics-matching.service';

import prisma from '../config/prisma';

export interface FeedPayload {
    hiveId?: string;
    feedingDate?: string;
    feedingLocation: FeedingLocation;
    contentType: FeedingContentType;
    quantityKg: number;
    purpose: FeedingPurpose;
    notes?: string;
}

export class FeedingService {

    async getHistory(apiaryId: string) {
        return feedingRepository.findAllByApiaryId(apiaryId);
    }

    async getFeedingTypes() {
        return feedingRepository.findTypes();
    }

    async feedHive(apiaryId: string, userId: string, data: FeedPayload) {
        // If hiveId is not provided, delegate to feedApiary
        if (!data.hiveId) {
            return this.feedApiary(apiaryId, userId, data);
        }

        const hive = await hiveRepository.findById(data.hiveId, apiaryId);
        if (!hive) throw new Error('الخلية غير موجودة في هذا المنحل');

        const feedingDate = data.feedingDate ? new Date(data.feedingDate) : new Date();

        const feedingRecord = await feedingRepository.create({
            apiary: { connect: { id: apiaryId } },
            hive: { connect: { id: data.hiveId } },
            feeder: { connect: { id: userId } },
            feedingDate,
            feedingLocation: data.feedingLocation,
            contentType: data.contentType,
            quantityKg: data.quantityKg,
            purpose: data.purpose,
            notes: data.notes
        });

        // Log in ApiaryOperation for unified operations log visibility
        const contentTypeLabel = this.getContentTypeLabel(data.contentType);
        const opRecord = await prisma.apiaryOperation.create({
            data: {
                apiaryId,
                operationType: 'FEEDING',
                hiveId: data.hiveId,
                description: `تغذية الخلية ${hive.hiveNumber} (${contentTypeLabel}) بكمية ${data.quantityKg} كجم`,
                performedBy: userId,
                operationDate: feedingDate,
                data: {
                    feedingRecordId: feedingRecord.id,
                    feedingLocation: data.feedingLocation,
                    contentType: data.contentType,
                    quantityKg: data.quantityKg,
                    purpose: data.purpose,
                    notes: data.notes,
                    sourceRecordId: feedingRecord.id
                }
            }
        });

        // Fire & Forget: trigger background analytics matching
        analyticsMatchingService.processOperationAsync(
            apiaryId,
            data.hiveId,
            opRecord.id,
            'FEEDING',
            { quantity: data.quantityKg, typeId: data.contentType, notes: data.notes }
        );

        return feedingRecord;
    }

    async feedApiary(apiaryId: string, userId: string, data: FeedPayload) {
        // 1. Get all active hives in apiary
        const hives = await hiveRepository.findAllByApiaryId(apiaryId);
        const activeHives = hives.filter(h => h.status === 'ACTIVE');
        if (activeHives.length === 0) throw new Error('لا توجد خلايا نشطة في هذا المنحل لتغذيتها');

        const feedingDate = data.feedingDate ? new Date(data.feedingDate) : new Date();

        // 2. Create feeding records in bulk (Prisma transaction)
        const records = await prisma.$transaction(
            activeHives.map(hive => prisma.feedingRecord.create({
                data: {
                    apiaryId,
                    hiveId: hive.id,
                    fedBy: userId,
                    feedingDate,
                    feedingLocation: data.feedingLocation,
                    contentType: data.contentType,
                    quantityKg: data.quantityKg,
                    purpose: data.purpose,
                    notes: data.notes
                }
            }))
        );

        // 3. Log a single summarized ApiaryOperation for the whole apiary
        const contentTypeLabel = this.getContentTypeLabel(data.contentType);
        const opRecord = await prisma.apiaryOperation.create({
            data: {
                apiaryId,
                operationType: 'FEEDING',
                description: `تغذية جماعية لجميع خلايا المنحل (${activeHives.length} خلايا) بـ (${contentTypeLabel}) بكمية ${data.quantityKg} كجم/خلية`,
                performedBy: userId,
                operationDate: feedingDate,
                data: {
                    feedingLocation: data.feedingLocation,
                    contentType: data.contentType,
                    quantityPerHive: data.quantityKg,
                    totalHives: activeHives.length,
                    totalQuantity: data.quantityKg * activeHives.length,
                    notes: data.notes
                }
            }
        });

        // Trigger background analytics matching for each hive
        for (const hive of activeHives) {
            analyticsMatchingService.processOperationAsync(
                apiaryId,
                hive.id,
                opRecord.id,
                'FEEDING',
                { quantity: data.quantityKg, typeId: data.contentType, notes: data.notes }
            );
        }

        return { count: records.length };
    }

    private getContentTypeLabel(type: FeedingContentType): string {
        const labels: Record<FeedingContentType, string> = {
            SUGAR_SYRUP: 'شراب سكر',
            PROTEIN: 'بروتين',
            POLLEN_SUBSTITUTE: 'بديل حبوب لقاح',
            FONDANT: 'فوندان',
            MEDICINAL: 'دوائي',
            SUPPLEMENT: 'مكمل غذائي',
            OTHER: 'آخر'
        };
        return labels[type] || type;
    }
}

export const feedingService = new FeedingService();
