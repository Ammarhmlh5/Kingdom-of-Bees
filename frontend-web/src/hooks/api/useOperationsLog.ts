import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationsLogService, OperationFilters, UpdateOperationInput } from '@/services/operationsLog';

export function useOperationsLog(apiaryId?: string, filters: OperationFilters = {}) {
    return useQuery({
        queryKey: ['operations-log', apiaryId, filters],
        queryFn: () => operationsLogService.getOperations(apiaryId!, filters),
        enabled: !!apiaryId
    });
}

export function useUpdateOperation(apiaryId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ operationId, data }: { operationId: string; data: UpdateOperationInput }) =>
            operationsLogService.updateOperation(apiaryId!, operationId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operations-log', apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['inspections', apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['hives', apiaryId] });
        }
    });
}

export function useDeleteOperation(apiaryId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (operationId: string) => operationsLogService.deleteOperation(apiaryId!, operationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operations-log', apiaryId] });
        }
    });
}
