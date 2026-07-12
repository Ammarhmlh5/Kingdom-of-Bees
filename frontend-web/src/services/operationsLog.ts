import api from './api';

export type OperationType = 'INSPECTION' | 'FEEDING' | 'HARVEST' | 'SPLIT' | 'MERGE' | 'TREATMENT' | 'ADD_SUPER';

export interface Operation {
    id: string;
    apiaryId: string;
    operationNumber: number;
    operationType: OperationType;
    hiveId?: string;
    hive?: { hiveNumber: string; name?: string };
    description: string;
    performedBy?: string;
    performer?: { fullName: string };
    operationDate: string;
    data?: Record<string, any>;
    createdAt: string;
}

export interface OperationFilters {
    operationType?: OperationType;
    startDate?: string;
    endDate?: string;
}

export interface UpdateOperationInput {
    description?: string;
    operationDate?: string;
    data?: Record<string, any>;
}

export const operationsLogService = {
    getOperations: async (apiaryId: string, filters: OperationFilters = {}): Promise<Operation[]> => {
        const response = await api.get(`/apiaries/${apiaryId}/operations`, { params: filters });
        return response.data;
    },

    updateOperation: async (apiaryId: string, operationId: string, data: UpdateOperationInput): Promise<Operation> => {
        const response = await api.put(`/apiaries/${apiaryId}/operations/${operationId}`, data);
        return response.data;
    },

    deleteOperation: async (apiaryId: string, operationId: string): Promise<void> => {
        await api.delete(`/apiaries/${apiaryId}/operations/${operationId}`);
    }
};
