import api from './api';

export type AssessmentType = 'FLIGHT_ASSESSMENT' | 'POLLEN_ASSESSMENT' | 'WEATHER_LOG';

export interface AssessmentOperation {
    id: string;
    apiaryId: string;
    operationNumber: number;
    hiveId?: string;
    hive?: { hiveNumber: string; name?: string };
    description: string;
    performedBy?: string;
    performer?: { fullName: string };
    operationDate: string;
    data?: {
        assessmentType: AssessmentType;
        duration?: number;
        beeCount?: number;
        beesPerMinute?: number;
        pollenCarryingBees?: number;
        pollenColors?: string;
        temperature?: number;
        humidity?: number;
        rainfall?: number;
        windSpeed?: number;
        weatherCode?: number;
        conditions?: string;
        source?: string;
        notes?: string;
    };
    createdAt: string;
}

export interface AssessmentFilters {
    assessmentType?: AssessmentType;
    startDate?: string;
    endDate?: string;
}

export const evaluationsLogService = {
    getAssessments: async (apiaryId: string, filters: AssessmentFilters = {}): Promise<AssessmentOperation[]> => {
        const response = await api.get(`/apiaries/${apiaryId}/operations`, {
            params: { ...filters, operationType: undefined }
        });
        return response.data;
    },

    deleteAssessment: async (apiaryId: string, assessmentId: string): Promise<void> => {
        await api.delete(`/apiaries/${apiaryId}/operations/${assessmentId}`);
    }
};
