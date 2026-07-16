
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
    sideAHoneyPercentage?: number;
    sideBHoneyPercentage?: number;
    sideABroodPercentage?: number;
    sideBBroodPercentage?: number;
    sideAPollenPercentage?: number;
    sideBPollenPercentage?: number;
    sideABroodAge?: string;
    sideBBroodAge?: string;
    sideABroodType?: string;
    sideBBroodType?: string;
    content?: string;
    hiveId?: string;
    lastUpdated?: string;
    updatedBy?: string;
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
    frames?: Frame[];
    inspectionId?: string;
    frameId?: string;
    notes?: string;
    sideAHoneyPercentage?: number;
    sideBHoneyPercentage?: number;
    sideABroodPercentage?: number;
    sideBBroodPercentage?: number;
    sideAPollenPercentage?: number;
    sideBPollenPercentage?: number;
    sideABroodAge?: string;
    sideBBroodAge?: string;
    sideABroodType?: string;
    sideBBroodType?: string;
    sideABroodAgeYears?: number;
    sideBBroodAgeYears?: number;
}

export interface FrameSnapshot {
    id: string;
    frameId: string;
    snapshot: Frame;
    capturedAt: string;
    recordedAt?: string;
    user?: { id: string; name: string; email: string };
    inspection?: { id: string; date: string };
    inspectionId?: string;
    notes?: string;
    sideAHoneyPercentage?: number;
    sideBHoneyPercentage?: number;
    sideABroodPercentage?: number;
    sideBBroodPercentage?: number;
    sideAPollenPercentage?: number;
    sideBPollenPercentage?: number;
    sideABroodAge?: string;
    sideBBroodAge?: string;
    sideABroodType?: string;
    sideBBroodType?: string;
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
    const response = await api.get(`/apiaries/${apiaryId}/hives/${hiveId}/frames`);
    const frames = response.data?.frames || response.data?.data || response.data;
    if (!Array.isArray(frames)) return [];
    return frames;
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

export const getFrameHistory = async (apiaryId: string, hiveId: string, frameId: string): Promise<FrameSnapshot[]> => {
    const response = await api.get(`/apiaries/${apiaryId}/hives/${hiveId}/frames/${frameId}/snapshots`);
    return response.data?.data || response.data || [];
};

export const frameService = { getHiveFrames, updateFrames, updateFrame, createSnapshot, getFrameHistory };
