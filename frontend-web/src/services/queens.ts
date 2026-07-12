import api from './api';

export interface Queen {
    id: string;
    queenNumber?: string;
    name?: string;
    source: string;
    status: string;
    beeBreedId?: string;
    beeBreed?: { nameAr: string; nameEn: string };
    birthDate?: string;
    introductionDate?: string;
    marked: boolean;
    markColor?: string;
    currentHiveId?: string;
    hive?: { id: string; hiveNumber: string; name?: string };
    createdAt: string;
}

export interface CreateQueenInput {
    queenNumber?: string;
    source: string;
    beeBreedId?: string;
    birthDate?: string;
    introductionDate?: string;
    marked?: boolean;
    markColor?: string;
    hiveId?: string;
}

export const queensService = {
    getQueens: async (apiaryId: string): Promise<Queen[]> => {
        const response = await api.get(`/apiaries/${apiaryId}/queens`);
        return response.data;
    },

    createQueen: async (apiaryId: string, data: CreateQueenInput): Promise<Queen> => {
        const response = await api.post(`/apiaries/${apiaryId}/queens`, data);
        return response.data;
    },

    deleteQueen: async (apiaryId: string, queenId: string): Promise<void> => {
        await api.delete(`/apiaries/${apiaryId}/queens/${queenId}`);
    }
};
