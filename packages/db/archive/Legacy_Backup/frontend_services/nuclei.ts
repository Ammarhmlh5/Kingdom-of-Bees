import { API_URL, fetchWithAuth } from '@/config';

export async function getNuclei(apiaryId: string) {
    const response = await fetchWithAuth(`${API_URL}/nuclei?apiaryId=${apiaryId}`);
    if (!response.ok) throw new Error('Failed to fetch nuclei');
    return response.json();
}

export async function getNucleus(id: string) {
    const response = await fetchWithAuth(`${API_URL}/nuclei/${id}`);
    if (!response.ok) throw new Error('Failed to fetch nucleus');
    return response.json();
}

export async function createNucleus(data: any) {
    const response = await fetchWithAuth(`${API_URL}/nuclei`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to create nucleus');
    return response.json();
}

export async function graduateNucleus(id: string, graduationData: { name: string, hiveType: string }) {
    const response = await fetchWithAuth(`${API_URL}/nuclei/${id}/graduate`, {
        method: 'POST',
        body: JSON.stringify(graduationData),
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to graduate nucleus');
    return response.json();
}
