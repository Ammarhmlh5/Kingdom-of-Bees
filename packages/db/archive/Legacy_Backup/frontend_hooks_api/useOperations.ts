import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as operationsService from '@/services/operations';

export const operationsKeys = {
    all: ['operations'] as const,
    lists: () => [...operationsKeys.all, 'list'] as const,
    list: (apiaryId?: string, filters?: { type?: string; startDate?: string; endDate?: string }) =>
        [...operationsKeys.lists(), { apiaryId, ...filters }] as const,
    details: () => [...operationsKeys.all, 'detail'] as const,
    detail: (id: string) => [...operationsKeys.details(), id] as const,
    stats: (apiaryId?: string) => [...operationsKeys.all, 'stats', { apiaryId }] as const,
};

export function useOperations(apiaryId?: string, filters?: { type?: string; startDate?: string; endDate?: string }) {
    return useQuery({
        queryKey: operationsKeys.list(apiaryId, filters),
        queryFn: () => operationsService.getOperations(apiaryId, filters),
    });
}

export function useOperation(id: string) {
    return useQuery({
        queryKey: operationsKeys.detail(id),
        queryFn: () => operationsService.getOperationById(id),
        enabled: !!id,
    });
}

export function useOperationStats(apiaryId?: string) {
    return useQuery({
        queryKey: operationsKeys.stats(apiaryId),
        queryFn: () => operationsService.getOperationStats(apiaryId),
    });
}

export function useSplitHive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: operationsService.performSplit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: operationsKeys.lists() });
        },
    });
}

export function useMergeHives() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: operationsService.performMerge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: operationsKeys.lists() });
        },
    });
}

export function useReportSwarm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: operationsService.reportSwarm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: operationsKeys.lists() });
        },
    });
}

export function usePerformRequeening() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: operationsService.performRequeening,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: operationsKeys.lists() });
        },
    });
}
