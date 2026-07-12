import { PrismaClient, SyncAction } from '@prisma/client';

const prisma = new PrismaClient();

export interface SyncEventDto {
    id: string; // Client-side ID
    table: string;
    rowId: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    data: any;
    clientTimestamp: string;
    deviceId?: string;
}

export class SyncService {
    static async processSyncEvents(userId: string, events: SyncEventDto[]) {
        const results = [];

        for (const event of events) {
            try {
                // 1. Log the sync event
                await prisma.syncEvent.create({
                    data: {
                        userId,
                        eventType: 'MOBILE_SYNC',
                        resourceType: event.table,
                        resourceId: event.rowId,
                        action: this.mapOperationToSyncAction(event.operation),
                        data: event.data,
                        deviceId: event.deviceId,
                        clientTimestamp: new Date(event.clientTimestamp),
                        synced: true,
                        syncedAt: new Date(),
                    }
                });

                // 2. Apply the change to the actual table
                // Note: In a production app, we would have a more robust dispatcher
                // For this rework, we'll handle core beekeeping models
                await this.applyChange(event);

                results.push({ id: event.id, status: 'SUCCESS' });
            } catch (error: any) {
                console.error(`[SyncService] Error processing event ${event.id}:`, error);
                results.push({ id: event.id, status: 'FAILED', error: error.message });
            }
        }

        return results;
    }

    private static mapOperationToSyncAction(op: string): SyncAction {
        switch (op) {
            case 'INSERT': return SyncAction.CREATE;
            case 'UPDATE': return SyncAction.UPDATE;
            case 'DELETE': return SyncAction.DELETE;
            default: return SyncAction.CREATE;
        }
    }

    private static async applyChange(event: SyncEventDto) {
        const tableMap: Record<string, string> = {
            'apiaries': 'apiary',
            'hives': 'hive',
            'inspections': 'inspection',
            'feeding_records': 'feedingRecord',
            'harvest_records': 'harvestRecord',
            'disease_records': 'diseaseRecord',
            'products': 'product',
            'listings': 'listing',
            'disease_library': 'diseaseLibrary'
        };

        const modelName = tableMap[event.table.toLowerCase()] || event.table.toLowerCase();
        const model = (prisma as any)[modelName];
        const data = event.data;
        const id = event.rowId;

        if (!model) {
            throw new Error(`Model ${modelName} (from ${event.table}) not found in Prisma`);
        }

        if (event.operation === 'INSERT') {
            await model.upsert({
                where: { id },
                update: data,
                create: data
            });
        } else if (event.operation === 'UPDATE') {
            await model.update({
                where: { id },
                data
            });
        } else if (event.operation === 'DELETE') {
            await model.delete({
                where: { id }
            });
        }
    }
}
