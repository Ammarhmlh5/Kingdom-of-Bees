import { API_URL, fetchWithAuth } from '@/config';

export interface Disease {
    id: string;
    nameAr: string;
    nameEn: string;
    diseaseType: string;
    severity: string;
    contagiousness: string;
    symptoms: any;
    treatable: boolean;
    description?: string;
    imageUrl?: string;
    scientificName?: string;
}

export interface DiseaseRecord {
    id: string;
    diseaseId: string;
    apiaryId: string;
    firstDetectedDate: string;
    status: 'ACTIVE' | 'TREATING' | 'RESOLVED' | 'CATASTROPHIC';
    totalAffectedHives: number;
    disease?: Disease;
    apiary?: { name: string };
}

export async function getDiseases(): Promise<Disease[]> {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases`);
        if (!response.ok) throw new Error("Failed to fetch diseases");
        return await response.json();
    } catch (e) {
        console.error("API error in getDiseases:", e);
        return [];
    }
}

export async function getDiseaseById(id: string): Promise<Disease | null> {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases/${id}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        console.error("API error in getDiseaseById:", e);
        return null;
    }
}

export async function getDiseaseTreatments(diseaseId: string) {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases/${diseaseId}/treatments`);
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error("API error in getDiseaseTreatments:", e);
        return [];
    }
}

export async function createDiseaseRecord(data: {
    apiaryId: string;
    diseaseId: string;
    affectedHives: string[];
    notes?: string;
    date?: string;
}) {
    const response = await fetchWithAuth(`${API_URL}/diseases/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Failed to create record");
    return await response.json();
}

export async function getApiaryDiseaseRecords(apiaryId: string): Promise<DiseaseRecord[]> {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases/apiary/${apiaryId}/records`);
        if (!response.ok) throw new Error("Failed to fetch records");
        return await response.json();
    } catch (e) {
        console.error("API error in getApiaryDiseaseRecords:", e);
        return [];
    }
}

export async function getDiseaseRecords(): Promise<DiseaseRecord[]> {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases/records`);
        if (!response.ok) throw new Error("Failed to fetch records");
        return await response.json();
    } catch (e) {
        console.error("API error in getDiseaseRecords:", e);
        return [];
    }
}

export async function getNearbyDiseases(lat: number, lng: number, radius: number = 10) {
    try {
        const response = await fetchWithAuth(`${API_URL}/diseases/records/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error("API error in getNearbyDiseases:", e);
        return [];
    }
}
