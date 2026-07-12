import { API_URL, fetchWithAuth } from '@/config';

export async function getInspections(filters?: {
    hiveId?: string;
    apiaryId?: string;
    startDate?: string;
    endDate?: string;
}) {
    try {
        let url = `${API_URL}/inspections`;
        if (filters) {
            const params = new URLSearchParams();
            if (filters.hiveId) params.append('hiveId', filters.hiveId);
            if (filters.apiaryId) params.append('apiaryId', filters.apiaryId);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (params.toString()) url += `?${params.toString()}`;
        }
        const response = await fetchWithAuth(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch inspections");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in getInspections:", e);
        throw e;
    }
}

export const getMyInspections = getInspections;

export async function getInspectionById(id: string) {
    try {
        const response = await fetchWithAuth(`${API_URL}/inspections/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch inspection");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in getInspectionById:", e);
        throw e;
    }
}

export async function createInspection(data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/inspections`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create inspection");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in createInspection:", e);
        throw e;
    }
}

export async function updateInspection(id: string, data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/inspections/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update inspection");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in updateInspection:", e);
        throw e;
    }
}

export async function deleteInspection(id: string) {
    try {
        const response = await fetchWithAuth(`${API_URL}/inspections/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to delete inspection");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in deleteInspection:", e);
        throw e;
    }
}

export async function getInspectionStats(hiveId?: string) {
    try {
        const url = hiveId 
            ? `${API_URL}/inspections/stats?hiveId=${hiveId}`
            : `${API_URL}/inspections/stats`;
        const response = await fetchWithAuth(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch inspection stats");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in getInspectionStats:", e);
        throw e;
    }
}
