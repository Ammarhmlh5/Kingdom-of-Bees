import api from './api';

export interface HarvestRecord {
    id: string;
    apiaryId: string;
    harvestType: string;
    harvestDate: string;
    totalQuantity: number;
    unit: string;
    apiary?: { name: string };
}

// Get all harvests for the logged-in user (across all apiaries)
export const getMyHarvests = async (): Promise<HarvestRecord[]> => {
    const response = await api.get('/harvest/my');
    return response.data;
};

// Get harvest history for a specific apiary
export const getHistory = async (apiaryId: string): Promise<HarvestRecord[]> => {
    const response = await api.get(`/apiaries/${apiaryId}/harvest`);
    return response.data;
};

// Record new harvest
export const recordHarvest = async (apiaryId: string, data: any): Promise<HarvestRecord> => {
    const response = await api.post(`/apiaries/${apiaryId}/harvest`, data);
    return response.data;
};

// Service object export
export const harvestService = {
    getMyHarvests,
    getHistory,
    recordHarvest
};

