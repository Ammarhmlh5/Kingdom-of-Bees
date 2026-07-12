import { fetchWithAuth } from '@/config';

export interface HiveTemplate {
    id: string;
    name: string;
    type: string;
    frames: number;
    notes?: string;
    createdAt: string;
}

export async function getHiveTemplates() {
    try {
        const response = await fetchWithAuth(`/hive-templates`);
        if (!response.ok) throw new Error("Failed to fetch templates");
        return await response.json();
    } catch (e) {
        console.error("API error:", e);
        return [];
    }
}

export async function createHiveTemplate(data: Omit<HiveTemplate, 'id' | 'createdAt'>) {
    try {
        const response = await fetchWithAuth(`/hive-templates`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (e) {
        console.error("API error:", e);
    }
}

export async function deleteHiveTemplate(id: string) {
    try {
        const response = await fetchWithAuth(`/hive-templates/${id}`, {
            method: "DELETE",
        });
        return await response.json();
    } catch (e) {
        console.error("API error:", e);
    }
}
