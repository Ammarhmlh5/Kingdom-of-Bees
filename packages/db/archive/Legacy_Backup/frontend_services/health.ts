import { API_URL, fetchWithAuth } from '@/config';

export async function getHealthRecords(filters?: {
    hiveId?: string;
    apiaryId?: string;
    diseaseType?: string;
    status?: string;
}) {
    try {
        let url = `${API_URL}/diseases/my-records`;
        if (filters) {
            const params = new URLSearchParams();
            if (filters.hiveId) params.append('hiveId', filters.hiveId);
            if (filters.apiaryId) params.append('apiaryId', filters.apiaryId);
            if (filters.diseaseType) params.append('diseaseType', filters.diseaseType);
            if (filters.status) params.append('status', filters.status);
            if (params.toString()) url += `?${params.toString()}`;
        }
        const response = await fetchWithAuth(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch health records");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in getHealthRecords:", e);
        throw e;
    }
}

export const getMyHealthRecords = getHealthRecords;

export async function getHealthRecordById(id: string) {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch health record");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in getHealthRecordById:", e);
        throw e;
    }
}

export async function createHealthRecord(data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create health record");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in createHealthRecord:", e);
        throw e;
    }
}

export async function updateHealthRecord(id: string, data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update health record");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in updateHealthRecord:", e);
        throw e;
    }
}

export async function deleteHealthRecord(id: string) {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to delete health record");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in deleteHealthRecord:", e);
        throw e;
    }
}

export async function getTreatments(diseaseRecordId: string) {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases/${diseaseRecordId}/treatments`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch treatments");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in getTreatments:", e);
        throw e;
    }
}

export async function createTreatment(diseaseRecordId: string, data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases/${diseaseRecordId}/treatments`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create treatment");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in createTreatment:", e);
        throw e;
    }
}

export async function getHealthStats(apiaryId?: string) {
    try {
        const url = apiaryId 
            ? `${API_URL}/diseases/stats?apiaryId=${apiaryId}`
            : `${API_URL}/diseases/stats`;
        const response = await fetchWithAuth(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch health stats");
        }
        return await response.json();
    } catch (e) {
        console.error("API error in getHealthStats:", e);
        throw e;
    }
}
