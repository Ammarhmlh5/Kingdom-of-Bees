import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as environmentService from '@/services/environment';

export const environmentKeys = {
    all: ['environment'] as const,
    weather: (apiaryId: string) => [...environmentKeys.all, 'weather', apiaryId] as const,
    forecast: (apiaryId: string) => [...environmentKeys.all, 'forecast', apiaryId] as const,
    plants: () => [...environmentKeys.all, 'plants'] as const,
    apiaryPlants: (apiaryId: string) => [...environmentKeys.plants(), apiaryId] as const,
    plantSearch: (query: string) => [...environmentKeys.plants(), 'search', query] as const,
};

export function useCurrentWeather(apiaryId: string) {
    return useQuery({
        queryKey: environmentKeys.weather(apiaryId),
        queryFn: () => environmentService.getCurrentWeather(apiaryId),
        enabled: !!apiaryId,
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
}

export function useForecast(apiaryId: string) {
    return useQuery({
        queryKey: environmentKeys.forecast(apiaryId),
        queryFn: () => environmentService.getForecast(apiaryId),
        enabled: !!apiaryId,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

export function useApiaryPlants(apiaryId: string) {
    return useQuery({
        queryKey: environmentKeys.apiaryPlants(apiaryId),
        queryFn: () => environmentService.getApiaryPlants(apiaryId),
        enabled: !!apiaryId,
    });
}

export function useSearchPlants(query: string) {
    return useQuery({
        queryKey: environmentKeys.plantSearch(query),
        queryFn: () => environmentService.searchPlants(query),
        enabled: query.length > 2,
    });
}

export function useAddLocalPlant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: environmentService.addLocalPlant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: environmentKeys.plants() });
        },
    });
}

export function useRemoveLocalPlant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: environmentService.removeLocalPlant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: environmentKeys.plants() });
        },
    });
}

export function useRecordManualWeather() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ apiaryId, data }: { apiaryId: string; data: any }) =>
            environmentService.recordManualWeather(apiaryId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: environmentKeys.weather(variables.apiaryId) });
        },
    });
}
