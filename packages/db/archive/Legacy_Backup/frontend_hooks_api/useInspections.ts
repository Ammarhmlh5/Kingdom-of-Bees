import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as inspectionsService from '@/services/inspections';

/**
 * Query keys for inspections
 */
export const inspectionsKeys = {
    all: ['inspections'] as const,
    lists: () => [...inspectionsKeys.all, 'list'] as const,
    list: (filters?: { hiveId?: string; apiaryId?: string; startDate?: string; endDate?: string }) =>
        [...inspectionsKeys.lists(), filters] as const,
    details: () => [...inspectionsKeys.all, 'detail'] as const,
    detail: (id: string) => [...inspectionsKeys.details(), id] as const,
    stats: (hiveId?: string) => [...inspectionsKeys.all, 'stats', { hiveId }] as const,
};

/**
 * Fetch inspections with optional filters
 */
export function useInspections(filters?: {
    hiveId?: string;
    apiaryId?: string;
    startDate?: string;
    endDate?: string;
}) {
    return useQuery({
        queryKey: inspectionsKeys.list(filters),
        queryFn: () => inspectionsService.getInspections(filters),
    });
}

/**
 * Fetch single inspection by ID
 */
export function useInspection(id: string) {
    return useQuery({
        queryKey: inspectionsKeys.detail(id),
        queryFn: () => inspectionsService.getInspectionById(id),
        enabled: !!id,
    });
}

/**
 * Fetch inspection statistics
 */
export function useInspectionStats(hiveId?: string) {
    return useQuery({
        queryKey: inspectionsKeys.stats(hiveId),
        queryFn: () => inspectionsService.getInspectionStats(hiveId),
    });
}

/**
 * Create new inspection mutation
 */
export function useCreateInspection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => inspectionsService.createInspection(data),
        onSuccess: () => {
            // Invalidate inspections list
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.lists() });
        },
    });
}

/**
 * Update inspection mutation
 */
export function useUpdateInspection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            inspectionsService.updateInspection(id, data),
        onSuccess: (_, variables) => {
            // Invalidate specific inspection and lists
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.lists() });
        },
    });
}

/**
 * Delete inspection mutation
 */
export function useDeleteInspection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => inspectionsService.deleteInspection(id),
        onSuccess: () => {
            // Invalidate inspections list
            queryClient.invalidateQueries({ queryKey: inspectionsKeys.lists() });
        },
    });
}
