import { API_URL, fetchWithAuth } from '@/config';

// --- Weather ---
export async function getCurrentWeather(apiaryId: string) {
    const response = await fetchWithAuth(`${API_URL}/environment/weather/${apiaryId}/current`);
    if (!response.ok) throw new Error('Failed to fetch weather');
    return response.json();
}

export async function getForecast(apiaryId: string) {
    const response = await fetchWithAuth(`${API_URL}/environment/weather/${apiaryId}/forecast`);
    if (!response.ok) throw new Error('Failed to fetch forecast');
    return response.json();
}

export async function recordManualWeather(apiaryId: string, data: any) {
    const response = await fetchWithAuth(`${API_URL}/environment/weather/${apiaryId}/manual`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to record manual weather');
    return response.json();
}

// --- Plants ---
export async function searchPlants(query: string) {
    const response = await fetchWithAuth(`${API_URL}/environment/plants/library/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search plants');
    return response.json();
}

export async function getApiaryPlants(apiaryId: string) {
    const response = await fetchWithAuth(`${API_URL}/environment/plants/apiary/${apiaryId}`);
    if (!response.ok) throw new Error('Failed to fetch apiary plants');
    return response.json();
}

export async function addLocalPlant(data: { apiaryId: string; plantId: string; coverage: number; coverageUnit: string }) {
    const response = await fetchWithAuth(`${API_URL}/environment/plants/local`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to add plant');
    return response.json();
}

export async function removeLocalPlant(id: string) {
    const response = await fetchWithAuth(`${API_URL}/environment/plants/local/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove plant');
    return response.json();
}
