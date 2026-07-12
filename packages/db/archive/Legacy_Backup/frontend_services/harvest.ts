import { API_URL, fetchWithAuth } from '@/config';

// ============================================================================
// Harvest Records (Main)
// ============================================================================

/**
 * Get all harvest records with optional filters
 */
export async function getHarvestRecords(filters?: {
    apiaryId?: string;
    harvestType?: string;
    startDate?: string;
    endDate?: string;
}) {
    const params = new URLSearchParams();
    if (filters?.apiaryId) params.append('apiaryId', filters.apiaryId);
    if (filters?.harvestType) params.append('harvestType', filters.harvestType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await fetchWithAuth(`${API_URL}/harvests?${params}`);
    if (!response.ok) throw new Error("Failed to fetch harvest records");
    return response.json();
}

/**
 * Get harvest record by ID
 */
export async function getHarvestRecordById(id: string) {
    const response = await fetchWithAuth(`${API_URL}/harvests/${id}`);
    if (!response.ok) throw new Error("Failed to fetch harvest record");
    return response.json();
}

export const getMyHarvests = getHarvestRecords;

/**
 * Create new harvest record
 */
export async function createHarvestRecord(data: {
    apiaryId: string;
    harvestDate: string;
    harvestType: string;
    totalYieldKg?: number;
    notes?: string;
}) {
    const response = await fetchWithAuth(`${API_URL}/harvests`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to create harvest record");
    return response.json();
}

/**
 * Update harvest record
 */
export async function updateHarvestRecord(id: string, data: Partial<{
    harvestDate: string;
    harvestType: string;
    totalYieldKg: number;
    notes: string;
}>) {
    const response = await fetchWithAuth(`${API_URL}/harvests/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to update harvest record");
    return response.json();
}

/**
 * Delete harvest record
 */
export async function deleteHarvestRecord(id: string) {
    const response = await fetchWithAuth(`${API_URL}/harvests/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) throw new Error("Failed to delete harvest record");
    return response.json();
}

// ============================================================================
// Honey Harvest
// ============================================================================

/**
 * Create honey harvest
 */
export async function createHoneyHarvest(data: {
    harvestRecordId: string;
    hiveId: string;
    honeyType?: string;
    yieldKg: number;
    moistureContent?: number;
    qualityGrade?: string;
    framesHarvested?: number;
    notes?: string;
}) {
    const response = await fetchWithAuth(`${API_URL}/harvests/honey`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to add honey harvest");
    return response.json();
}

/**
 * Get honey harvests with optional filters
 */
export async function getHoneyHarvests(filters?: {
    harvestRecordId?: string;
    hiveId?: string;
}) {
    const params = new URLSearchParams();
    if (filters?.harvestRecordId) params.append('harvestRecordId', filters.harvestRecordId);
    if (filters?.hiveId) params.append('hiveId', filters.hiveId);
    
    const response = await fetchWithAuth(`${API_URL}/harvests/honey/list?${params}`);
    if (!response.ok) throw new Error("Failed to fetch honey harvests");
    return response.json();
}

// ============================================================================
// Pollen Harvest
// ============================================================================

/**
 * Create pollen harvest
 */
export async function createPollenHarvest(data: {
    harvestRecordId: string;
    hiveId: string;
    yieldKg: number;
    pollenColor?: string;
    qualityGrade?: string;
    notes?: string;
}) {
    const response = await fetchWithAuth(`${API_URL}/harvests/pollen`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to add pollen harvest");
    return response.json();
}

/**
 * Get pollen harvests with optional filters
 */
export async function getPollenHarvests(filters?: {
    harvestRecordId?: string;
    hiveId?: string;
}) {
    const params = new URLSearchParams();
    if (filters?.harvestRecordId) params.append('harvestRecordId', filters.harvestRecordId);
    if (filters?.hiveId) params.append('hiveId', filters.hiveId);
    
    const response = await fetchWithAuth(`${API_URL}/harvests/pollen/list?${params}`);
    if (!response.ok) throw new Error("Failed to fetch pollen harvests");
    return response.json();
}

// ============================================================================
// Royal Jelly Production
// ============================================================================

/**
 * Create royal jelly production record
 */
export async function createRoyalJellyProduction(data: {
    hiveId: string;
    productionDate: string;
    yieldGrams: number;
    qualityGrade?: string;
    notes?: string;
}) {
    const response = await fetchWithAuth(`${API_URL}/harvests/royal-jelly`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to add royal jelly production");
    return response.json();
}

/**
 * Get royal jelly productions with optional filters
 */
export async function getRoyalJellyProductions(filters?: {
    hiveId?: string;
    startDate?: string;
    endDate?: string;
}) {
    const params = new URLSearchParams();
    if (filters?.hiveId) params.append('hiveId', filters.hiveId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await fetchWithAuth(`${API_URL}/harvests/royal-jelly/list?${params}`);
    if (!response.ok) throw new Error("Failed to fetch royal jelly productions");
    return response.json();
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get harvest statistics for an apiary
 */
export async function getHarvestStats(apiaryId?: string) {
    if (!apiaryId) {
        throw new Error('Apiary ID is required for harvest stats');
    }

    const response = await fetchWithAuth(`${API_URL}/harvests/stats/${apiaryId}`);
    if (!response.ok) throw new Error("Failed to fetch stats");
    return response.json();
}
