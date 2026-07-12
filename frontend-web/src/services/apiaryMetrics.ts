import api from './api';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ApiaryMetrics {
    id: string;
    apiaryId: string;
    overallStrength: number; // 0-100
    strengthRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WEAK';
    totalHives: number;
    excellentHives: number;
    goodHives: number;
    weakHives: number;
    excellentPercent: number;
    goodPercent: number;
    weakPercent: number;
    excellentTrend: number; // +2, -1, 0
    goodTrend: number;
    weakTrend: number;
    calculatedAt: string;
}

export interface HiveTypeBreakdown {
    excellent: {
        count: number;
        percent: number;
        trend: number;
    };
    good: {
        count: number;
        percent: number;
        trend: number;
    };
    weak: {
        count: number;
        percent: number;
        trend: number;
    };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get latest metrics for an apiary
 * Automatically recalculates if older than 1 hour
 */
export const getApiaryMetrics = async (apiaryId: string): Promise<ApiaryMetrics> => {
    const response = await api.get(`/apiaries/${apiaryId}/metrics`);
    return response.data.data;
};

/**
 * Force recalculation of metrics
 */
export const calculateApiaryMetrics = async (apiaryId: string): Promise<ApiaryMetrics> => {
    const response = await api.post(`/apiaries/${apiaryId}/metrics/calculate`);
    return response.data.data;
};

/**
 * Get metrics history for an apiary
 * @param apiaryId - The apiary ID
 * @param days - Number of days to fetch (default: 30)
 */
export const getMetricsHistory = async (apiaryId: string, days: number = 30): Promise<ApiaryMetrics[]> => {
    const response = await api.get(`/apiaries/${apiaryId}/metrics/history`, {
        params: { days }
    });
    return response.data.data;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert metrics to breakdown format for UI components
 */
export const metricsToBreakdown = (metrics: ApiaryMetrics): HiveTypeBreakdown => {
    return {
        excellent: {
            count: metrics.excellentHives,
            percent: metrics.excellentPercent,
            trend: metrics.excellentTrend
        },
        good: {
            count: metrics.goodHives,
            percent: metrics.goodPercent,
            trend: metrics.goodTrend
        },
        weak: {
            count: metrics.weakHives,
            percent: metrics.weakPercent,
            trend: metrics.weakTrend
        }
    };
};

/**
 * Get color based on strength rating
 */
export const getStrengthColor = (rating: string): string => {
    switch (rating) {
        case 'EXCELLENT':
            return 'green';
        case 'GOOD':
            return 'yellow';
        case 'FAIR':
            return 'orange';
        case 'WEAK':
            return 'red';
        default:
            return 'gray';
    }
};

/**
 * Get Arabic label for strength rating
 */
export const getStrengthLabel = (rating: string): string => {
    switch (rating) {
        case 'EXCELLENT':
            return 'ممتاز';
        case 'GOOD':
            return 'جيد';
        case 'FAIR':
            return 'متوسط';
        case 'WEAK':
            return 'ضعيف';
        default:
            return 'غير محدد';
    }
};

/**
 * Get trend icon
 */
export const getTrendIcon = (trend: number): string => {
    if (trend > 0) return '↑';
    if (trend < 0) return '↓';
    return '→';
};

/**
 * Get trend color
 */
export const getTrendColor = (trend: number): string => {
    if (trend > 0) return 'green';
    if (trend < 0) return 'red';
    return 'gray';
};
