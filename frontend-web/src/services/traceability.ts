import api from './api';

export interface Batch {
    id: string;
    batchCode: string;
    harvestDate: string;
    totalQuantityKg: number;
    bestBeforeDate: string;
    processingStatus: string;
    apiary?: { name: string };
    harvestRecordIds: string[];
}

export const getBatches = async (): Promise<Batch[]> => {
    const response = await api.get('/traceability/batches');
    return response.data;
};

export const getBatchDetails = async (id: string): Promise<Batch> => {
    const response = await api.get(`/traceability/batches/${id}`);
    return response.data;
};

export const getBatchQR = async (batchCode: string): Promise<{ qrImage: string; url: string }> => {
    const response = await api.get(`/traceability/batches/${batchCode}/qr`);
    return response.data;
};

export const createBatch = async (data: {
    harvestRecordIds: string[];
    totalQuantityKg: number;
    bestBeforeDate: Date;
}): Promise<Batch> => {
    const response = await api.post('/traceability/batches', data);
    return response.data;
};

export const traceabilityService = {
    getBatches,
    getBatchDetails,
    getBatchQR,
    createBatch,
};
