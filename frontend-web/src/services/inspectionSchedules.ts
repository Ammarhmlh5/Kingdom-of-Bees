import api from './api';

export interface InspectionSetting {
  id: string;
  type: string;
  nameAr: string;
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
  status: 'PENDING' | 'COMPLETED' | 'MISSED' | 'OVERDUE' | 'CANCELLED';
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

export const getApiarySchedules = async (apiaryId: string): Promise<InspectionSchedule[]> => {
  const response = await api.get(`/apiaries/${apiaryId}/schedules`);
  return response.data.data;
};

export const getUpcomingSchedules = async (limit: number = 10): Promise<InspectionSchedule[]> => {
  const response = await api.get(`/schedules/upcoming?limit=${limit}`);
  return response.data.data;
};

export const getOverdueSchedules = async (limit: number = 10): Promise<InspectionSchedule[]> => {
  const response = await api.get(`/schedules/overdue?limit=${limit}`);
  return response.data.data;
};

export const completeSchedule = async (id: string): Promise<InspectionSchedule> => {
  const response = await api.put(`/schedules/${id}/complete`);
  return response.data.data;
};

export const cancelSchedule = async (id: string): Promise<InspectionSchedule> => {
  const response = await api.put(`/schedules/${id}/cancel`);
  return response.data.data;
};

export const inspectionSchedulesService = {
  getApiarySchedules,
  getUpcomingSchedules,
  getOverdueSchedules,
  completeSchedule,
  cancelSchedule,
};

export default inspectionSchedulesService;
