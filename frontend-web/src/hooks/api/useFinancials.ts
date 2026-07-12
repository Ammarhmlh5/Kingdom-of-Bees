import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialsService, CreateFinancialInput } from '@/services/financials';

export function useFinancials(apiaryId?: string, period: string = 'month') {
    return useQuery({
        queryKey: ['financials', apiaryId, period],
        queryFn: () => financialsService.getFinancials(apiaryId!, period),
        enabled: !!apiaryId
    });
}

export function useCreateFinancialRecord(apiaryId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateFinancialInput) => financialsService.createRecord(apiaryId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financials', apiaryId] });
        }
    });
}

export function useDeleteFinancialRecord(apiaryId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (recordId: string) => financialsService.deleteRecord(apiaryId!, recordId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financials', apiaryId] });
        }
    });
}
