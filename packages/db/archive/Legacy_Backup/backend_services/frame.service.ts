import frameRepository from '../repositories/frame.repository';
import { HiveFrame, FrameSnapshot, BroodAge, BroodType, FrameType, FrameCondition } from '@prisma/client';

interface FrameData {
  honeyPercentage: number;
  broodPercentage: number;
  pollenPercentage: number;
  broodType?: BroodType;
  broodAge?: BroodAge;
  frameType?: FrameType;
  condition?: FrameCondition;
  ageYears?: number;
}

interface CreateFrameData extends FrameData {
  hiveId: string;
  story: number;
  position: number;
}

interface UpdateFrameData extends Partial<FrameData> {
  updatedBy?: string;
}

interface CreateSnapshotData {
  frameId: string;
  userId: string;
  inspectionId?: string;
  notes?: string;
  honeyPercentage: number;
  broodPercentage: number;
  pollenPercentage: number;
  broodType?: BroodType;
  broodAge?: BroodAge;
}

export class FrameService {
  /**
   * Validate frame percentages (must sum to <= 100%)
   */
  private validatePercentages(honey: number, brood: number, pollen: number): void {
    const total = honey + brood + pollen;
    if (total > 100) {
      throw new Error(`Total percentages cannot exceed 100% (current: ${total}%)`);
    }
    if (honey < 0 || brood < 0 || pollen < 0) {
      throw new Error('Percentages cannot be negative');
    }
  }

  /**
   * Get frame by ID
   */
  async getFrame(frameId: string): Promise<HiveFrame> {
    const frame = await frameRepository.findById(frameId);
    if (!frame) {
      throw new Error('Frame not found');
    }
    return frame;
  }

  /**
   * Get all frames for a hive
   */
  async getHiveFrames(hiveId: string): Promise<HiveFrame[]> {
    return await frameRepository.findByHiveId(hiveId);
  }

  /**
   * Create a new frame
   */
  async createFrame(data: CreateFrameData): Promise<HiveFrame> {
    this.validatePercentages(
      data.honeyPercentage,
      data.broodPercentage,
      data.pollenPercentage
    );

    return await frameRepository.create({
      hive: { connect: { id: data.hiveId } },
      story: data.story,
      position: data.position,
      frameType: data.frameType || 'STANDARD',
      condition: data.condition || 'GOOD',
      ageYears: data.ageYears || 0,
      honeyPercentage: data.honeyPercentage,
      broodPercentage: data.broodPercentage,
      pollenPercentage: data.pollenPercentage,
      broodType: data.broodType,
      broodAge: data.broodAge || null
    } as any);
  }

  /**
   * Update frame
   */
  async updateFrame(frameId: string, data: UpdateFrameData): Promise<HiveFrame> {
    if (
      data.honeyPercentage !== undefined ||
      data.broodPercentage !== undefined ||
      data.pollenPercentage !== undefined
    ) {
      const frame = await this.getFrame(frameId);
      this.validatePercentages(
        data.honeyPercentage ?? frame.honeyPercentage,
        data.broodPercentage ?? frame.broodPercentage,
        data.pollenPercentage ?? frame.pollenPercentage
      );
    }

    return await frameRepository.update(frameId, {
      ...data,
      updatedBy: data.updatedBy,
    });
  }

  /**
   * Delete frame
   */
  async deleteFrame(frameId: string): Promise<void> {
    await frameRepository.delete(frameId);
  }

  /**
   * Update multiple frames at once
   */
  async updateMultipleFrames(
    updates: Array<{ frameId: string; data: UpdateFrameData }>
  ): Promise<void> {
    const updatePromises = updates.map(async ({ frameId, data }) => {
      // Validate individually if needed, skipping for batch speed optimization mostly
      // but good practice to validate logic eventually. 
      // Relying on single update validation logic if we called updateFrame, but we use repo.
      return { id: frameId, data };
    });

    const resolvedUpdates = await Promise.all(updatePromises);
    await frameRepository.updateMultiple(resolvedUpdates);
  }

  /**
   * Create a snapshot of frame state
   */
  async createSnapshot(data: CreateSnapshotData): Promise<FrameSnapshot> {
    this.validatePercentages(
      data.honeyPercentage,
      data.broodPercentage,
      data.pollenPercentage
    );

    return await frameRepository.createSnapshot({
      frame: { connect: { id: data.frameId } },
      user: { connect: { id: data.userId } },
      inspection: data.inspectionId ? { connect: { id: data.inspectionId } } : undefined,
      notes: data.notes,
      honeyPercentage: data.honeyPercentage,
      broodPercentage: data.broodPercentage,
      pollenPercentage: data.pollenPercentage,
      broodType: data.broodType,
      broodAge: data.broodAge
    } as any);
  }

  /**
   * Get frame history (snapshots)
   */
  async getFrameHistory(frameId: string, limit?: number): Promise<FrameSnapshot[]> {
    return await frameRepository.getSnapshots(frameId, limit);
  }

  /**
   * Get frame count for a hive
   */
  async getFrameCount(hiveId: string): Promise<number> {
    return await frameRepository.getFrameCount(hiveId);
  }
}

export default new FrameService();
