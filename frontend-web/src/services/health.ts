import api from './api';

export interface HealthRecord {
    id: string;
    apiaryId: string;
    hiveId?: string;
    diseaseId: string;
    status: string;
    firstDetectedDate: string;
    notes?: string;
    disease?: { nameAr: string; nameEn: string };
}

export async function getHealthRecords(apiaryIdOrContext: string | { queryKey: string[]; signal?: AbortSignal }) {
    const apiaryId = typeof apiaryIdOrContext === 'string' ? apiaryIdOrContext : apiaryIdOrContext.queryKey[1];
    try {
        const response = await api.get(`/apiaries/${apiaryId}/diseases`);
        return response.data;
    } catch (e) {
        console.error("API error in getHealthRecords:", e);
        return [];
    }
}

export async function createHealthRecord(apiaryId: string, data: any) {
    try {
        const response = await api.post(`/apiaries/${apiaryId}/diseases`, data);
        return response.data;
    } catch (e) {
        console.error("API error in createHealthRecord:", e);
        throw e;
    }
}

export const getMyHealthRecords = getHealthRecords;
export const healthService = { getHealthRecords, getMyHealthRecords, createHealthRecord };
