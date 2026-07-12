import { API_URL, fetchWithAuth } from '@/config';

export async function getQueens(filters?: {
    hiveId?: string;
    apiaryId?: string;
    status?: string;
}) {
    try {
        let url = `${API_URL}/queens`;
        if (filters) {
            const params = new URLSearchParams();
            if (filters.hiveId) params.append('hiveId', filters.hiveId);
            if (filters.apiaryId) params.append('apiaryId', filters.apiaryId);
            if (filters.status) params.append('status', filters.status);
            if (params.toString()) url += `?${params.toString()}`;
        }
        const response = await fetchWithAuth(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch queens');
        }
        return response.json();
    } catch (e) {
        console.error("API error in getQueens:", e);
        throw e;
    }
}

export async function getQueen(id: string) {
    try {
        const response = await fetchWithAuth(`${API_URL}/queens/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch queen');
        }
        return response.json();
    } catch (e) {
        console.error("API error in getQueen:", e);
        throw e;
    }
}

export async function createQueen(data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/queens`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create queen');
        }
        return response.json();
    } catch (e) {
        console.error("API error in createQueen:", e);
        throw e;
    }
}

export async function updateQueen(id: string, data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/queens/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update queen');
        }
        return response.json();
    } catch (e) {
        console.error("API error in updateQueen:", e);
        throw e;
    }
}

export async function deleteQueen(id: string) {
    try {
        const response = await fetchWithAuth(`${API_URL}/queens/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete queen');
        }
        return response.json();
    } catch (e) {
        console.error("API error in deleteQueen:", e);
        throw e;
    }
}

export async function replaceQueen(hiveId: string, data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/queens/replace`, {
            method: 'POST',
            body: JSON.stringify({ hiveId, ...data }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to replace queen');
        }
        return response.json();
    } catch (e) {
        console.error("API error in replaceQueen:", e);
        throw e;
    }
}

export async function getQueenHistory(id: string) {
    try {
        const response = await fetchWithAuth(`${API_URL}/queens/${id}/history`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch queen history');
        }
        return response.json();
    } catch (e) {
        console.error("API error in getQueenHistory:", e);
        throw e;
    }
}
