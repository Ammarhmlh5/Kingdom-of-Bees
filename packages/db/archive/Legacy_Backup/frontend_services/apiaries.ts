import { API_URL, fetchWithAuth } from '@/config';

export interface Apiary {
    id: string;
    name: string;
    type: 'FIXED' | 'MOBILE';
    locationLat: number;
    locationLng: number;
    establishedDate: string;
    address?: string;
    region?: string;
    description?: string;
    isPublic?: boolean;
    workerCount?: number;
    currentHiveCount?: number;
    userRole?: 'OWNER' | 'WORKER' | 'VIEWER';
    _count?: { hives: number };
    totalHives?: number;
    healthRating?: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL' | null;
    stats?: {
        healthScore?: number;
        [key: string]: any;
    };
}

/**
 * Get all apiaries for current user
 */
export async function getMyApiaries(): Promise<Apiary[]> {
    try {
        const response = await fetchWithAuth(`${API_URL}/apiaries`);
        if (!response.ok) throw new Error("Failed to fetch apiaries");
        const json = await response.json();
        // Backend returns { success: true, data: [...] }
        return json.data || json;
    } catch (e) {
        console.error("API error in getMyApiaries:", e);
        return [];
    }
}

export const getApiaries = getMyApiaries;

/**
 * Create new apiary
 */
export interface CreateApiaryData {
    name: string;
    type: string;
    locationLat: number;
    locationLng: number;
    establishedDate: Date | string;
    region?: string;
    description?: string;
    initialHiveCount?: number;
    workerCount?: number;
    hivesConfig?: { templateId: string; count: number }[];
    isPublic?: boolean;
    hivesCounts?: {
        langstroth: number;
        traditional: number;
        nuc: number;
    };
}

export async function createApiary(data: CreateApiaryData): Promise<Apiary> {
    try {
        const response = await fetchWithAuth(`${API_URL}/apiaries`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to create apiary");
        const json = await response.json();
        return json.data || json;
    } catch (e) {
        console.error("API error in createApiary:", e);
        throw e;
    }
}

/**
 * Get apiary by ID
 */
export async function getApiaryById(id: string): Promise<Apiary | null> {
    try {
        const response = await fetchWithAuth(`${API_URL}/apiaries/${id}`);
        if (!response.ok) throw new Error("Failed to fetch apiary");
        const json = await response.json();
        return json.data || json;
    } catch (e) {
        console.error("API error in getApiaryById:", e);
        return null;
    }
}

/**
 * Update apiary
 */
export async function updateApiary(id: string, data: Partial<CreateApiaryData>): Promise<Apiary> {
    try {
        const response = await fetchWithAuth(`${API_URL}/apiaries/${id}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update apiary");
        const json = await response.json();
        return json.data || json;
    } catch (e) {
        console.error("API error in updateApiary:", e);
        throw e;
    }
}

/**
 * Delete apiary
 */
export async function deleteApiary(id: string): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await fetchWithAuth(`${API_URL}/apiaries/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete apiary");
        const json = await response.json();
        return json.data || json;
    } catch (e) {
        console.error("API error in deleteApiary:", e);
        throw e;
    }
}

export interface ApiaryStats {
    totalHives: number;
    healthScore: number;
    productionKg: number;
    activeAlerts: number;
}

/**
 * Get apiary statistics
 */
export async function getApiaryStats(id: string): Promise<ApiaryStats | null> {
    try {
        const response = await fetchWithAuth(`${API_URL}/apiaries/${id}/stats`);
        if (!response.ok) throw new Error("Failed to fetch apiary stats");
        const json = await response.json();
        return json.data || json;
    } catch (e) {
        console.error("API error in getApiaryStats:", e);
        return null;
    }
}

export interface DashboardStats {
    totalHives: number;
    totalApiaries: number;
    healthScore: number;
    healthRating: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL';
    productionKg: number;
    activeAlerts: number;
}

/**
 * Get global dashboard stats
 */
export async function getDashboardStats(): Promise<DashboardStats | null> {
    try {
        const response = await fetchWithAuth(`${API_URL}/apiaries/stats/dashboard`);
        if (!response.ok) throw new Error("Failed to fetch dashboard stats");
        const json = await response.json();
        return json.data || json;
    } catch (e) {
        console.error("API error in getDashboardStats:", e);
        return null;
    }
}

export interface ApiaryMember {
    id: string;
    userId: string;
    role: 'OWNER' | 'MANAGER' | 'WORKER' | 'VIEWER';
    user: {
        id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    joinedAt: string;
}

/**
 * Get apiary team members
 */
export async function getApiaryTeam(id: string): Promise<ApiaryMember[]> {
    try {
        const response = await fetchWithAuth(`${API_URL}/apiaries/${id}/team`);
        if (!response.ok) throw new Error("Failed to fetch apiary team");
        const json = await response.json();
        return json.data || json;
    } catch (e) {
        console.error("API error in getApiaryTeam:", e);
        return [];
    }
}
