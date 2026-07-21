import apiClient from '@/lib/apiClient';

function unwrap<T = any>(raw: any, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;
  if (raw.data !== undefined && raw.data !== null) return raw.data as T;
  return raw as T;
}

function unwrapArray(raw: any): any[] {
  const data = unwrap(raw, []);
  return Array.isArray(data) ? data : [];
}

export const apiaryService = {
  async getMyApiaries() {
    const { data } = await apiClient.get('/apiaries/');
    const list = unwrapArray(data);
    return list.map((a: any) => ({
      ...a,
      hiveCount: a._count?.hives || a.currentHiveCount || 0,
      location: a.address || '',
      latitude: a.locationLat ? Number(a.locationLat) : undefined,
      longitude: a.locationLng ? Number(a.locationLng) : undefined,
    }));
  },

  async getApiaryDetails(id: string) {
    const { data } = await apiClient.get(`/apiaries/${id}`);
    return unwrap<any>(data, null);
  },

  async getApiaryStats(id: string) {
    const { data } = await apiClient.get(`/apiaries/${id}/stats/dashboard`);
    return unwrap<any>(data, { totalHives: 0, activeHives: 0, honeyProduced: 0 });
  },
};

export const hiveService = {
  async getHives(apiaryId: string) {
    const { data } = await apiClient.get(`/apiaries/${apiaryId}/hives`);
    return unwrapArray(data);
  },

  async getHive(apiaryId: string, hiveId: string) {
    const { data } = await apiClient.get(`/apiaries/${apiaryId}/hives/${hiveId}`);
    return unwrap<any>(data, null);
  },
};

export const inspectionService = {
  async getInspections(apiaryId: string) {
    const { data } = await apiClient.get(`/apiaries/${apiaryId}/inspections`);
    return unwrapArray(data);
  },
};

export const weatherService = {
  async getCurrentWeather(apiaryId: string) {
    const { data } = await apiClient.get(`/weather/current/${apiaryId}`);
    return unwrap<any>(data, null);
  },
};

export const harvestService = {
  async getMyHarvests() {
    const { data } = await apiClient.get('/harvest/my');
    return unwrapArray(data);
  },
};

export { unwrap, unwrapArray };
