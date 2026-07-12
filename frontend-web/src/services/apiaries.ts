import { fetchWithAuth } from '@/config';

// getMyApiaries
export async function getMyApiaries() {
    try {
        const response = await fetchWithAuth(`/apiaries`);
        if (!response.ok) throw new Error("Failed to fetch apiaries");
        return await response.json();
    } catch (e) {
        console.error("API error in getMyApiaries:", e);
        return [];
    }
}

export const getApiaries = getMyApiaries;

// createApiary
export interface CreateApiaryData {
    name: string;
    type: string;
    locationLat: number;
    locationLng: number;
    establishedDate: Date;
    region?: string;
    description?: string;
    initialHiveCount?: number;
    workerCount?: number;
    hivesConfig?: { templateId: string; count: number }[];
}
export async function createApiary(data: any) {
    try {
        const response = await fetchWithAuth(`/apiaries`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (e) {
        console.error("API error in createApiary:", e);
    }
}

// getApiaryById
export async function getApiaryById(id: string) {
    try {
        const response = await fetchWithAuth(`/apiaries/${id}`);
        if (!response.ok) throw new Error("Failed to fetch apiary");
        return await response.json();
    } catch (e) {
        console.error("API error in getApiaryById:", e);
        return null;
    }
}

export const getApiaryDetails = getApiaryById;

// getStats
export async function getStats(id: string) {
    try {
        const response = await fetchWithAuth(`/apiaries/${id}/stats/dashboard`);
        if (!response.ok) throw new Error("Failed to fetch stats");
        return await response.json();
    } catch (e) {
        console.error("API error in getStats:", e);
        return { totalHives: 0, activeHives: 0, honeyProduced: 0 };
    }
}

// updateApiary
export async function updateApiary(id: string, data: any) {
    try {
        const response = await fetchWithAuth(`/apiaries/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (e) {
        console.error("API error in updateApiary:", e);
    }
}

// deleteApiary
export async function deleteApiary(id: string) {
    try {
        const response = await fetchWithAuth(`/apiaries/${id}`, {
            method: "DELETE",
        });
        return await response.json();
    } catch (e) {
        console.error("API error in deleteApiary:", e);
    }
}

// Service object export
export const apiaryService = {
    getMyApiaries,
    getApiaries,
    getApiaryDetails,
    getApiaryById,
    createApiary,
    updateApiary,
    deleteApiary,
    getStats
};
