import { API_URL, fetchWithAuth } from '@/config';

export interface Hive {
    id: string;
    name: string;
    hiveNumber: string; // Changed from number to match backend
    apiaryId: string;
    type: 'LANGSTROTH' | 'TRADITIONAL' | 'NUC';
    status: 'ACTIVE' | 'INACTIVE' | 'QUARANTINE';
    queenStatus?: 'laying' | 'virgin' | 'missing' | 'unknown';
    condition: 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'WEAK' | 'CRITICAL'; // Updated Enum
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
    framesCount?: number;
    establishedDate: string;
    updatedAt: string; // Added
    notes?: string;
}

export interface CreateHiveData {
    name: string;
    number: string;
    apiaryId: string;
    type: Hive['type'];
    status?: Hive['status'];
    queenStatus?: Hive['queenStatus'];
    condition?: Hive['condition'];
    strength?: Hive['strength'];
    establishedDate?: Date | string;
    notes?: string;
    framesCount?: number;
}

export type UpdateHiveData = Partial<CreateHiveData>;

export async function getHives(apiaryId?: string): Promise<Hive[]> {
    try {
        const url = apiaryId ? `${API_URL}/hives?apiaryId=${apiaryId}` : `${API_URL}/hives`;
        const response = await fetchWithAuth(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch hives");
        }
        const result = await response.json();
        // Backend returns {success, data}, extract data array
        return result.data || result;
    } catch (e) {
        console.error("API error in getHives:", e);
        throw e;
    }
}

// Alias for backward compatibility
export const getMyHives = getHives;

export async function getHiveById(id: string): Promise<Hive> {
    try {
        const response = await fetchWithAuth(`${API_URL}/hives/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch hive");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in getHiveById:", e);
        throw e;
    }
}

export async function createHive(data: CreateHiveData): Promise<Hive> {
    try {
        const response = await fetchWithAuth(`${API_URL}/hives`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create hive");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in createHive:", e);
        throw e;
    }
}

export async function updateHive(id: string, data: UpdateHiveData): Promise<Hive> {
    try {
        const response = await fetchWithAuth(`${API_URL}/hives/${id}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update hive");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in updateHive:", e);
        throw e;
    }
}

export async function deleteHive(id: string): Promise<{ success: boolean }> {
    try {
        const response = await fetchWithAuth(`${API_URL}/hives/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to delete hive");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in deleteHive:", e);
        throw e;
    }
}

export interface HiveSetupData {
    hiveNumber: string;
    type: string;
    queen: any;
    strength: string;
    frames: any;
}

export async function setupHiveAnalysis(id: string, data: HiveSetupData): Promise<any> {
    try {
        const response = await fetchWithAuth(`${API_URL}/hives/${id}/setup`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to setup hive analysis");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in setupHiveAnalysis:", e);
        throw e;
    }
}

// Split Hive
export interface SplitHiveData {
    strategy: 'EVEN' | 'NUC';
    newHiveNumber: string;
    queenType: string;
}

export async function splitHive(hiveId: string, data: SplitHiveData): Promise<any> {
    try {
        const response = await fetchWithAuth(`${API_URL}/hives/${hiveId}/split`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to split hive");
        }

        return await response.json();
    } catch (e) {
        console.error("API error in splitHive:", e);
        throw e;
    }
}

// Add Super
export interface AddSuperData {
    type: string;
    frames: string;
    hasExcluder: boolean;
}

export async function addSuperToHive(hiveId: string, data: AddSuperData): Promise<any> {
    try {
        const response = await fetchWithAuth(`${API_URL}/hives/${hiveId}/super`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to add super");
        }

        return await response.json();
    } catch (e) {
        console.error("API error in addSuperToHive:", e);
        throw e;
    }
}

// Merge Hives
export interface MergeHivesData {
    targetHiveId: string;
}

export async function mergeHives(weakHiveId: string, data: MergeHivesData): Promise<any> {
    try {
        const response = await fetchWithAuth(`${API_URL}/hives/${weakHiveId}/merge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to merge hives");
        }

        return await response.json();
    } catch (e) {
        console.error("API error in mergeHives:", e);
        throw e;
    }
}

export interface HiveStats {
    honeyProduction: number;
    tasksCount: number;
    inspectionsCount: number;
    healthScore: number;
}

export async function getHiveStats(id: string): Promise<HiveStats | null> {
    try {
        const response = await fetchWithAuth(`${API_URL}/hives/${id}/stats`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch hive stats");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in getHiveStats:", e);
        throw e;
    }
}

export async function getHiveHistory(id: string): Promise<any[]> {
    try {
        const response = await fetchWithAuth(`${API_URL}/hives/${id}/history`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch hive history");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in getHiveHistory:", e);
        throw e;
    }
}
