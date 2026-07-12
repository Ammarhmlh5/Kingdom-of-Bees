import api from './api';

export interface InspectionSetting {
  id: string;
  type: string;
  nameAr: string;
  nameEn: string;
  minInterval: number;
  maxInterval: number;
  isActive: boolean;
  description?: string;
}

export interface InspectionSchedule {
  id: string;
  hiveId: string;
  settingId: string;
  scheduledDate: string;
  status: 'PENDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  completedAt?: string;
  reminderSent: boolean;
  notes?: string;
  createdAt: string;
  hive?: {
    id: string;
    hiveNumber: string;
    name?: string;
    apiaryId?: string;
  };
  setting?: InspectionSetting;
}

// ==================== INSPECTION SETTINGS ====================

// Get all inspection settings
export const getInspectionSettings = async (): Promise<InspectionSetting[]> => {
  const response = await api.get('/inspection-settings');
  return response.data.data;
};

// Get inspection setting by type
export const getInspectionSetting = async (type: string): Promise<InspectionSetting> => {
  const response = await api.get(`/inspection-settings/${type}`);
  return response.data.data;
};

// Create or update inspection setting
export const saveInspectionSetting = async (data: Partial<InspectionSetting>): Promise<InspectionSetting> => {
  const response = await api.post('/inspection-settings', data);
  return response.data.data;
};

// Update inspection setting
export const updateInspectionSetting = async (type: string, data: Partial<InspectionSetting>): Promise<InspectionSetting> => {
  const response = await api.put(`/inspection-settings/${type}`, data);
  return response.data.data;
};

// Validate inspection date
export const validateInspectionDate = async (type: string, inspectionDate: string): Promise<{
  valid: boolean;
  message: string;
  setting?: InspectionSetting;
}> => {
  const response = await api.post('/inspection-settings/validate', { type, inspectionDate });
  return response.data;
};

// ==================== INSPECTION SCHEDULES ====================

// Get schedules by hive
export const getHiveSchedules = async (hiveId: string): Promise<InspectionSchedule[]> => {
  const response = await api.get(`/inspection-settings/${hiveId}/schedules`);
  return response.data.data;
};

// Get upcoming schedules
export const getUpcomingSchedules = async (limit: number = 10): Promise<InspectionSchedule[]> => {
  const response = await api.get(`/inspection-settings/upcoming?limit=${limit}`);
  return response.data.data;
};

// Get overdue schedules
export const getOverdueSchedules = async (limit: number = 10): Promise<InspectionSchedule[]> => {
  const response = await api.get(`/inspection-settings/overdue?limit=${limit}`);
  return response.data.data;
};

// Complete schedule
export const completeSchedule = async (id: string): Promise<InspectionSchedule> => {
  const response = await api.put(`/inspection-settings/${id}/complete`);
  return response.data.data;
};

// Cancel schedule
export const cancelSchedule = async (id: string): Promise<InspectionSchedule> => {
  const response = await api.put(`/inspection-settings/${id}/cancel`);
  return response.data.data;
};

// Service export
export const inspectionSettingsService = {
  getInspectionSettings,
  getInspectionSetting,
  saveInspectionSetting,
  updateInspectionSetting,
  validateInspectionDate,
  getHiveSchedules,
  getUpcomingSchedules,
  getOverdueSchedules,
  completeSchedule,
  cancelSchedule,
};

export default inspectionSettingsService;