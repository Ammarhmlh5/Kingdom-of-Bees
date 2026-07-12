import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as diseasesService from '@/services/diseases';

export const diseasesKeys = {
    all: ['diseases'] as const,
    lists: () => [...diseasesKeys.all, 'list'] as const,
    details: () => [...diseasesKeys.all, 'detail'] as const,
    detail: (id: string) => [...diseasesKeys.details(), id] as const,
    treatments: (diseaseId: string) => [...diseasesKeys.detail(diseaseId), 'treatments'] as const,
    records: () => [...diseasesKeys.all, 'records'] as const,
    apiaryRecords: (apiaryId: string) => [...diseasesKeys.records(), 'apiary', apiaryId] as const,
    nearby: (lat: number, lng: number, radius: number) => [...diseasesKeys.records(), 'nearby', { lat, lng, radius }] as const,
};

export function useDiseases() {
    return useQuery({
        queryKey: diseasesKeys.lists(),
        queryFn: diseasesService.getDiseases,
    });
}

export function useDisease(id: string) {
    return useQuery({
        queryKey: diseasesKeys.detail(id),
        queryFn: () => diseasesService.getDiseaseById(id),
        enabled: !!id,
    });
}

export function useDiseaseTreatments(diseaseId: string) {
    return useQuery({
        queryKey: diseasesKeys.treatments(diseaseId),
        queryFn: () => diseasesService.getTreatments(diseaseId),
        enabled: !!diseaseId,
    });
}

export function useApiaryDiseaseRecords(apiaryId: string) {
    return useQuery({
        queryKey: diseasesKeys.apiaryRecords(apiaryId),
        queryFn: () => diseasesService.getApiaryDiseaseRecords(apiaryId),
        enabled: !!apiaryId,
    });
}

export function useNearbyDiseases(lat: number, lng: number, radius: number = 10) {
    return useQuery({
        queryKey: diseasesKeys.nearby(lat, lng, radius),
        queryFn: () => diseasesService.getNearbyDiseases(lat, lng, radius),
        enabled: !!(lat && lng),
    });
}

export function useCreateDiseaseRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: diseasesService.createDiseaseRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: diseasesKeys.records() });
        },
    });
}

/**
 * Health Page Compatibility Aliases
 */
export function useHealthRecords(apiaryId?: string) {
    if (apiaryId) {
        return useQuery({
            queryKey: diseasesKeys.apiaryRecords(apiaryId),
            queryFn: () => diseasesService.getApiaryDiseaseRecords(apiaryId),
        });
    }
    return useQuery({
        queryKey: diseasesKeys.records(),
        queryFn: diseasesService.getDiseaseRecords,
    });
}

export function useNearbyAlerts(lat: number, lng: number, radius: number = 10) {
    return useQuery({
        queryKey: diseasesKeys.nearby(lat, lng, radius),
        queryFn: () => diseasesService.getNearbyDiseases(lat, lng, radius),
        enabled: !!(lat && lng),
    });
}
