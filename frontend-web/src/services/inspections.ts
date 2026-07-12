import api from './api';

export interface Inspection {
    id: string;
    hiveId: string;
    apiaryId: string;
    date: string;
    inspectorId: string;
    type: 'ROUTINE' | 'DISEASE_CHECK' | 'HARVEST' | 'QUEEN_CHECK' | 'OTHER';
    queenSeen: boolean;
    queenMarked?: boolean;
    broodPattern?: 'EXCELLENT' | 'GOOD' | 'SPOTTY' | 'POOR';
    temperament?: 'CALM' | 'DEFENSIVE' | 'AGGRESSIVE';
    honeyStores?: 'FULL' | 'ADEQUATE' | 'LOW' | 'EMPTY';
    pollenStores?: 'FULL' | 'ADEQUATE' | 'LOW' | 'EMPTY';
    diseasesSeen?: string[];
    pestsSeen?: string[];
    notes?: string;
    weather?: string;
    temperature?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInspectionData {
    hiveId: string;
    type: 'ROUTINE' | 'DISEASE_CHECK' | 'HARVEST' | 'QUEEN_CHECK' | 'OTHER';
    queenSeen: boolean;
    queenMarked?: boolean;
    broodPattern?: 'EXCELLENT' | 'GOOD' | 'SPOTTY' | 'POOR';
    temperament?: 'CALM' | 'DEFENSIVE' | 'AGGRESSIVE';
    honeyStores?: 'FULL' | 'ADEQUATE' | 'LOW' | 'EMPTY';
    pollenStores?: 'FULL' | 'ADEQUATE' | 'LOW' | 'EMPTY';
    diseasesSeen?: string[];
    pestsSeen?: string[];
    notes?: string;
    weather?: string;
    temperature?: number;
}

// Get all inspections for an apiary
export const getInspections = async (apiaryId: string): Promise<Inspection[]> => {
    const response = await api.get(`/apiaries/${apiaryId}/inspections`);
    // Handle both response formats: direct array or wrapped object
    return Array.isArray(response.data) ? response.data : (response.data as any).data || [];
};

// Get single inspection (requires apiaryId)
export const getInspection = async (apiaryId: string, id: string): Promise<Inspection> => {
    const response = await api.get(`/apiaries/${apiaryId}/inspections/${id}`);
    return response.data;
};

// Get inspections for a specific hive
export const getHiveInspections = async (apiaryId: string, hiveId: string): Promise<Inspection[]> => {
    // Note: Backend must support filtering by hiveId on the apiary inspections route
    const response = await api.get(`/apiaries/${apiaryId}/inspections?hiveId=${hiveId}`);
    return response.data;
};

// Create inspection
// Create inspection (requires apiaryId)
export const createInspection = async (apiaryId: string, data: CreateInspectionData): Promise<Inspection> => {
    const response = await api.post(`/apiaries/${apiaryId}/inspections`, data);
    return response.data;
};

// Update inspection
export const updateInspection = async (apiaryId: string, id: string, data: Partial<CreateInspectionData>): Promise<Inspection> => {
    const response = await api.put(`/apiaries/${apiaryId}/inspections/${id}`, data);
    return response.data;
};

// Delete inspection
export const deleteInspection = async (apiaryId: string, id: string): Promise<void> => {
    await api.delete(`/apiaries/${apiaryId}/inspections/${id}`);
};

// Service object export
export const inspectionService = {
    getInspections,
    getInspection,
    getHiveInspections,
    createInspection,
    updateInspection,
    deleteInspection
};
