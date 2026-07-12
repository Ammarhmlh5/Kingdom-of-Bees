import api from './api';

export interface Disease {
    id: string;
    name: string;
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    symptoms: string[];
    treatment: string[];
}

export interface DiseaseRecord {
    id: string;
    diseaseId: string;
    hiveId?: string;
    apiaryId: string;
    status: 'ACTIVE' | 'TREATED' | 'RESOLVED';
    reportedAt: string;
    resolvedAt?: string;
    notes?: string;
    disease?: Disease;
}

// Get active disease records for an apiary
export const getActive = async (apiaryId: string): Promise<DiseaseRecord[]> => {
    const response = await api.get(`/apiaries/${apiaryId}/diseases`);
    return response.data;
};

// Get disease library
export const getLibrary = async (apiaryId: string): Promise<Disease[]> => {
    const response = await api.get(`/apiaries/${apiaryId}/diseases/library`);
    return response.data;
};

// Report disease outbreak
export const reportOutbreak = async (apiaryId: string, data: any): Promise<DiseaseRecord> => {
    const response = await api.post(`/apiaries/${apiaryId}/diseases`, data);
    return response.data;
};

// Resolve disease
export const resolve = async (apiaryId: string, recordId: string, outcome: string): Promise<DiseaseRecord> => {
    const response = await api.put(`/apiaries/${apiaryId}/diseases/${recordId}/resolve`, { outcome });
    return response.data;
};

// Service object export
export const diseaseService = {
    getActive,
    getLibrary,
    reportOutbreak,
    resolve
};
