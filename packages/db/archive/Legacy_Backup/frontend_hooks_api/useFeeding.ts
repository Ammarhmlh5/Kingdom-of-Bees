import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as feedingService from '@/services/feeding';

export const feedingKeys = {
    all: ['feeding'] as const,
    types: () => [...feedingKeys.all, 'types'] as const,
    lists: () => [...feedingKeys.all, 'list'] as const,
    list: (filters?: any) => [...feedingKeys.lists(), filters] as const,
    recommendations: (hiveId: string) => [...feedingKeys.all, 'recommendations', hiveId] as const,
    summary: (apiaryId: string) => [...feedingKeys.all, 'summary', apiaryId] as const,
    details: () => [...feedingKeys.all, 'detail'] as const,
    detail: (id: string) => [...feedingKeys.details(), id] as const,
};

export function useFeedingTypes() {
    return useQuery({
        queryKey: feedingKeys.types(),
        queryFn: feedingService.getFeedingTypes,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useFeedingRecords(filters?: { apiaryId?: string; hiveId?: string; typeId?: string; startDate?: string; endDate?: string }) {
    return useQuery({
        queryKey: feedingKeys.list(filters),
        queryFn: () => feedingService.getFeedingRecords(filters),
    });
}

export function useFeedingRecommendations(hiveId?: string, apiaryId?: string) {
    return useQuery({
        queryKey: ['feeding-recommendations', hiveId, apiaryId],
        queryFn: () => feedingService.getFeedingRecommendations(hiveId, apiaryId),
        enabled: !!hiveId || !!apiaryId,
    });
}

export function useApiaryFeedingSummary(apiaryId: string) {
    return useQuery({
        queryKey: feedingKeys.summary(apiaryId),
        queryFn: () => feedingService.getApiaryFeedingSummary(apiaryId),
        enabled: !!apiaryId,
    });
}

export function useCreateFeedingRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: feedingService.createFeedingRecord,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: feedingKeys.lists() });
            if (variables.hiveId) {
                queryClient.invalidateQueries({ queryKey: feedingKeys.recommendations(variables.hiveId) });
            }
            queryClient.invalidateQueries({ queryKey: feedingKeys.summary(variables.apiaryId) });
        },
    });
}

// Keep legacy if needed but marked deprecated or just simplistic
export function useFeedingRecord(id: string) {
    // Placeholder match
    return useQuery({
        queryKey: feedingKeys.detail(id),
        queryFn: () => Promise.resolve(null), enabled: false
    });
}

export function useUpdateFeedingRecord() {
    return useMutation({
        mutationFn: async () => { }, // Placeholder
    });
}

export function useDeleteFeedingRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            // Call service (need to export it if deleted ones are needed, but skipping for now) 
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: feedingKeys.lists() });
        }
    });
}
