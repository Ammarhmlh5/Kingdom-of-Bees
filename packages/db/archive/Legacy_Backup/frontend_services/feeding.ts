import { API_URL, fetchWithAuth } from '@/config';

export interface FeedingType {
    id: string;
    name: string;
    category: string;
    unit: string;
    defaultQuantity?: number;
}

export interface FeedingRecommendation {
    hiveId: string;
    type: FeedingType;
    quantity: number;
    reason: string;
    status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
}

// 1. Get Feeding Types
export async function getFeedingTypes(): Promise<FeedingType[]> {
    const response = await fetchWithAuth(`${API_URL}/feeding/types`);
    if (!response.ok) throw new Error('Failed to fetch feeding types');
    return response.json();
}

// 2. Create Feeding Record
export async function createFeedingRecord(data: {
    apiaryId: string;
    hiveId?: string | null;
    typeId: string;
    quantity: number;
    notes?: string;
    feedingDate?: string;
}) {
    const response = await fetchWithAuth(`${API_URL}/feeding`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create feeding record');
    return response.json();
}

// 3. Get Feeding Records (History)
export async function getFeedingRecords(filters?: {
    apiaryId?: string;
    hiveId?: string;
    typeId?: string;
    startDate?: string;
    endDate?: string;
}) {
    const params = new URLSearchParams();
    if (filters?.apiaryId) params.append('apiaryId', filters.apiaryId);
    if (filters?.hiveId) params.append('hiveId', filters.hiveId);
    if (filters?.typeId) params.append('typeId', filters.typeId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await fetchWithAuth(`${API_URL}/feeding?${params}`);
    if (!response.ok) throw new Error("Failed to fetch feeding records");
    return response.json();
}

// 4. Get Recommendations (Hive or Apiary)
export async function getFeedingRecommendations(hiveId?: string, apiaryId?: string) {
    let url = `${API_URL}/feeding/recommendations`;
    if (hiveId) {
        url += `/${hiveId}`;
    } else if (apiaryId) {
        const params = new URLSearchParams({ apiaryId });
        url += `?${params.toString()}`;
    }

    const response = await fetchWithAuth(url);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
}

// 5. Get Summary
export async function getApiaryFeedingSummary(apiaryId: string) {
    const response = await fetchWithAuth(`${API_URL}/feeding/summary/${apiaryId}`);
    if (!response.ok) throw new Error('Failed to fetch summary');
    return response.json();
}

// Aliases for compatibility
export const getMyFeedingRecords = getFeedingRecords;
