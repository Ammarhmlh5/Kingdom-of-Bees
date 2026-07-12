import api from './api';

// ==========================================
// DAILY OPERATIONS SERVICE
// ==========================================

export interface DailyOperation {
    id: string;
    operationType: string;
    operationDate: Date;
    apiaryName?: string;
    hiveNumber?: string;
    hiveName?: string;
    operationData: {
        description: string;
        details?: string;
    };
    performedBy: string;
    notes?: string;
    createdAt: Date;
}

export interface OperationStats {
    totalOperations: number;
    operationsByType: Record<string, number>;
    operationsByWorker: Record<string, number>;
    mostActiveWorker: {
        id: string;
        name: string;
        count: number;
    };
    mostCommonOperation: {
        type: string;
        count: number;
    };
}

export interface OperationType {
    value: string;
    label: string;
}

export interface DailyOperationsFilters {
    apiaryId?: string;
    startDate?: string;
    endDate?: string;
    operationType?: string;
    performedBy?: string;
}

// Get daily operations with filters
export const getDailyOperations = async (filters: DailyOperationsFilters): Promise<DailyOperation[]> => {
    const params = new URLSearchParams();
    
    if (filters.apiaryId) params.append('apiaryId', filters.apiaryId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.operationType) params.append('operationType', filters.operationType);
    if (filters.performedBy) params.append('performedBy', filters.performedBy);
    
    const response = await api.get(`/operations/daily?${params.toString()}`);
    return response.data.data;
};

// Get operation statistics
export const getOperationStats = async (filters: Omit<DailyOperationsFilters, 'operationType' | 'performedBy'>): Promise<OperationStats> => {
    const params = new URLSearchParams();
    
    if (filters.apiaryId) params.append('apiaryId', filters.apiaryId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/operations/stats?${params.toString()}`);
    return response.data.data;
};

// Get all operation types
export const getOperationTypes = async (): Promise<OperationType[]> => {
    const response = await api.get('/operations/types');
    return response.data.data;
};

// Delete operation (rollback)
export const deleteOperation = async (operationId: string): Promise<void> => {
    await api.delete(`/operations/${operationId}`);
};

export const operationsService = {
    getDailyOperations,
    getOperationStats,
    getOperationTypes,
    deleteOperation
};
