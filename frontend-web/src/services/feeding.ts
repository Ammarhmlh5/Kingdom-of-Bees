import { API_URL, fetchWithAuth } from '@/config';

export async function getFeedingRecords(apiaryId: string) {
    try {
        const response = await fetchWithAuth(`/apiaries/${apiaryId}/feeding`);

        if (!response.ok) throw new Error("Failed to fetch feeding records");
        return await response.json();
    } catch (e) {
        console.error("API error in getFeedingRecords:", e);
        return [];
    }
}

export const getMyFeedingRecords = getFeedingRecords;

export async function createFeedingRecord(apiaryId: string, data: any) {
    try {
        const response = await fetchWithAuth(`/apiaries/${apiaryId}/feeding`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (e) {
        console.error("API error in createFeedingRecord:", e);
    }
}
