import { API_URL, fetchWithAuth } from '@/config';

export async function getOperations(apiaryId?: string, filters?: {
    type?: string;
    startDate?: string;
    endDate?: string;
}) {
    try {
        let url = apiaryId 
            ? `${API_URL}/operations/apiary/${apiaryId}`
            : `${API_URL}/operations`;
        
        if (filters) {
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (params.toString()) url += `?${params.toString()}`;
        }
        
        const response = await fetchWithAuth(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch operations');
        }
        return response.json();
    } catch (e) {
        console.error("API error in getOperations:", e);
        throw e;
    }
}

export async function getOperationById(id: string) {
    try {
        const response = await fetchWithAuth(`${API_URL}/operations/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch operation');
        }
        return response.json();
    } catch (e) {
        console.error("API error in getOperationById:", e);
        throw e;
    }
}

export async function performSplit(data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/operations/split`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to perform split');
        }
        return response.json();
    } catch (e) {
        console.error("API error in performSplit:", e);
        throw e;
    }
}

export async function performMerge(data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/operations/merge`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to perform merge');
        }
        return response.json();
    } catch (e) {
        console.error("API error in performMerge:", e);
        throw e;
    }
}

export async function reportSwarm(data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/operations/swarm`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to report swarm');
        }
        return response.json();
    } catch (e) {
        console.error("API error in reportSwarm:", e);
        throw e;
    }
}

export async function performRequeening(data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/operations/requeening`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to perform requeening');
        }
        return response.json();
    } catch (e) {
        console.error("API error in performRequeening:", e);
        throw e;
    }
}

export async function getOperationStats(apiaryId?: string) {
    try {
        const url = apiaryId 
            ? `${API_URL}/operations/stats?apiaryId=${apiaryId}`
            : `${API_URL}/operations/stats`;
        const response = await fetchWithAuth(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch operation stats');
        }
        return response.json();
    } catch (e) {
        console.error("API error in getOperationStats:", e);
        throw e;
    }
}
