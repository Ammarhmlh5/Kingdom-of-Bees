import api from './api';

export const analyticsService = {
    /**
     * Get predictions and accuracy summary for an apiary
     * GET /api/apiaries/:apiaryId/analytics
     */
    async getAnalyticsSummary(apiaryId: string, hiveId?: string): Promise<AnalyticsSummary> {
        const params = hiveId ? { hiveId } : {};
        const response = await api.get(`/apiaries/${apiaryId}/analytics`, { params });
        return response.data.data;
    }
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PendingPrediction {
    id: string;
    apiaryId: string;
    hiveId: string;
    sourceOperationId: string;
    analysisType: string;
    predictionPayload: {
        riskLevel?: string;
        expectedQuantityKg?: number;
        reason?: string;
        recommendation?: string;
        expectedOutcome?: string;
        [key: string]: any;
    };
    confidenceScore: number | null;
    isResolved: boolean;
    createdAt: string;
    hive: { hiveNumber: string; name: string | null };
}

export interface RecentMatch {
    id: string;
    apiaryId: string;
    analysisId: string;
    resolvingOperationId: string;
    isAccurate: boolean;
    accuracyScore: number;
    predictedData: any;
    actualOutcomeData: any;
    matchedAt: string;
    analysis: { analysisType: string };
}

export interface AccuracySummaryItem {
    analysisType: string;
    averageAccuracy: number;
    totalMatches: number;
}

export interface AnalyticsSummary {
    pendingPredictions: PendingPrediction[];
    recentMatches: RecentMatch[];
    accuracySummary: AccuracySummaryItem[];
    stats: {
        totalPending: number;
        totalMatched: number;
        overallAccuracy: number | null;
    };
}
