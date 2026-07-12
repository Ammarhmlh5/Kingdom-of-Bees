
import api from './api';

export interface HiveStats {
    broodFrames: number;
    honeyFrames: number;
    pollenFrames: number;
    emptyFrames: number;
    population: number;
    strength: string;
    trend: string;
    history: any[];
}

export interface FrameTrend {
    date: string;
    brood: number;
    honey: number;
    pollen: number;
}

export interface HiveAnalysis {
    hiveId: string;
    stats: HiveStats;
    trends: FrameTrend[];
    alerts: any[];
    recommendations: any[];
}

export const analysisService = {
    getAnalysis: async (hiveId: string): Promise<HiveAnalysis> => {
        const response = await api.get(`/apiaries/${hiveId}/analytics`);
        return response.data?.data || response.data || {
            hiveId,
            stats: { broodFrames: 0, honeyFrames: 0, pollenFrames: 0, emptyFrames: 0, population: 0, strength: 'MEDIUM', trend: 'STABLE', history: [] },
            trends: [], alerts: [], recommendations: []
        };
    }
};

export default analysisService;
