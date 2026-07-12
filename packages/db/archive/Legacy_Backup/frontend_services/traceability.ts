import { API_URL, fetchWithAuth } from '@/config';

export async function createBatch(data: {
    harvestRecordIds: string[];
    totalQuantityKg: number;
    bestBeforeDate: Date;
}) {
    const response = await fetchWithAuth(`${API_URL}/traceability/batches`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to create batch");
    return response.json();
}

export async function getBatches() {
    const response = await fetchWithAuth(`${API_URL}/traceability/batches`);
    if (!response.ok) throw new Error("Failed to fetch batches");
    return response.json();
}

export async function getBatchDetails(id: string) {
    const response = await fetchWithAuth(`${API_URL}/traceability/batches/${id}`);
    if (!response.ok) throw new Error("Failed to fetch batch details");
    return response.json();
}

export async function getBatchQR(batchCode: string) {
    const response = await fetchWithAuth(`${API_URL}/traceability/qr/${batchCode}`);
    if (!response.ok) throw new Error("Failed to generate QR");
    return response.json();
}

export async function trackProductPublic(code: string) {
    const response = await fetch(`${API_URL}/traceability/track/${code}`);
    if (!response.ok) throw new Error("Product not found");
    return response.json();
}
