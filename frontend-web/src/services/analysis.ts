
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

export interface StrengthAnalysis {
    rating: string;
    score: number;
    factors: Record<string, string>;
}

export interface FeedingNeed {
    urgency: string;
    needed: boolean;
    type?: string;
    quantityKg?: number;
    reason?: string;
    recommendations: Array<{ rec: string; index: number }>;
}

export interface SwarmRisk {
    risk: string;
    score: number;
    factors: Record<string, string>;
    recommendations: Array<{ rec: string; index: number }>;
}

export interface FrameTrend {
    frameId: string;
    position: number;
    date: string;
    brood: number;
    honey: number;
    pollen: number;
    trends: {
        honeyTrend: string;
        broodTrend: string;
        pollenTrend: string;
    };
}

export interface HiveAnalysis {
    hiveId: string;
    stats: HiveStats;
    trends: FrameTrend[];
    alerts: any[];
    recommendations: any[];
    strength?: StrengthAnalysis;
    feedingNeed?: FeedingNeed;
    swarmRisk?: SwarmRisk;
    analyzedAt?: string;
}

export const analysisService = {
    getAnalysis: async (hiveId: string): Promise<HiveAnalysis> => {
        const response = await api.get(`/apiaries/${hiveId}/analytics`);
        return response.data?.data || response.data || {
            hiveId,
            stats: { broodFrames: 0, honeyFrames: 0, pollenFrames: 0, emptyFrames: 0, population: 0, strength: 'MEDIUM', trend: 'STABLE', history: [] },
            trends: [], alerts: [], recommendations: [],
            strength: { rating: 'MEDIUM', score: 50, factors: {} },
            feedingNeed: { urgency: 'LOW', needed: false, recommendations: [] },
            swarmRisk: { risk: 'LOW', score: 10, factors: {}, recommendations: [] },
        };
    },

    analyzeHive: async (hiveId: string): Promise<HiveAnalysis> => {
        const response = await api.get(`/apiaries/${hiveId}/analytics`);
        return response.data?.data || response.data || {
            hiveId,
            stats: { broodFrames: 0, honeyFrames: 0, pollenFrames: 0, emptyFrames: 0, population: 0, strength: 'MEDIUM', trend: 'STABLE', history: [] },
            trends: [], alerts: [], recommendations: [],
            strength: { rating: 'MEDIUM', score: 50, factors: {} },
            feedingNeed: { urgency: 'LOW', needed: false, recommendations: [] },
            swarmRisk: { risk: 'LOW', score: 10, factors: {}, recommendations: [] },
        };
    }
};

export default analysisService;
