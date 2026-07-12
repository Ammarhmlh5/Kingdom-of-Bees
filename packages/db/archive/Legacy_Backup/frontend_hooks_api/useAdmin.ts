import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/config';

interface AdminStats {
    totalUsers: number;
    totalApiaries: number;
    activeAlerts: number;
    todayOperations: number;
    totalInspections: number;
}

interface AdminActivity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

export function useAdminStats() {
    return useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const response = await fetchWithAuth('/admin/stats');
            if (!response.ok) throw new Error('Failed to fetch admin stats');
            const json = await response.json() as ApiResponse<AdminStats>;
            return json.data;
        }
    });
}

export function useAdminActivities(limit = 10) {
    return useQuery({
        queryKey: ['admin-activities', limit],
        queryFn: async () => {
            const response = await fetchWithAuth(`/admin/activities?limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch admin activities');
            const json = await response.json() as ApiResponse<AdminActivity[]>;
            return json.data;
        }
    });
}
