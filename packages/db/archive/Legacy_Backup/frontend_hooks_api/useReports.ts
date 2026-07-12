import { useQuery } from '@tanstack/react-query';
import { getDashboardKPIs, getProductionStats, getFinancialSummary, DashboardKPIs, ProductionStats, FinancialSummary } from '@/services/reports';
import { fetchWithAuth, API_URL } from '@/config';

export const reportKeys = {
    all: ['reports'] as const,
    kpis: () => [...reportKeys.all, 'kpis'] as const,
    production: () => [...reportKeys.all, 'production'] as const,
    financial: () => [...reportKeys.all, 'financial'] as const,
    productionList: () => [...reportKeys.all, 'productionList'] as const,
};

export function useDashboardKPIs() {
    return useQuery({
        queryKey: reportKeys.kpis(),
        queryFn: getDashboardKPIs,
    });
}

export function useProductionStats() {
    return useQuery({
        queryKey: reportKeys.production(),
        queryFn: getProductionStats,
    });
}

export function useFinancialSummary() {
    return useQuery({
        queryKey: reportKeys.financial(),
        queryFn: getFinancialSummary,
    });
}

export function useProductionReport() {
    return useQuery({
        queryKey: reportKeys.productionList(),
        queryFn: async () => {
            const res = await fetchWithAuth(`${API_URL}/reports/export?type=production&format=json`);
            if (!res.ok) throw new Error('Failed to fetch production report');
            return res.json();
        },
    });
}
