import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as alertsService from '@/services/alerts';

export const alertsKeys = {
    all: ['alerts'] as const,
    lists: () => [...alertsKeys.all, 'list'] as const,
    list: (lat?: number, lng?: number, radius?: number) =>
        [...alertsKeys.lists(), { lat, lng, radius }] as const,
};

export function useAlerts(lat?: number, lng?: number, radius?: number) {
    return useQuery({
        queryKey: alertsKeys.list(lat, lng, radius),
        queryFn: () => alertsService.getAlerts(lat, lng, radius),
    });
}

export function useCreateAlert() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: alertsService.createAlert,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: alertsKeys.lists() });
        },
    });
}
