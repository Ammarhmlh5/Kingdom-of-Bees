import api from './api';

export interface Nucleus {
    id: string;
    apiaryId: string;
    nucleusNumber: string;
    name?: string;
    queenId?: string;
    status: string;
    purpose: string;
    frameCount: number;
    strengthScore?: number;
    createdDate: string;
}

export const nucleiService = {
    getNuclei: async (apiaryId: string): Promise<Nucleus[]> => {
        try {
            const response = await api.get(`/apiaries/${apiaryId}/nuclei`);
            return Array.isArray(response.data) ? response.data : response.data?.data || [];
        } catch {
            return [];
        }
    }
};
