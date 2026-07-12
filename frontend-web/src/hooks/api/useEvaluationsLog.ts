import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationsLogService, AssessmentFilters } from '@/services/evaluationsLog';

export function useEvaluationsLog(apiaryId?: string, filters: AssessmentFilters = {}) {
    return useQuery({
        queryKey: ['evaluations-log', apiaryId, filters],
        queryFn: () => evaluationsLogService.getAssessments(apiaryId!, filters),
        enabled: !!apiaryId
    });
}

export function useDeleteAssessment(apiaryId?: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (assessmentId: string) =>
            evaluationsLogService.deleteAssessment(apiaryId!, assessmentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['evaluations-log', apiaryId] });
            queryClient.invalidateQueries({ queryKey: ['operations-log', apiaryId] });
        }
    });
}
