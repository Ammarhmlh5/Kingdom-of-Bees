import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as hivesService from '@/services/hives';

/**
 * Query keys for hives
 */
export const hivesKeys = {
    all: ['hives'] as const,
    lists: () => [...hivesKeys.all, 'list'] as const,
    list: (apiaryId?: string) => [...hivesKeys.lists(), { apiaryId }] as const,
    details: () => [...hivesKeys.all, 'detail'] as const,
    detail: (id: string) => [...hivesKeys.details(), id] as const,
    stats: (id: string) => [...hivesKeys.detail(id), 'stats'] as const,
    history: (id: string) => [...hivesKeys.detail(id), 'history'] as const,
};

/**
 * Fetch hives (optionally filtered by apiary)
 */
export function useHives(apiaryId?: string) {
    return useQuery({
        queryKey: hivesKeys.list(apiaryId),
        queryFn: () => hivesService.getHives(apiaryId),
    });
}

/**
 * Fetch single hive by ID
 */
export function useHive(id: string) {
    return useQuery({
        queryKey: hivesKeys.detail(id),
        queryFn: () => hivesService.getHiveById(id),
        enabled: !!id,
    });
}

/**
 * Fetch hive statistics
 */
export function useHiveStats(id: string) {
    return useQuery({
        queryKey: hivesKeys.stats(id),
        queryFn: () => hivesService.getHiveStats(id),
        enabled: !!id,
    });
}

/**
 * Fetch hive history
 */
export function useHiveHistory(id: string) {
    return useQuery({
        queryKey: hivesKeys.history(id),
        queryFn: () => hivesService.getHiveHistory(id),
        enabled: !!id,
    });
}

/**
 * Create new hive mutation
 */
export function useCreateHive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => hivesService.createHive(data),
        onSuccess: (_, variables) => {
            // Invalidate hives list for the apiary
            queryClient.invalidateQueries({ queryKey: hivesKeys.lists() });
            if (variables.apiaryId) {
                queryClient.invalidateQueries({ queryKey: hivesKeys.list(variables.apiaryId) });
            }
        },
    });
}

/**
 * Update hive mutation
 */
export function useUpdateHive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            hivesService.updateHive(id, data),
        onSuccess: (_, variables) => {
            // Invalidate specific hive and lists
            queryClient.invalidateQueries({ queryKey: hivesKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: hivesKeys.lists() });
        },
    });
}

/**
 * Delete hive mutation
 */
export function useDeleteHive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => hivesService.deleteHive(id),
        onSuccess: () => {
            // Invalidate hives list
            queryClient.invalidateQueries({ queryKey: hivesKeys.lists() });
        },
    });
}
