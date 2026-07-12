import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as apiariesService from '@/services/apiaries';
import type { CreateApiaryData } from '@/services/apiaries';

/**
 * Query keys for apiaries
 */
export const apiariesKeys = {
    all: ['apiaries'] as const,
    lists: () => [...apiariesKeys.all, 'list'] as const,
    list: (filters?: any) => [...apiariesKeys.lists(), filters] as const,
    details: () => [...apiariesKeys.all, 'detail'] as const,
    detail: (id: string) => [...apiariesKeys.details(), id] as const,
    stats: (id: string) => [...apiariesKeys.detail(id), 'stats'] as const,
    team: (id: string) => [...apiariesKeys.detail(id), 'team'] as const,
    dashboard: () => [...apiariesKeys.all, 'dashboard'] as const,
};

/**
 * Fetch all apiaries for current user
 */
export function useApiaries() {
    return useQuery({
        queryKey: apiariesKeys.lists(),
        queryFn: apiariesService.getMyApiaries,
    });
}

/**
 * Fetch single apiary by ID
 */
export function useApiary(id: string) {
    return useQuery({
        queryKey: apiariesKeys.detail(id),
        queryFn: () => apiariesService.getApiaryById(id),
        enabled: !!id,
    });
}

/**
 * Fetch apiary statistics
 */
export function useApiaryStats(id: string) {
    return useQuery({
        queryKey: apiariesKeys.stats(id),
        queryFn: () => apiariesService.getApiaryStats(id),
        enabled: !!id,
    });
}

/**
 * Fetch apiary team members
 */
export function useApiaryTeam(id: string) {
    return useQuery({
        queryKey: apiariesKeys.team(id),
        queryFn: () => apiariesService.getApiaryTeam(id),
        enabled: !!id,
    });
}

/**
 * Fetch dashboard statistics
 */
export function useDashboardStats() {
    return useQuery({
        queryKey: apiariesKeys.dashboard(),
        queryFn: apiariesService.getDashboardStats,
    });
}

/**
 * Create new apiary mutation
 */
export function useCreateApiary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateApiaryData) => apiariesService.createApiary(data),
        onSuccess: () => {
            // Invalidate and refetch apiaries list
            queryClient.invalidateQueries({ queryKey: apiariesKeys.lists() });
            queryClient.invalidateQueries({ queryKey: apiariesKeys.dashboard() });
        },
    });
}

/**
 * Update apiary mutation
 */
export function useUpdateApiary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateApiaryData> }) =>
            apiariesService.updateApiary(id, data),
        onSuccess: (_, variables) => {
            // Invalidate specific apiary and lists
            queryClient.invalidateQueries({ queryKey: apiariesKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: apiariesKeys.lists() });
            queryClient.invalidateQueries({ queryKey: apiariesKeys.dashboard() });
        },
    });
}

/**
 * Delete apiary mutation
 */
export function useDeleteApiary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiariesService.deleteApiary(id),
        onSuccess: () => {
            // Invalidate apiaries list
            queryClient.invalidateQueries({ queryKey: apiariesKeys.lists() });
            queryClient.invalidateQueries({ queryKey: apiariesKeys.dashboard() });
        },
    });
}
