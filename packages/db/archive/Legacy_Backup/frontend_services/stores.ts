import { API_URL, fetchWithAuth } from '@/config';

export async function getStores() {
    try {
        const response = await fetchWithAuth(`${API_URL}/products`);
        if (!response.ok) throw new Error("Failed to fetch stores");
        return await response.json();
    } catch (e) {
        console.error("API error in getStores:", e);
        // Return mock data for now
        return {
            equipment: [
                { id: 1, type: 'BOXES', count: 45, status: 'GOOD' },
                { id: 2, type: 'FRAMES', count: 320, status: 'NEW' }
            ],
            products: [
                { id: 1, type: 'HONEY', quantity: '120kg', lastHarvest: '2025-12-01' }
            ],
            feedStock: { sugar: '250kg', protein: '40kg' }
        };
    }
}

export const getStoreAnalytics = getStores;
