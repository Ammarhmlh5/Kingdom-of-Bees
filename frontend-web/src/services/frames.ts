
import api from './api';

export interface Frame {
    id: string;
    position: number;
    story?: number;
    frameType?: string;
    broodPercentage?: number;
    honeyPercentage?: number;
    pollenPercentage?: number;
    condition?: string;
    ageYears?: number;
    // Legacy fields for backward compatibility
    sideAHoneyPercentage?: number;
    sideBHoneyPercentage?: number;
    sideABroodPercentage?: number;
    sideBBroodPercentage?: number;
    sideAPollenPercentage?: number;
    sideBPollenPercentage?: number;
    sideABroodAge?: string;
    sideBBroodAge?: string;
    content?: string;
}

export interface FrameData {
    position: number;
    sideAHoneyPercentage: number;
    sideABroodPercentage: number;
    sideAPollenPercentage: number;
    sideABroodAge: string;
    sideBHoneyPercentage: number;
    sideBBroodPercentage: number;
    sideBPollenPercentage: number;
    sideBBroodAge: string;
    frameType: string;
    condition: string;
    notes?: string;
}

export interface CreateSnapshotData {
    frames: Frame[];
}

export interface FrameSnapshot {
    id: string;
    frameId: string;
    snapshot: Frame;
    capturedAt: string;
}

export interface FrameUpdate {
    id?: string;
    position?: number;
    story?: number;
    frameType?: string;
    condition?: string;
    broodPercentage?: number;
    honeyPercentage?: number;
    pollenPercentage?: number;
    broodType?: string;
    ageYears?: number;
    delete?: boolean;
}

export interface UpdateFramesData {
    frames: FrameUpdate[];
}

export const getHiveFrames = async (apiaryId: string, hiveId: string): Promise<Frame[]> => {
    console.log('[frames.ts] getHiveFrames called', { apiaryId, hiveId });
    try {
        const response = await api.get(`/apiaries/${apiaryId}/hives/${hiveId}/frames`);
        console.log('[frames.ts] Status:', response.status);
        console.log('[frames.ts] Data keys:', Object.keys(response.data || {}));
        console.log('[frames.ts] frames value:', response.data?.frames);
        console.log('[frames.ts] type of frames:', typeof response.data?.frames);
        console.log('[frames.ts] is frames array:', Array.isArray(response.data?.frames));
        
        const frames = response.data?.frames;
        if (!frames) {
            console.warn('[frames.ts] WARNING: frames is undefined!');
            return [];
        }
        if (!Array.isArray(frames)) {
            console.warn('[frames.ts] WARNING: frames is not an array!', frames);
            return [];
        }
        console.log('[frames.ts] Returning frames with length:', frames.length);
        return frames;
    } catch (err) {
        console.error('[frames.ts] Error:', err);
        throw err;
    }
};

export const updateFrames = async (apiaryId: string, hiveId: string, frames: UpdateFramesData): Promise<any> => {
    const response = await api.put(`/apiaries/${apiaryId}/hives/${hiveId}/frames`, frames);
    return response.data;
};

export const updateFrame = async (apiaryId: string, hiveId: string, frameId: string, data: any) => {
    const response = await api.put(`/apiaries/${apiaryId}/hives/${hiveId}/frames`, { frames: [{ id: frameId, ...data }] });
    return response.data;
};

export const createSnapshot = async (apiaryId: string, hiveId: string, data: CreateSnapshotData): Promise<any> => {
    const response = await api.post(`/apiaries/${apiaryId}/hives/${hiveId}/frames/snapshot`, data);
    return response.data;
};

export const frameService = { getHiveFrames, updateFrames, updateFrame, createSnapshot };
