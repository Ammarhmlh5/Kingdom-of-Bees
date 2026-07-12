import { fetchWithAuth } from '../config';

export interface InspectionSetting {
  id: string;
  type: string;
  nameAr: string;
  minInterval: number;
  maxInterval: number;
  isActive: boolean;
  description?: string;
}

// Get all inspection settings
export const getInspectionSettings = async (): Promise<InspectionSetting[]> => {
  const response = await fetchWithAuth('/inspection-settings');
  if (!response.ok) throw new Error('Failed to fetch settings');
  const data = await response.json();
  return data.data;
};

// Save inspection setting (create or update)
export const saveInspectionSetting = async (data: Partial<InspectionSetting>): Promise<InspectionSetting> => {
  const response = await fetchWithAuth('/inspection-settings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to save setting');
  const result = await response.json();
  return result.data;
};

export default {
  getInspectionSettings,
  saveInspectionSetting,
};