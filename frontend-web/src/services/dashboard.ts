import api from './api';

export interface DashboardKPIs {
    totalHives: number;
    activeHives: number;
    healthScore: number;
    tasksDue: number;
    totalApiaries: number;
    pendingInspections: number;
    honeyProducedThisMonth: number;
    queensActive: number;
}

export interface ProductionStats {
    year: number;
    monthlyHoneyKg: number[];
    monthlyPollenKg: number[];
    totalHoneyKg: number;
    totalPollenKg: number;
}

export interface FinancialSummary {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
}

export const dashboardService = {
    getKPIs: async (): Promise<DashboardKPIs> => {
        try {
            const response = await api.get('/apiaries/stats/dashboard');
            return response.data?.data || response.data || {
                totalHives: 0, activeHives: 0, healthScore: 0, tasksDue: 0,
                totalApiaries: 0, pendingInspections: 0, honeyProducedThisMonth: 0, queensActive: 0
            };
        } catch {
            return { totalHives: 0, activeHives: 0, healthScore: 0, tasksDue: 0, totalApiaries: 0, pendingInspections: 0, honeyProducedThisMonth: 0, queensActive: 0 };
        }
    },

    getProductionStats: async (apiaryId?: string): Promise<ProductionStats> => {
        try {
            const url = apiaryId ? `/apiaries/${apiaryId}/stats/dashboard` : '/apiaries/stats/dashboard';
            const response = await api.get(url);
            return response.data?.data || response.data || {
                year: new Date().getFullYear(), monthlyHoneyKg: Array(12).fill(0),
                monthlyPollenKg: Array(12).fill(0), totalHoneyKg: 0, totalPollenKg: 0
            };
        } catch {
            return { year: new Date().getFullYear(), monthlyHoneyKg: Array(12).fill(0), monthlyPollenKg: Array(12).fill(0), totalHoneyKg: 0, totalPollenKg: 0 };
        }
    },

    getFinancialSummary: async (apiaryId?: string): Promise<FinancialSummary> => {
        try {
            const url = apiaryId ? `/apiaries/${apiaryId}/financials` : '#';
            if (!apiaryId) return { totalRevenue: 0, totalExpenses: 0, netProfit: 0 };
            const response = await api.get(url);
            return response.data?.summary || { totalRevenue: 0, totalExpenses: 0, netProfit: 0 };
        } catch {
            return { totalRevenue: 0, totalExpenses: 0, netProfit: 0 };
        }
    }
};
