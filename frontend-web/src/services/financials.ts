import api from './api';

export interface FinancialRecord {
    id: string;
    apiaryId: string;
    type: 'REVENUE' | 'EXPENSE';
    amount: number;
    currency: string;
    category: string;
    description?: string;
    recordDate: string;
    createdAt: string;
}

export interface FinancialSummary {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    period: { from: string; to: string };
}

export interface FinancialData {
    records: FinancialRecord[];
    summary: FinancialSummary;
}

export interface CreateFinancialInput {
    type: 'REVENUE' | 'EXPENSE';
    amount: number;
    category: string;
    description?: string;
    recordDate: string;
}

export const financialsService = {
    getFinancials: async (apiaryId: string, period: string = 'month'): Promise<FinancialData> => {
        const response = await api.get(`/apiaries/${apiaryId}/financials`, { params: { period } });
        return response.data;
    },

    createRecord: async (apiaryId: string, data: CreateFinancialInput): Promise<FinancialRecord> => {
        const response = await api.post(`/apiaries/${apiaryId}/financials`, data);
        return response.data;
    },

    deleteRecord: async (apiaryId: string, recordId: string): Promise<void> => {
        await api.delete(`/apiaries/${apiaryId}/financials/${recordId}`);
    }
};
