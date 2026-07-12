import api from './api';

export interface Plant {
    id: string;
    scientificName: string;
    commonNameAr: string;
    commonNameEn?: string;
    plantType?: string;
    family?: string;
    beekeepingValue?: any;
    flowering?: any;
}

export interface LocalPlant {
    id: string;
    apiaryId: string;
    plantId: string;
    plant?: Plant;
    coverage?: number;
    coverageUnit?: string;
    distanceKm?: number;
    direction?: string;
    bloomStartDate?: string;
    bloomEndDate?: string;
    status?: string;
    addedDate?: string;
    notes?: string;
}

export const plantsService = {
    getApiaryPlants: async (apiaryId: string): Promise<LocalPlant[]> => {
        try {
            const response = await api.get(`/apiaries/${apiaryId}/plants`);
            return Array.isArray(response.data) ? response.data : response.data?.data || [];
        } catch {
            return [];
        }
    },

    searchPlants: async (query: string): Promise<Plant[]> => {
        try {
            const response = await api.get(`/plants/search?q=${encodeURIComponent(query)}`);
            return Array.isArray(response.data) ? response.data : response.data?.data || [];
        } catch {
            return [];
        }
    },

    addLocalPlant: async (apiaryId: string, data: {
        plantId: string;
        coverage: number;
        coverageUnit: string;
        distanceKm?: number;
        direction?: string;
        bloomStartDate?: string;
    }): Promise<LocalPlant> => {
        const response = await api.post(`/apiaries/${apiaryId}/plants`, data);
        return response.data;
    },

    updateLocalPlant: async (apiaryId: string, plantId: string, data: {
        bloomStartDate?: string;
        bloomEndDate?: string;
        distanceKm?: number;
        direction?: string;
        coverage?: number;
        coverageUnit?: string;
        notes?: string;
    }): Promise<LocalPlant> => {
        const response = await api.put(`/apiaries/${apiaryId}/plants/${plantId}`, data);
        return response.data;
    },

    removeLocalPlant: async (apiaryId: string, plantId: string): Promise<void> => {
        await api.delete(`/apiaries/${apiaryId}/plants/${plantId}`);
    }
};
