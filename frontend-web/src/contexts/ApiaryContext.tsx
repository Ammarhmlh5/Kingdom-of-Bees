import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiaryService } from '@/services/apiaries';

// Types
export interface Apiary {
    id: string;
    name: string;
    type: 'COMMERCIAL' | 'HOBBYIST' | 'RESEARCH' | 'EDUCATION';
    locationLat?: number;
    locationLng?: number;
    address?: string;
    isActive: boolean;
    establishedDate?: string;
    _count: {
        hives: number;
    };
}

interface ApiaryStats {
    totalHives: number;
    activeHives: number;
    honeyProduced: number;
    // Add real stats later
}

interface ApiaryContextType {
    apiaryId: string;
    apiary: Apiary | null;
    stats: ApiaryStats | null;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
}

// Create Context
const ApiaryContext = createContext<ApiaryContextType | null>(null);

// Provider Component
interface ApiaryProviderProps {
    children: ReactNode;
}

export function ApiaryProvider({ children }: ApiaryProviderProps) {
    const { id: urlApiaryId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // CRITICAL: Always prioritize URL parameter over localStorage
    // Only use localStorage if URL param is completely missing (shouldn't happen with our routes)
    const [validatedApiaryId, setValidatedApiaryId] = useState<string | null>(() => {
        // URL parameter takes absolute priority
        return urlApiaryId || null;
    });

    // Sync state when URL changes
    useEffect(() => {
        if (urlApiaryId) {
            // URL changed - update state and localStorage
            setValidatedApiaryId(urlApiaryId);
            localStorage.setItem('currentApiaryId', urlApiaryId);
            localStorage.setItem('lastVisitedApiaryId', urlApiaryId);
            localStorage.setItem('lastApiaryRoute', location.pathname);
        }
    }, [urlApiaryId, location.pathname]);

    // Fetch apiary data
    const {
        data: apiary,
        isLoading: apiaryLoading,
        isError: apiaryError,
        refetch: refetchApiary,
    } = useQuery({
        queryKey: ['apiary', validatedApiaryId],
        queryFn: async () => {
            if (!validatedApiaryId) return null;
            const data = await apiaryService.getApiaryDetails(validatedApiaryId);
            if (!data) throw new Error('Failed to fetch apiary');
            return data;
        },
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!validatedApiaryId,
    });

    // Fetch apiary stats
    const {
        data: stats,
        isLoading: statsLoading,
        isError: statsError,
        refetch: refetchStats,
    } = useQuery({
        queryKey: ['apiary-stats', validatedApiaryId],
        queryFn: () => validatedApiaryId ? apiaryService.getStats(validatedApiaryId) : null,
        staleTime: 1000 * 60 * 2, // 2 minutes
        enabled: !!validatedApiaryId,
    });

    // Now safe to return early if no ID is determined yet
    if (!validatedApiaryId) {
        return <div className="p-4 text-center">جاري التحميل...</div>;
    }

    const refetch = () => {
        refetchApiary();
        refetchStats();
    };

    const value: ApiaryContextType = {
        apiaryId: validatedApiaryId,
        apiary: apiary || null,
        stats: stats || null,
        isLoading: apiaryLoading || statsLoading,
        isError: apiaryError || statsError,
        refetch,
    };

    return (
        <ApiaryContext.Provider value={value}>
            {children}
        </ApiaryContext.Provider>
    );
}

// Custom Hook
export function useApiaryContext(): ApiaryContextType {
    const context = useContext(ApiaryContext);

    if (!context) {
        throw new Error('useApiaryContext must be used within ApiaryProvider');
    }

    return context;
}

// Export for convenience
export default ApiaryContext;
