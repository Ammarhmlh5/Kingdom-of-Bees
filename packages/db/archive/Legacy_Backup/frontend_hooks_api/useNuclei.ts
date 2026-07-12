import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as nucleiService from '@/services/nuclei';

export const nucleiKeys = {
    all: ['nuclei'] as const,
    lists: () => [...nucleiKeys.all, 'list'] as const,
    list: (apiaryId: string) => [...nucleiKeys.lists(), apiaryId] as const,
    details: () => [...nucleiKeys.all, 'detail'] as const,
    detail: (id: string) => [...nucleiKeys.details(), id] as const,
};

export function useNuclei(apiaryId: string) {
    return useQuery({
        queryKey: nucleiKeys.list(apiaryId),
        queryFn: () => nucleiService.getNuclei(apiaryId),
        enabled: !!apiaryId,
    });
}

export function useNucleus(id: string) {
    return useQuery({
        queryKey: nucleiKeys.detail(id),
        queryFn: () => nucleiService.getNucleus(id),
        enabled: !!id,
    });
}

export function useCreateNucleus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: nucleiService.createNucleus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nucleiKeys.lists() });
        },
    });
}

export function useGraduateNucleus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name: string; hiveType: string } }) =>
            nucleiService.graduateNucleus(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nucleiKeys.lists() });
        },
    });
}
