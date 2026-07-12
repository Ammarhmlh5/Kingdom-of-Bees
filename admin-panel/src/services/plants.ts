import { fetchWithAuth } from '../config';

export interface Plant {
  id: string;
  scientificName: string;
  commonNameAr: string;
  commonNameEn?: string;
  localNames: string[];
  synonyms: string[];
  plantType: string;
  family?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  heightMinMeters?: number;
  heightMaxMeters?: number;
  beekeepingValue: Record<string, unknown>;
  flowering: Record<string, unknown>;
  environment?: Record<string, unknown>;
  nativeRegions: string[];
  cultivatedRegions: string[];
  images: string[];
  videos: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const adminPlantsService = {
  list: async (params?: { page?: number; limit?: number; type?: string; search?: string; verified?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.verified !== undefined) searchParams.set('verified', String(params.verified));
    const qs = searchParams.toString();
    const res = await fetchWithAuth(`/admin/plants${qs ? `?${qs}` : ''}`);
    return res.json();
  },

  get: async (id: string) => {
    const res = await fetchWithAuth(`/admin/plants/${id}`);
    return res.json();
  },

  create: async (data: Partial<Plant>) => {
    const res = await fetchWithAuth('/admin/plants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  update: async (id: string, data: Partial<Plant>) => {
    const res = await fetchWithAuth(`/admin/plants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetchWithAuth(`/admin/plants/${id}`, { method: 'DELETE' });
    return res.json();
  },

  verify: async (id: string) => {
    const res = await fetchWithAuth(`/admin/plants/${id}/verify`, { method: 'POST' });
    return res.json();
  },
};
