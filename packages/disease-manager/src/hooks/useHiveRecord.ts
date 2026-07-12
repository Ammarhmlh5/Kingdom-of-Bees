/**
 * useHiveRecord Hook
 * 
 * Hook للتفاعل مع نظام سجلات الخلايا
 */

import { useState, useEffect, useCallback } from 'react';
import { HiveRecordService } from '../services/HiveRecordService';
import {
  HiveRecord,
  DiseaseRecord,
  TreatmentRecord,
  InspectionRecord,
  ImageRecord,
  NoteRecord,
  HiveStatistics,
  ReportOptions,
  ReportData,
  HiveRecordSearchFilters,
} from '../types/hive-record';
import { useDiseaseManager } from './useDiseaseManager';

export interface UseHiveRecordOptions {
  hiveId: string;
  autoLoad?: boolean;
  refreshInterval?: number; // milliseconds
}

export interface UseHiveRecordReturn {
  // State
  record: HiveRecord | null;
  loading: boolean;
  error: Error | null;
  
  // Disease History
  diseases: DiseaseRecord[];
  activeDiseases: DiseaseRecord[];
  addDisease: (disease: Omit<DiseaseRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDisease: (id: string, updates: Partial<DiseaseRecord>) => Promise<void>;
  resolveDisease: (id: string, outcome: DiseaseRecord['outcome']) => Promise<void>;
  
  // Treatment History
  treatments: TreatmentRecord[];
  addTreatment: (treatment: Omit<TreatmentRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTreatment: (id: string, updates: Partial<TreatmentRecord>) => Promise<void>;
  
  // Inspection History
  inspections: InspectionRecord[];
  lastInspection: InspectionRecord | null;
  addInspection: (inspection: Omit<InspectionRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  // Images
  images: ImageRecord[];
  addImage: (image: Omit<ImageRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  
  // Notes
  notes: NoteRecord[];
  addNote: (note: Omit<NoteRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<NoteRecord>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Statistics
  statistics: HiveStatistics | null;
  healthScore: number | undefined;
  healthTrend: 'improving' | 'stable' | 'declining' | undefined;
  
  // Reports
  generateReport: (options: ReportOptions, userId: string) => Promise<ReportData>;
  exportReport: (reportData: ReportData) => Promise<string>;
  
  // Search
  search: (filters: HiveRecordSearchFilters) => Promise<{
    diseases: DiseaseRecord[];
    treatments: TreatmentRecord[];
    inspections: InspectionRecord[];
    images: ImageRecord[];
    notes: NoteRecord[];
  }>;
  
  // Actions
  refresh: () => Promise<void>;
}

export function useHiveRecord(options: UseHiveRecordOptions): UseHiveRecordReturn {
  const { hiveId, autoLoad = true, refreshInterval } = options;
  const { database } = useDiseaseManager();
  
  const [record, setRecord] = useState<HiveRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const service = new HiveRecordService(database);
  
  // Load hive record
  const loadRecord = useCallback(async () => {
    if (!hiveId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let hiveRecord = await service.getHiveRecord(hiveId);
      
      // Create record if it doesn't exist
      if (!hiveRecord && database) {
        hiveRecord = await service.createHiveRecord(hiveId, 'current-user');
      }
      
      setRecord(hiveRecord);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [hiveId, database]);
  
  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadRecord();
    }
  }, [autoLoad, loadRecord]);
  
  // Auto-refresh
  useEffect(() => {
    if (!refreshInterval) return;
    
    const interval = setInterval(() => {
      loadRecord();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval, loadRecord]);
  
  // Disease History
  const addDisease = useCallback(async (disease: Omit<DiseaseRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await service.addDiseaseRecord(disease);
      await loadRecord();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadRecord]);
  
  const updateDisease = useCallback(async (id: string, updates: Partial<DiseaseRecord>) => {
    try {
      await service.updateDiseaseRecord(id, updates);
      await loadRecord();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadRecord]);
  
  const resolveDisease = useCallback(async (id: string, outcome: DiseaseRecord['outcome']) => {
    try {
      await service.resolveDisease(id, outcome);
      await loadRecord();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadRecord]);
  
  // Treatment History
  const addTreatment = useCallback(async (treatment: Omit<TreatmentRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await service.addTreatmentRecord(treatment);
      await loadRecord();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadRecord]);
  
  const updateTreatment = useCallback(async (id: string, updates: Partial<TreatmentRecord>) => {
    try {
      await service.updateTreatmentRecord(id, updates);
      await loadRecord();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadRecord]);
  
  // Inspection History
  const addInspection = useCallback(async (inspection: Omit<InspectionRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await service.addInspectionRecord(inspection);
      await loadRecord();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadRecord]);
  
  // Images
  const addImage = useCallback(async (image: Omit<ImageRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await service.addImageRecord(image);
      await loadRecord();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadRecord]);
  
  const deleteImage = useCallback(async (id: string) => {
    try {
      await service.deleteImageRecord(id);
      await loadRecord();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadRecord]);
  
  // Notes
  const addNote = useCallback(async (note: Omit<NoteRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await service.addNoteRecord(note);
      await loadRecord();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadRecord]);
  
  const updateNote = useCallback(async (id: string, updates: Partial<NoteRecord>) => {
    try {
      await service.updateNoteRecord(id, updates);
      await loadRecord();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadRecord]);
  
  const deleteNote = useCallback(async (id: string) => {
    try {
      await service.deleteNoteRecord(id);
      await loadRecord();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [loadRecord]);
  
  // Reports
  const generateReport = useCallback(async (options: ReportOptions, userId: string) => {
    if (!record) {
      throw new Error('No hive record loaded');
    }
    
    try {
      return await service.generateReport(record.id, options, userId);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [record]);
  
  const exportReport = useCallback(async (reportData: ReportData) => {
    try {
      return await service.exportReport(reportData);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);
  
  // Search
  const search = useCallback(async (filters: HiveRecordSearchFilters) => {
    if (!record) {
      throw new Error('No hive record loaded');
    }
    
    try {
      return await service.searchRecords(record.id, filters);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [record]);
  
  return {
    // State
    record,
    loading,
    error,
    
    // Disease History
    diseases: record?.diseaseHistory || [],
    activeDiseases: record?.diseaseHistory.filter(d => d.status === 'active' || d.status === 'treating') || [],
    addDisease,
    updateDisease,
    resolveDisease,
    
    // Treatment History
    treatments: record?.treatmentHistory || [],
    addTreatment,
    updateTreatment,
    
    // Inspection History
    inspections: record?.inspectionHistory || [],
    lastInspection: record?.inspectionHistory[0] || null,
    addInspection,
    
    // Images
    images: record?.images || [],
    addImage,
    deleteImage,
    
    // Notes
    notes: record?.notes || [],
    addNote,
    updateNote,
    deleteNote,
    
    // Statistics
    statistics: record?.statistics || null,
    healthScore: record?.statistics.healthScore,
    healthTrend: record?.statistics.healthTrend,
    
    // Reports
    generateReport,
    exportReport,
    
    // Search
    search,
    
    // Actions
    refresh: loadRecord,
  };
}
