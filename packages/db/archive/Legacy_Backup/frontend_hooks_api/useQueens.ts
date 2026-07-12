import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as queensService from '@/services/queens';

export const queensKeys = {
    all: ['queens'] as const,
    lists: () => [...queensKeys.all, 'list'] as const,
    list: (filters?: { hiveId?: string; apiaryId?: string; status?: string }) =>
        [...queensKeys.lists(), filters] as const,
    details: () => [...queensKeys.all, 'detail'] as const,
    detail: (id: string) => [...queensKeys.details(), id] as const,
    history: (id: string) => [...queensKeys.detail(id), 'history'] as const,
};

export function useQueens(filters?: { hiveId?: string; apiaryId?: string; status?: string }) {
    return useQuery({
        queryKey: queensKeys.list(filters),
        queryFn: () => queensService.getQueens(filters),
    });
}

export function useQueen(id: string) {
    return useQuery({
        queryKey: queensKeys.detail(id),
        queryFn: () => queensService.getQueen(id),
        enabled: !!id,
    });
}

export function useQueenHistory(id: string) {
    return useQuery({
        queryKey: queensKeys.history(id),
        queryFn: () => queensService.getQueenHistory(id),
        enabled: !!id,
    });
}

export function useCreateQueen() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: queensService.createQueen,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queensKeys.lists() });
        },
    });
}

export function useUpdateQueen() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => queensService.updateQueen(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queensKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queensKeys.lists() });
        },
    });
}

export function useDeleteQueen() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: queensService.deleteQueen,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queensKeys.lists() });
        },
    });
}

export function useReplaceQueen() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ hiveId, data }: { hiveId: string; data: any }) => queensService.replaceQueen(hiveId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queensKeys.lists() });
        },
    });
}
