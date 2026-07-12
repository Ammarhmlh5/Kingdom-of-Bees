
import { API_URL, fetchWithAuth } from '@/config';

export interface Alert {
    id: string;
    title: string;
    message: string;
    alertType: string;
    priority: 'IMMEDIATE' | 'URGENT' | 'SOON' | 'ROUTINE';
    apiaryId?: string;
    apiary?: {
        name: string;
        locationLat?: number;
        locationLng?: number;
    };
    status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';
    createdAt: string;
}

export async function getAlerts(lat?: number, lng?: number, radius?: number) {
    try {
        let url = `${API_URL}/alerts`;
        const params = new URLSearchParams();
        if (lat) params.append('lat', lat.toString());
        if (lng) params.append('lng', lng.toString());
        if (radius) params.append('radius', radius.toString());

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetchWithAuth(url);
        if (!response.ok) throw new Error("Failed to fetch alerts");
        return await response.json();
    } catch (e) {
        console.error("API error in getAlerts:", e);
        return [];
    }
}

export async function createAlert(data: any) {
    try {
        const response = await fetchWithAuth(`${API_URL}/alerts`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to create alert");
        return await response.json();
    } catch (e) {
        console.error("API error in createAlert:", e);
        throw e;
    }
}
