import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface FrameData {
  // Side A
  sideAHoneyPercentage: number;
  sideABroodPercentage: number;
  sideAPollenPercentage: number;
  sideABroodType?: 'EGGS' | 'LARVAE' | 'CAPPED' | 'MIXED' | 'NONE';
  sideABroodAge?: 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED';
  
  // Side B
  sideBHoneyPercentage: number;
  sideBBroodPercentage: number;
  sideBPollenPercentage: number;
  sideBBroodType?: 'EGGS' | 'LARVAE' | 'CAPPED' | 'MIXED' | 'NONE';
  sideBBroodAge?: 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED';
  
  // Other fields
  frameType?: 'STANDARD' | 'FOUNDATION' | 'DRAWN' | 'EMPTY';
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  ageYears?: number;
}

export interface CreateFrameData extends FrameData {
  story: number;
  position: number;
}

export interface Frame extends FrameData {
  id: string;
  hiveId: string;
  story: number;
  position: number;
  // Legacy fields
  broodPercentage: number;
  broodType?: 'EGGS' | 'LARVAE' | 'CAPPED' | 'MIXED' | 'NONE';
  honeyPercentage: number;
  pollenPercentage: number;
  // Metadata
  lastUpdated: string;
  updatedBy?: string;
  createdAt: string;
}

export interface FrameSnapshot {
  id: string;
  frameId: string;
  // Side A
  sideAHoneyPercentage: number;
  sideABroodPercentage: number;
  sideAPollenPercentage: number;
  sideABroodType?: 'EGGS' | 'LARVAE' | 'CAPPED' | 'MIXED' | 'NONE';
  sideABroodAge?: 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED';
  // Side B
  sideBHoneyPercentage: number;
  sideBBroodPercentage: number;
  sideBPollenPercentage: number;
  sideBBroodType?: 'EGGS' | 'LARVAE' | 'CAPPED' | 'MIXED' | 'NONE';
  sideBBroodAge?: 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED';
  // Context
  inspectionId?: string;
  userId: string;
  notes?: string;
  recordedAt: string;
  // Relations
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  inspection?: {
    id: string;
    inspectionDate: string;
    inspectionType: string;
  };
}

export interface CreateSnapshotData {
  inspectionId?: string;
  notes?: string;
  // Side A
  sideAHoneyPercentage: number;
  sideABroodPercentage: number;
  sideAPollenPercentage: number;
  sideABroodType?: 'EGGS' | 'LARVAE' | 'CAPPED' | 'MIXED' | 'NONE';
  sideABroodAge?: 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED';
  // Side B
  sideBHoneyPercentage: number;
  sideBBroodPercentage: number;
  sideBPollenPercentage: number;
  sideBBroodType?: 'EGGS' | 'LARVAE' | 'CAPPED' | 'MIXED' | 'NONE';
  sideBBroodAge?: 'EGGS' | 'YOUNG_LARVAE' | 'OLD_LARVAE' | 'CAPPED' | 'MIXED';
}

// Frame Service
export const frameService = {
  /**
   * Get all frames for a hive
   */
  async getHiveFrames(hiveId: string): Promise<Frame[]> {
    try {
      const response = await axios.get(`${API_URL}/frames/hives/${hiveId}/frames`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting hive frames:', error);
      throw new Error(error.response?.data?.error || 'Failed to get hive frames');
    }
  },

  /**
   * Get frame by ID
   */
  async getFrame(frameId: string): Promise<Frame> {
    try {
      const response = await axios.get(`${API_URL}/frames/frames/${frameId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting frame:', error);
      throw new Error(error.response?.data?.error || 'Failed to get frame');
    }
  },

  /**
   * Create a new frame
   */
  async createFrame(hiveId: string, data: CreateFrameData): Promise<Frame> {
    try {
      const response = await axios.post(`${API_URL}/frames/hives/${hiveId}/frames`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating frame:', error);
      throw new Error(error.response?.data?.error || 'Failed to create frame');
    }
  },

  /**
   * Update frame
   */
  async updateFrame(frameId: string, data: Partial<FrameData>): Promise<Frame> {
    try {
      const response = await axios.put(`${API_URL}/frames/frames/${frameId}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating frame:', error);
      throw new Error(error.response?.data?.error || 'Failed to update frame');
    }
  },

  /**
   * Delete frame
   */
  async deleteFrame(frameId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/frames/frames/${frameId}`);
    } catch (error: any) {
      console.error('Error deleting frame:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete frame');
    }
  },

  /**
   * Get frame history (snapshots)
   */
  async getFrameHistory(frameId: string, limit?: number): Promise<FrameSnapshot[]> {
    try {
      const params = limit ? { limit } : {};
      const response = await axios.get(`${API_URL}/frames/frames/${frameId}/history`, { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting frame history:', error);
      throw new Error(error.response?.data?.error || 'Failed to get frame history');
    }
  },

  /**
   * Create a snapshot of frame state
   */
  async createSnapshot(frameId: string, data: CreateSnapshotData): Promise<FrameSnapshot> {
    try {
      const response = await axios.post(`${API_URL}/frames/frames/${frameId}/snapshots`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating snapshot:', error);
      throw new Error(error.response?.data?.error || 'Failed to create snapshot');
    }
  },
};

export default frameService;
