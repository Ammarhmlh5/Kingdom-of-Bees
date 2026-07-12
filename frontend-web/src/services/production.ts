import api from './api';

export interface HoneyHarvest {
    id: string;
    harvestRecordId: string;
    hiveId: string;
    quantityKg: number;
    framesHarvested?: number;
    moisturePercentage?: number;
    botanicalSource?: string;
}

export interface PollenHarvest {
    id: string;
    harvestRecordId: string;
    hiveId: string;
    quantityKg: number;
}

export interface RoyalJellyProduction {
    id: string;
    harvestRecordId: string;
    hiveId: string;
    quantityGrams: number;
}

export interface HoneyHarvestInput {
    harvestDate: string;
    hiveId: string;
    quantityKg: number;
    framesHarvested?: number;
    moisturePercentage?: number;
    botanicalSource?: string;
}

export interface PollenHarvestInput {
    harvestDate: string;
    hiveId: string;
    quantityKg: number;
}

export const productionService = {
    recordHoneyHarvest: async (apiaryId: string, data: HoneyHarvestInput): Promise<HoneyHarvest> => {
        const response = await api.post(`/apiaries/${apiaryId}/harvest/honey`, data);
        return response.data;
    },

    getHarvestRecords: async (apiaryId: string): Promise<any[]> => {
        const response = await api.get(`/apiaries/${apiaryId}/harvest`);
        return response.data?.data || response.data || [];
    },

    getHarvestRecord: async (apiaryId: string, recordId: string): Promise<any> => {
        const response = await api.get(`/apiaries/${apiaryId}/harvest/${recordId}`);
        return response.data;
    }
};
