import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getInspectionSettings, 
  getInspectionSetting,
  saveInspectionSetting, 
  updateInspectionSetting,
  validateInspectionDate,
  getUpcomingSchedules,
  getOverdueSchedules,
  completeSchedule,
  cancelSchedule,
  InspectionSetting,
  InspectionSchedule
} from '@/services/inspectionSettings';

// Query Keys
export const inspectionSettingsKeys = {
  all: ['inspectionSettings'] as const,
  detail: (type: string) => ['inspectionSettings', type] as const,
  validate: (type: string, date: string) => ['inspectionSettings', 'validate', type, date] as const,
  upcoming: (limit?: number) => ['inspectionSchedules', 'upcoming', limit] as const,
  overdue: (limit?: number) => ['inspectionSchedules', 'overdue', limit] as const,
};

// ==================== INSPECTION SETTINGS HOOKS ====================

// Get all inspection settings
export function useInspectionSettings() {
  return useQuery({
    queryKey: inspectionSettingsKeys.all,
    queryFn: getInspectionSettings,
  });
}

// Get single inspection setting
export function useInspectionSetting(type: string) {
  return useQuery({
    queryKey: inspectionSettingsKeys.detail(type),
    queryFn: () => getInspectionSetting(type),
    enabled: !!type,
  });
}

// Save inspection setting
export function useSaveInspectionSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<InspectionSetting>) => saveInspectionSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inspectionSettingsKeys.all });
    },
  });
}

// Update inspection setting
export function useUpdateInspectionSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ type, data }: { type: string; data: Partial<InspectionSetting> }) => 
      updateInspectionSetting(type, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inspectionSettingsKeys.all });
      queryClient.invalidateQueries({ queryKey: inspectionSettingsKeys.detail(variables.type) });
    },
  });
}

// Validate inspection date
export function useValidateInspectionDate() {
  return useMutation({
    mutationFn: ({ type, inspectionDate }: { type: string; inspectionDate: string }) => 
      validateInspectionDate(type, inspectionDate),
  });
}

// ==================== INSPECTION SCHEDULES HOOKS ====================

// Get upcoming schedules
export function useUpcomingSchedules(limit: number = 10) {
  return useQuery({
    queryKey: inspectionSettingsKeys.upcoming(limit),
    queryFn: () => getUpcomingSchedules(limit),
  });
}

// Get overdue schedules
export function useOverdueSchedules(limit: number = 10) {
  return useQuery({
    queryKey: inspectionSettingsKeys.overdue(limit),
    queryFn: () => getOverdueSchedules(limit),
  });
}

// Complete schedule
export function useCompleteSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => completeSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inspectionSettingsKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: inspectionSettingsKeys.overdue() });
    },
  });
}

// Cancel schedule
export function useCancelSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => cancelSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inspectionSettingsKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: inspectionSettingsKeys.overdue() });
    },
  });
}