import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeedingRecords, createFeedingRecord } from '@/services/feeding';
import api from '@/services/api';

export function useFeedingTypes() {
    return useQuery({
        queryKey: ['feeding-types'],
        queryFn: async () => {
            try {
                const response = await api.get('/feeding/types');
                return response.data?.data || response.data || [];
            } catch {
                return [];
            }
        }
    });
}

export function useFeedingRecords(apiaryId?: string) {
    return useQuery({
        queryKey: ['feeding-records', apiaryId],
        queryFn: () => getFeedingRecords(apiaryId!),
        enabled: !!apiaryId
    });
}

export function useCreateFeedingRecord(apiaryId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => createFeedingRecord(apiaryId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feeding-records', apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['operations-log', apiaryId] });
        }
    });
}

export function useFeedingRecommendations(hiveId: string) {
    return useQuery({
        queryKey: ['feeding-recommendations', hiveId],
        queryFn: async () => {
            try {
                const response = await api.get(`/feeding/recommendations/${hiveId}`);
                return response.data?.data || response.data || [];
            } catch {
                return [];
            }
        },
        enabled: !!hiveId
    });
}
