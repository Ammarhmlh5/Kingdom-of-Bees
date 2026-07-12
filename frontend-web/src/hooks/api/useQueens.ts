import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queensService, CreateQueenInput } from '@/services/queens';

export function useQueens(apiaryId?: string) {
    return useQuery({
        queryKey: ['queens', apiaryId],
        queryFn: () => queensService.getQueens(apiaryId!),
        enabled: !!apiaryId
    });
}

export function useCreateQueen(apiaryId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateQueenInput) => queensService.createQueen(apiaryId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queens', apiaryId] });
        }
    });
}

export function useDeleteQueen(apiaryId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (queenId: string) => queensService.deleteQueen(apiaryId!, queenId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queens', apiaryId] });
        }
    });
}
