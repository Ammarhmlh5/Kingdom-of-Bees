import { API_URL, fetchWithAuth } from '@/config';

export interface DashboardKPIs {
    totalApiaries?: number; // Owner
    assignedApiaries?: number; // Worker
    totalHives: number;
    healthScore?: number;
    sickHives?: number;
    tasksDue: number;
}

export interface ProductionStats {
    year: number;
    monthlyHoneyKg: number[];
}

export interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    breakdown: Record<string, number>;
}

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
    const response = await fetchWithAuth(`${API_URL}/reports/kpis`);
    if (!response.ok) throw new Error('Failed to fetch KPIs');
    return response.json();
}

export async function getProductionStats(): Promise<ProductionStats> {
    const response = await fetchWithAuth(`${API_URL}/reports/production`);
    if (!response.ok) throw new Error('Failed to fetch production stats');
    return response.json();
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
    const response = await fetchWithAuth(`${API_URL}/reports/financial`);
    if (!response.ok) throw new Error('Failed to fetch financial summary');
    return response.json();
}
