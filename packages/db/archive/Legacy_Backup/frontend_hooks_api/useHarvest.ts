import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as harvestService from '@/services/harvest';

export const harvestKeys = {
    all: ['harvest'] as const,
    lists: () => [...harvestKeys.all, 'list'] as const,
    list: (filters?: { apiaryId?: string; harvestType?: string; startDate?: string; endDate?: string }) =>
        [...harvestKeys.lists(), filters] as const,
    details: () => [...harvestKeys.all, 'detail'] as const,
    detail: (id: string) => [...harvestKeys.details(), id] as const,
    stats: (apiaryId: string) => [...harvestKeys.all, 'stats', apiaryId] as const,
    honey: () => [...harvestKeys.all, 'honey'] as const,
    pollen: () => [...harvestKeys.all, 'pollen'] as const,
    royalJelly: () => [...harvestKeys.all, 'royalJelly'] as const,
};

export function useHarvestRecords(filters?: { apiaryId?: string; harvestType?: string; startDate?: string; endDate?: string }) {
    return useQuery({
        queryKey: harvestKeys.list(filters),
        queryFn: () => harvestService.getHarvestRecords(filters),
    });
}

export function useHarvestRecord(id: string) {
    return useQuery({
        queryKey: harvestKeys.detail(id),
        queryFn: () => harvestService.getHarvestRecordById(id),
        enabled: !!id,
    });
}

export function useHarvestStats(apiaryId: string) {
    return useQuery({
        queryKey: harvestKeys.stats(apiaryId),
        queryFn: () => harvestService.getHarvestStats(apiaryId),
        enabled: !!apiaryId,
    });
}

export function useCreateHarvestRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: harvestService.createHarvestRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.lists() });
        },
    });
}

export function useUpdateHarvestRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => harvestService.updateHarvestRecord(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: harvestKeys.lists() });
        },
    });
}

export function useDeleteHarvestRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: harvestService.deleteHarvestRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.lists() });
        },
    });
}

export function useCreateHoneyHarvest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: harvestService.createHoneyHarvest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.honey() });
        },
    });
}

export function useCreatePollenHarvest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: harvestService.createPollenHarvest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.pollen() });
        },
    });
}

export function useCreateRoyalJellyProduction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: harvestService.createRoyalJellyProduction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: harvestKeys.royalJelly() });
        },
    });
}
