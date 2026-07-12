import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

export const aiKeys = {
    all: ['ai'] as const,
    recommendations: (filters?: any) => [...aiKeys.all, 'recommendations', filters] as const,
};

export function useAIRecommendations(apiaryId?: string, hiveId?: string) {
    return useQuery({
        queryKey: aiKeys.recommendations({ apiaryId, hiveId }),
        queryFn: async () => {
            const { data } = await api.get('/ai/recommendations', {
                params: { apiaryId, hiveId }
            });
            return data;
        },
    });
}

export function useGenerateAIRecommendation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: { apiaryId?: string; hiveId?: string }) => {
            const { data } = await api.post('/ai/recommendations/generate', params);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: aiKeys.all });
        },
    });
}
