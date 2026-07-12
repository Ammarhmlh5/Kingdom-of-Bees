
import { hiveRepository } from '../repositories/hive.repository';
import { QueenSource, StrengthRating, FrameType, FrameCondition } from '@prisma/client';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export class HiveService {

    async getHives(apiaryId: string) {
        return hiveRepository.findAllByApiaryId(apiaryId);
    }

    async getHiveDetails(apiaryId: string, hiveId: string) {
        const hive = await hiveRepository.findById(hiveId, apiaryId);
        if (!hive) throw new Error('Hive not found');
        return hive;
    }

    async createHive(apiaryId: string, data: any) { // data: CreateHiveData
        let hiveTypeId = data.hiveTypeId || data.hive_type_id;

        // Resolve hiveType string (e.g. 'LANGSTROTH', 'BALADI', 'KENYAN', 'OTHER') to a DB id
        if (!hiveTypeId && data.hiveType) {
            hiveTypeId = await this.resolveHiveTypeId(data.hiveType);
        }

        // Final fallback: ensure we always have a hiveTypeId
        if (!hiveTypeId) {
            hiveTypeId = await this.resolveHiveTypeId('OTHER');
        }

        logger.info(`[HiveService] Resolved hiveType '${data.hiveType}' -> ${hiveTypeId}`);

        const hiveData: any = {
            apiary: { connect: { id: apiaryId } },
            hiveNumber: data.hiveNumber,
            hiveType: { connect: { id: hiveTypeId } },
            status: data.status || 'ACTIVE',
            queenId: data.queenId || undefined,
            notes: data.notes
        };

        if (data.name) hiveData.name = data.name;
        if (data.queenAge) hiveData.queenAge = data.queenAge;
        if (data.queenColor) hiveData.queenColor = data.queenColor;
        if (data.framesPerBox) hiveData.framesPerBox = data.framesPerBox;

        const hive = await hiveRepository.create(hiveData);

        return hiveRepository.findById(hive.id, apiaryId);
    }

    private async resolveHiveTypeId(code: string): Promise<string> {
        const codeMap: Record<string, { nameEn: string; nameAr: string }> = {
            BALADI: { nameEn: 'Baladi', nameAr: 'بلدي' },
            KENYAN: { nameEn: 'Kenyan Top Bar', nameAr: 'كيني' },
            LANGSTROTH: { nameEn: 'Langstroth', nameAr: 'لانجستروث' },
            WARRE: { nameEn: 'Warré', nameAr: 'وار' },
            OTHER: { nameEn: 'Other', nameAr: 'أخرى' },
        };

        const key = code.toUpperCase();
        const match = codeMap[key];
        const searchTerm = match?.nameEn ?? code;

        // Try to find existing
        const existing = await prisma.hiveType.findFirst({
            where: {
                OR: [
                    { nameEn: { contains: searchTerm, mode: 'insensitive' } },
                    { nameAr: { contains: searchTerm, mode: 'insensitive' } },
                ]
            }
        });
        if (existing) return existing.id;

        // Not found — auto-create one
        const created = await prisma.hiveType.create({
            data: {
                nameEn: match?.nameEn ?? code,
                nameAr: match?.nameAr ?? code,
                defaultFrames: 10,
            }
        });
        logger.info(`[HiveService] Auto-created HiveType '${created.nameEn}' (${created.id})`);
        return created.id;
    }

    private async resolveHiveTypeIdForSetup(type: string): Promise<string | undefined> {
        const typeMap: Record<string, string> = {
            MODERN: 'LANGSTROTH',
            TRADITIONAL: 'BALADI',
            LANGSTROTH: 'LANGSTROTH',
            BALADI: 'BALADI',
            KENYAN: 'KENYAN',
            WARRE: 'WARRE',
        };
        const mapped = typeMap[type.toUpperCase()];
        if (!mapped) return undefined;
        return this.resolveHiveTypeId(mapped);
    }

    private async resolveBeeBreedId(breed: string): Promise<string | undefined> {
        const breedMap: Record<string, { nameEn: string; nameAr: string }> = {
            CARNIOLAN: { nameEn: 'Carniolan', nameAr: 'كرنيولي' },
            ITALIAN: { nameEn: 'Italian', nameAr: 'إيطالي' },
            LOCAL: { nameEn: 'Local', nameAr: 'بلدي محسن' },
        };

        const key = breed.toUpperCase();
        const match = breedMap[key];
        const searchTerm = match?.nameEn ?? breed;

        const existing = await prisma.beeBreed.findFirst({
            where: {
                OR: [
                    { nameEn: { contains: searchTerm, mode: 'insensitive' } },
                    { nameAr: { contains: searchTerm, mode: 'insensitive' } },
                ]
            }
        });
        if (existing) return existing.id;

        if (match) {
            const created = await prisma.beeBreed.create({
                data: {
                    nameEn: match.nameEn,
                    nameAr: match.nameAr,
                }
            });
            return created.id;
        }

        return undefined;
    }

    private mapQueenSource(source: string): keyof typeof QueenSource {
        const validSources: Array<keyof typeof QueenSource> = ['BRED', 'PURCHASED', 'SWARM', 'SPLIT', 'UNKNOWN'];
        const upper = source.toUpperCase() as keyof typeof QueenSource;
        return validSources.includes(upper) ? upper : 'UNKNOWN';
    }

    private mapStrengthRating(strength: string): keyof typeof StrengthRating {
        const map: Record<string, keyof typeof StrengthRating> = {
            EXCELLENT: 'VERY_STRONG',
            GOOD: 'STRONG',
            FAIR: 'MEDIUM',
            WEAK: 'WEAK',
        };
        return map[strength.toUpperCase()] || 'MEDIUM';
    }

    async updateHive(apiaryId: string, hiveId: string, data: any) {
        return hiveRepository.update(hiveId, apiaryId, data);
    }

    async deleteHive(apiaryId: string, hiveId: string) {
        return hiveRepository.delete(hiveId, apiaryId);
    }

    async getHiveFrames(apiaryId: string, hiveId: string) {
        logger.info('[HiveService] getHiveFrames called', { apiaryId, hiveId });
        // Verify hive exists and user has access
        const hive = await this.getHiveDetails(apiaryId, hiveId);
        logger.info('[HiveService] Hive found:', hive?.id, 'frames count:', (hive as any)?.frames?.length);
        // Use the repository method directly for better control
        return hiveRepository.getFramesByHiveId(hiveId);
    }

    async updateFrames(_apiaryId: string, hiveId: string, frames: any[]) {
        const results = [];
        for (const frame of frames) {
            results.push(await hiveRepository.upsertFrame(hiveId, frame));
        }
        return results;
    }

    async mergeHives(apiaryId: string, weakHiveId: string, data: { targetHiveId: string }) {
        return hiveRepository.merge(weakHiveId, data.targetHiveId, apiaryId);
    }

    async addSuper(_apiaryId: string, hiveId: string, data: { type: string; frames: number; hasExcluder: boolean }) {
        return hiveRepository.addSuper(hiveId, data);
    }

    async setupHive(apiaryId: string, hiveId: string, data: any) {
        logger.info('[HiveService] setupHive called', { apiaryId, hiveId, data });

        const hiveNumber = data.hiveNumber || undefined;
        const typeStr = data.type || data.hiveType;
        const queenData = data.queen;
        const strengthStr = data.strength;
        const frames = data.frames;

        return prisma.$transaction(async (tx) => {
            // 1. Resolve hive type
            let hiveTypeId: string | undefined;
            if (typeStr) {
                hiveTypeId = await this.resolveHiveTypeIdForSetup(typeStr);
            }
            if (!hiveTypeId) {
                hiveTypeId = await this.resolveHiveTypeId('OTHER');
            }

            // 2. Resolve bee breed from queen breed
            let beeBreedId: string | undefined;
            if (queenData?.breed && queenData.breed !== 'UNKNOWN') {
                beeBreedId = await this.resolveBeeBreedId(queenData.breed);
            }

            // 3. Create Queen record if queen data provided
            let queenId: string | undefined;
            if (queenData) {
                const queenRecord = await tx.queen.create({
                    data: {
                        source: this.mapQueenSource(queenData.source || 'UNKNOWN'),
                        beeBreedId: beeBreedId || undefined,
                        birthDate: queenData.year && queenData.year !== 'OLD'
                            ? new Date(`${queenData.year}-01-01`)
                            : undefined,
                        introductionDate: new Date(),
                        marked: queenData.isMarked || false,
                        markColor: queenData.markColor || undefined,
                        status: 'ACTIVE',
                        currentHiveId: hiveId,
                    }
                });
                queenId = queenRecord.id;
                logger.info('[HiveService] Created queen record:', queenId);
            }

            // 4. Update Hive details
            const updateData: any = {};
            if (hiveTypeId) updateData.hiveType = { connect: { id: hiveTypeId } };
            if (queenId) {
                updateData.queen = { connect: { id: queenId } };
                updateData.queenMarked = queenData?.isMarked || false;
            }
            if (beeBreedId) updateData.beeBreed = { connect: { id: beeBreedId } };
            if (hiveNumber) updateData.hiveNumber = hiveNumber;
            if (frames?.total) updateData.framesPerBox = frames.total;
            if (strengthStr) {
                updateData.strengthRating = this.mapStrengthRating(strengthStr);
            }
            updateData.installationDate = new Date();
            updateData.status = 'ACTIVE';

            await tx.hive.update({
                where: { id: hiveId },
                data: updateData,
            });

            // 5. Setup frames bulk - Create frames based on the setup data
            if (frames && frames.total > 0) {
                const frameData: any[] = [];
                const brood = frames.brood || 0;
                const honey = frames.honey || 0;
                const pollen = frames.pollen || 0;

                for (let i = 0; i < brood; i++) {
                    frameData.push({
                        hiveId,
                        position: frameData.length + 1,
                        frameType: FrameType.BROOD,
                        broodPercentage: 80,
                        honeyPercentage: 10,
                        pollenPercentage: 10,
                        condition: FrameCondition.GOOD,
                    });
                }

                for (let i = 0; i < honey; i++) {
                    frameData.push({
                        hiveId,
                        position: frameData.length + 1,
                        frameType: FrameType.HONEY,
                        broodPercentage: 5,
                        honeyPercentage: 85,
                        pollenPercentage: 10,
                        condition: FrameCondition.GOOD,
                    });
                }

                for (let i = 0; i < pollen; i++) {
                    frameData.push({
                        hiveId,
                        position: frameData.length + 1,
                        frameType: FrameType.POLLEN,
                        broodPercentage: 10,
                        honeyPercentage: 20,
                        pollenPercentage: 70,
                        condition: FrameCondition.GOOD,
                    });
                }

                const remaining = frames.total - (brood + honey + pollen);
                for (let i = 0; i < remaining; i++) {
                    frameData.push({
                        hiveId,
                        position: frameData.length + 1,
                        frameType: FrameType.EMPTY,
                        broodPercentage: 0,
                        honeyPercentage: 0,
                        pollenPercentage: 0,
                        condition: FrameCondition.GOOD,
                    });
                }

                await tx.hiveFrame.createMany({ data: frameData });
                logger.info('[HiveService] Created', frameData.length, 'frames for hive', hiveId);
            }

            return { success: true, message: 'Hive setup completed with frames' };
        });
    }

    async splitHive(apiaryId: string, hiveId: string, data: any) { // data: SplitHiveData
        // Prepare new hive input
        const newHiveInput = {
            apiary: { connect: { id: apiaryId } },
            hiveNumber: data.newHiveNumber,
            name: `Split from ${hiveId}`,
            hiveType: { connect: { id: data.newHiveTypeId } }, // Fixed relation name to hiveType
            status: 'ACTIVE' as const
        };

        return hiveRepository.create(newHiveInput as any);
    }
}

export const hiveService = new HiveService();
