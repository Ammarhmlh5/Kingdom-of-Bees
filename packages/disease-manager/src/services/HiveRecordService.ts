/**
 * Hive Record Service
 * 
 * خدمة شاملة لإدارة سجلات الخلايا
 * تتضمن إدارة الأمراض، العلاجات، الفحوصات، الصور، والملاحظات
 */

import { DatabaseAdapter } from '../database/types';
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
  DiseaseStatus,
  HiveCondition,
} from '../types/hive-record';

export class HiveRecordService {
  private database?: DatabaseAdapter;

  constructor(database?: DatabaseAdapter) {
    this.database = database;
  }

  // ==================== Hive Record Management ====================

  /**
   * Get hive record by hive ID
   */
  async getHiveRecord(hiveId: string): Promise<HiveRecord | null> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    const records = await this.database.query<HiveRecord>('hive_records', {
      where: { hiveId },
      limit: 1,
    });

    if (records.length === 0) {
      return null;
    }

    const record = records[0];

    // Load related data
    record.diseaseHistory = await this.getDiseaseHistory(record.id);
    record.treatmentHistory = await this.getTreatmentHistory(record.id);
    record.inspectionHistory = await this.getInspectionHistory(record.id);
    record.images = await this.getImages(record.id);
    record.notes = await this.getNotes(record.id);
    record.statistics = await this.calculateStatistics(record.id);

    return record;
  }

  /**
   * Create new hive record
   */
  async createHiveRecord(hiveId: string, userId: string): Promise<HiveRecord> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    const now = new Date();
    const record: HiveRecord = {
      id: this.generateId(),
      hiveId,
      userId,
      createdAt: now,
      updatedAt: now,
      diseaseHistory: [],
      treatmentHistory: [],
      inspectionHistory: [],
      images: [],
      notes: [],
      statistics: {
        totalDiseases: 0,
        activeDiseases: 0,
        resolvedDiseases: 0,
        totalTreatments: 0,
        activeTreatments: 0,
        completedTreatments: 0,
        totalCost: 0,
        totalInspections: 0,
        totalImages: 0,
        totalNotes: 0,
        lastUpdated: now,
      },
    };

    await this.database.create('hive_records', record);
    return record;
  }

  /**
   * Update hive record
   */
  async updateHiveRecord(id: string, updates: Partial<HiveRecord>): Promise<void> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    await this.database.update('hive_records', id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  // ==================== Disease History ====================

  /**
   * Get disease history for a hive record
   */
  async getDiseaseHistory(hiveRecordId: string): Promise<DiseaseRecord[]> {
    if (!this.database) {
      return [];
    }

    return await this.database.query<DiseaseRecord>('disease_records', {
      where: { hiveRecordId },
      orderBy: { field: 'diagnosedAt', direction: 'desc' },
    });
  }

  /**
   * Add disease record
   */
  async addDiseaseRecord(record: Omit<DiseaseRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiseaseRecord> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    const now = new Date();
    const diseaseRecord: DiseaseRecord = {
      ...record,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    await this.database.create('disease_records', diseaseRecord);
    await this.updateStatistics(record.hiveRecordId);

    return diseaseRecord;
  }

  /**
   * Update disease record
   */
  async updateDiseaseRecord(id: string, updates: Partial<DiseaseRecord>): Promise<void> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    const record = await this.database.read<DiseaseRecord>('disease_records', id);
    if (!record) {
      throw new Error('Disease record not found');
    }

    await this.database.update('disease_records', id, {
      ...updates,
      updatedAt: new Date(),
    });

    await this.updateStatistics(record.hiveRecordId);
  }

  /**
   * Get active diseases
   */
  async getActiveDiseases(hiveRecordId: string): Promise<DiseaseRecord[]> {
    if (!this.database) {
      return [];
    }

    return await this.database.query<DiseaseRecord>('disease_records', {
      where: { hiveRecordId, status: 'active' },
      orderBy: { field: 'severity', direction: 'desc' },
    });
  }

  /**
   * Resolve disease
   */
  async resolveDisease(id: string, outcome: DiseaseRecord['outcome']): Promise<void> {
    await this.updateDiseaseRecord(id, {
      status: 'resolved',
      outcome,
      resolvedAt: new Date(),
    });
  }

  // ==================== Treatment History ====================

  /**
   * Get treatment history for a hive record
   */
  async getTreatmentHistory(hiveRecordId: string): Promise<TreatmentRecord[]> {
    if (!this.database) {
      return [];
    }

    return await this.database.query<TreatmentRecord>('treatment_records', {
      where: { hiveRecordId },
      orderBy: { field: 'appliedAt', direction: 'desc' },
    });
  }

  /**
   * Add treatment record
   */
  async addTreatmentRecord(record: Omit<TreatmentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TreatmentRecord> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    const now = new Date();
    const treatmentRecord: TreatmentRecord = {
      ...record,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    await this.database.create('treatment_records', treatmentRecord);
    await this.updateStatistics(record.hiveRecordId);

    return treatmentRecord;
  }

  /**
   * Update treatment record
   */
  async updateTreatmentRecord(id: string, updates: Partial<TreatmentRecord>): Promise<void> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    const record = await this.database.read<TreatmentRecord>('treatment_records', id);
    if (!record) {
      throw new Error('Treatment record not found');
    }

    await this.database.update('treatment_records', id, {
      ...updates,
      updatedAt: new Date(),
    });

    await this.updateStatistics(record.hiveRecordId);
  }

  // ==================== Inspection History ====================

  /**
   * Get inspection history for a hive record
   */
  async getInspectionHistory(hiveRecordId: string): Promise<InspectionRecord[]> {
    if (!this.database) {
      return [];
    }

    return await this.database.query<InspectionRecord>('inspection_records', {
      where: { hiveRecordId },
      orderBy: { field: 'inspectedAt', direction: 'desc' },
    });
  }

  /**
   * Add inspection record
   */
  async addInspectionRecord(record: Omit<InspectionRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<InspectionRecord> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    const now = new Date();
    const inspectionRecord: InspectionRecord = {
      ...record,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    await this.database.create('inspection_records', inspectionRecord);
    await this.updateStatistics(record.hiveRecordId);

    return inspectionRecord;
  }

  /**
   * Get last inspection
   */
  async getLastInspection(hiveRecordId: string): Promise<InspectionRecord | null> {
    const inspections = await this.getInspectionHistory(hiveRecordId);
    return inspections.length > 0 ? inspections[0] : null;
  }

  // ==================== Image Gallery ====================

  /**
   * Get images for a hive record
   */
  async getImages(hiveRecordId: string, context?: ImageRecord['context']): Promise<ImageRecord[]> {
    if (!this.database) {
      return [];
    }

    const filters: any = { hiveRecordId };
    if (context) {
      filters.context = context;
    }

    return await this.database.query<ImageRecord>('image_records', {
      where: filters,
      orderBy: { field: 'capturedAt', direction: 'desc' },
    });
  }

  /**
   * Add image record
   */
  async addImageRecord(record: Omit<ImageRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImageRecord> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    const now = new Date();
    const imageRecord: ImageRecord = {
      ...record,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    await this.database.create('image_records', imageRecord);
    await this.updateStatistics(record.hiveRecordId);

    return imageRecord;
  }

  /**
   * Delete image record
   */
  async deleteImageRecord(id: string): Promise<void> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    const record = await this.database.read<ImageRecord>('image_records', id);
    if (!record) {
      throw new Error('Image record not found');
    }

    await this.database.delete('image_records', id);
    await this.updateStatistics(record.hiveRecordId);
  }

  // ==================== Notes ====================

  /**
   * Get notes for a hive record
   */
  async getNotes(hiveRecordId: string, context?: NoteRecord['context']): Promise<NoteRecord[]> {
    if (!this.database) {
      return [];
    }

    const filters: any = { hiveRecordId };
    if (context) {
      filters.context = context;
    }

    return await this.database.query<NoteRecord>('note_records', {
      where: filters,
      orderBy: { field: 'createdAt', direction: 'desc' },
    });
  }

  /**
   * Add note record
   */
  async addNoteRecord(record: Omit<NoteRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<NoteRecord> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    const now = new Date();
    const noteRecord: NoteRecord = {
      ...record,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    await this.database.create('note_records', noteRecord);
    await this.updateStatistics(record.hiveRecordId);

    return noteRecord;
  }

  /**
   * Update note record
   */
  async updateNoteRecord(id: string, updates: Partial<NoteRecord>): Promise<void> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    await this.database.update('note_records', id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete note record
   */
  async deleteNoteRecord(id: string): Promise<void> {
    if (!this.database) {
      throw new Error('Database not configured');
    }

    const record = await this.database.read<NoteRecord>('note_records', id);
    if (!record) {
      throw new Error('Note record not found');
    }

    await this.database.delete('note_records', id);
    await this.updateStatistics(record.hiveRecordId);
  }

  // ==================== Statistics ====================

  /**
   * Calculate statistics for a hive record
   */
  async calculateStatistics(hiveRecordId: string): Promise<HiveStatistics> {
    const diseases = await this.getDiseaseHistory(hiveRecordId);
    const treatments = await this.getTreatmentHistory(hiveRecordId);
    const inspections = await this.getInspectionHistory(hiveRecordId);
    const images = await this.getImages(hiveRecordId);
    const notes = await this.getNotes(hiveRecordId);

    // Disease statistics
    const activeDiseases = diseases.filter(d => d.status === 'active' || d.status === 'treating');
    const resolvedDiseases = diseases.filter(d => d.status === 'resolved');
    
    // Find most common disease
    const diseaseCounts = new Map<string, number>();
    diseases.forEach(d => {
      const count = diseaseCounts.get(d.diseaseId) || 0;
      diseaseCounts.set(d.diseaseId, count + 1);
    });
    let mostCommonDisease: string | undefined;
    let maxCount = 0;
    diseaseCounts.forEach((count, diseaseId) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonDisease = diseaseId;
      }
    });

    // Treatment statistics
    const totalCost = treatments.reduce((sum, t) => sum + (t.cost?.amount || 0), 0);
    const treatmentsWithEffectiveness = treatments.filter(t => t.effectiveness?.rating);
    const averageTreatmentEffectiveness = treatmentsWithEffectiveness.length > 0
      ? treatmentsWithEffectiveness.reduce((sum, t) => sum + (t.effectiveness!.rating * 20), 0) / treatmentsWithEffectiveness.length
      : undefined;

    // Inspection statistics
    const lastInspection = inspections.length > 0 ? inspections[0] : undefined;
    const conditionValues: Record<HiveCondition, number> = {
      excellent: 5,
      good: 4,
      fair: 3,
      poor: 2,
      critical: 1,
    };
    const averageCondition = inspections.length > 0
      ? inspections.reduce((sum, i) => sum + conditionValues[i.condition], 0) / inspections.length
      : undefined;

    // Calculate inspection frequency (average days between inspections)
    let inspectionFrequency: number | undefined;
    if (inspections.length >= 2) {
      const intervals: number[] = [];
      for (let i = 0; i < inspections.length - 1; i++) {
        const days = Math.abs(
          (inspections[i].inspectedAt.getTime() - inspections[i + 1].inspectedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        intervals.push(days);
      }
      inspectionFrequency = intervals.reduce((sum, d) => sum + d, 0) / intervals.length;
    }

    // Calculate health score (0-100)
    let healthScore: number | undefined;
    if (inspections.length > 0) {
      const recentInspection = inspections[0];
      const conditionScore = conditionValues[recentInspection.condition] * 20;
      const diseaseScore = activeDiseases.length === 0 ? 100 : Math.max(0, 100 - activeDiseases.length * 20);
      healthScore = (conditionScore + diseaseScore) / 2;
    }

    // Calculate health trend
    let healthTrend: 'improving' | 'stable' | 'declining' | undefined;
    if (inspections.length >= 2) {
      const recent = conditionValues[inspections[0].condition];
      const previous = conditionValues[inspections[1].condition];
      if (recent > previous) {
        healthTrend = 'improving';
      } else if (recent < previous) {
        healthTrend = 'declining';
      } else {
        healthTrend = 'stable';
      }
    }

    return {
      totalDiseases: diseases.length,
      activeDiseases: activeDiseases.length,
      resolvedDiseases: resolvedDiseases.length,
      mostCommonDisease,
      totalTreatments: treatments.length,
      activeTreatments: treatments.filter(t => t.scheduleId).length,
      completedTreatments: treatments.filter(t => !t.scheduleId).length,
      totalCost,
      averageTreatmentEffectiveness,
      totalInspections: inspections.length,
      lastInspectionDate: lastInspection?.inspectedAt,
      averageCondition,
      inspectionFrequency,
      totalImages: images.length,
      totalNotes: notes.length,
      healthScore,
      healthTrend,
      lastUpdated: new Date(),
    };
  }

  /**
   * Update statistics for a hive record
   */
  private async updateStatistics(hiveRecordId: string): Promise<void> {
    if (!this.database) {
      return;
    }

    const statistics = await this.calculateStatistics(hiveRecordId);
    await this.database.update('hive_records', hiveRecordId, {
      statistics,
      updatedAt: new Date(),
    });
  }

  // ==================== Report Generation ====================

  /**
   * Generate report
   */
  async generateReport(hiveRecordId: string, options: ReportOptions, userId: string): Promise<ReportData> {
    const hiveRecord = await this.getHiveRecord(hiveRecordId);
    if (!hiveRecord) {
      throw new Error('Hive record not found');
    }

    // Apply date filters
    let diseases = hiveRecord.diseaseHistory;
    let treatments = hiveRecord.treatmentHistory;
    let inspections = hiveRecord.inspectionHistory;

    if (options.startDate || options.endDate) {
      if (options.startDate) {
        diseases = diseases.filter(d => d.diagnosedAt >= options.startDate!);
        treatments = treatments.filter(t => t.appliedAt >= options.startDate!);
        inspections = inspections.filter(i => i.inspectedAt >= options.startDate!);
      }
      if (options.endDate) {
        diseases = diseases.filter(d => d.diagnosedAt <= options.endDate!);
        treatments = treatments.filter(t => t.appliedAt <= options.endDate!);
        inspections = inspections.filter(i => i.inspectedAt <= options.endDate!);
      }
    }

    // Apply ID filters
    if (options.diseaseIds && options.diseaseIds.length > 0) {
      diseases = diseases.filter(d => options.diseaseIds!.includes(d.diseaseId));
    }
    if (options.treatmentIds && options.treatmentIds.length > 0) {
      treatments = treatments.filter(t => options.treatmentIds!.includes(t.treatmentId));
    }

    // Calculate summary
    const summary = {
      period: this.formatPeriod(options),
      totalDiseases: diseases.length,
      totalTreatments: treatments.length,
      totalInspections: inspections.length,
      healthScore: hiveRecord.statistics.healthScore,
    };

    // Build report data
    const reportData: ReportData = {
      hiveRecord,
      options,
      generatedAt: new Date(),
      generatedBy: userId,
      summary,
    };

    // Include optional sections
    if (options.includeDiseases !== false) {
      reportData.diseases = diseases;
    }
    if (options.includeTreatments !== false) {
      reportData.treatments = treatments;
    }
    if (options.includeInspections !== false) {
      reportData.inspections = inspections;
    }
    if (options.includeImages) {
      reportData.images = hiveRecord.images;
    }
    if (options.includeNotes) {
      reportData.notes = hiveRecord.notes;
    }
    if (options.includeStatistics !== false) {
      reportData.statistics = hiveRecord.statistics;
    }

    return reportData;
  }

  /**
   * Export report to specified format
   */
  async exportReport(reportData: ReportData): Promise<string> {
    switch (reportData.options.format) {
      case 'json':
        return JSON.stringify(reportData, null, 2);
      
      case 'csv':
        return this.exportToCSV(reportData);
      
      case 'pdf':
        throw new Error('PDF export not yet implemented');
      
      default:
        throw new Error(`Unsupported format: ${reportData.options.format}`);
    }
  }

  /**
   * Export report to CSV format
   */
  private exportToCSV(reportData: ReportData): string {
    const lines: string[] = [];
    
    // Header
    lines.push('Hive Record Report');
    lines.push(`Generated: ${reportData.generatedAt.toISOString()}`);
    lines.push(`Period: ${reportData.summary.period}`);
    lines.push('');

    // Summary
    lines.push('Summary');
    lines.push(`Total Diseases,${reportData.summary.totalDiseases}`);
    lines.push(`Total Treatments,${reportData.summary.totalTreatments}`);
    lines.push(`Total Inspections,${reportData.summary.totalInspections}`);
    if (reportData.summary.healthScore !== undefined) {
      lines.push(`Health Score,${reportData.summary.healthScore.toFixed(1)}`);
    }
    lines.push('');

    // Diseases
    if (reportData.diseases && reportData.diseases.length > 0) {
      lines.push('Diseases');
      lines.push('Date,Disease ID,Severity,Status');
      reportData.diseases.forEach(d => {
        lines.push(`${d.diagnosedAt.toISOString()},${d.diseaseId},${d.severity},${d.status}`);
      });
      lines.push('');
    }

    // Treatments
    if (reportData.treatments && reportData.treatments.length > 0) {
      lines.push('Treatments');
      lines.push('Date,Treatment ID,Dosage,Cost');
      reportData.treatments.forEach(t => {
        const cost = t.cost ? `${t.cost.amount} ${t.cost.currency}` : 'N/A';
        lines.push(`${t.appliedAt.toISOString()},${t.treatmentId},${t.dosage},${cost}`);
      });
      lines.push('');
    }

    // Inspections
    if (reportData.inspections && reportData.inspections.length > 0) {
      lines.push('Inspections');
      lines.push('Date,Condition,Duration');
      reportData.inspections.forEach(i => {
        lines.push(`${i.inspectedAt.toISOString()},${i.condition},${i.duration || 'N/A'}`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format period for report
   */
  private formatPeriod(options: ReportOptions): string {
    if (options.startDate && options.endDate) {
      return `${options.startDate.toLocaleDateString()} - ${options.endDate.toLocaleDateString()}`;
    } else if (options.startDate) {
      return `From ${options.startDate.toLocaleDateString()}`;
    } else if (options.endDate) {
      return `Until ${options.endDate.toLocaleDateString()}`;
    } else {
      return 'All time';
    }
  }

  // ==================== Search and Filter ====================

  /**
   * Search hive records
   */
  async searchRecords(hiveRecordId: string, filters: HiveRecordSearchFilters): Promise<{
    diseases: DiseaseRecord[];
    treatments: TreatmentRecord[];
    inspections: InspectionRecord[];
    images: ImageRecord[];
    notes: NoteRecord[];
  }> {
    let diseases = await this.getDiseaseHistory(hiveRecordId);
    let treatments = await this.getTreatmentHistory(hiveRecordId);
    let inspections = await this.getInspectionHistory(hiveRecordId);
    let images = await this.getImages(hiveRecordId);
    let notes = await this.getNotes(hiveRecordId);

    // Apply date filters
    if (filters.startDate) {
      diseases = diseases.filter(d => d.diagnosedAt >= filters.startDate!);
      treatments = treatments.filter(t => t.appliedAt >= filters.startDate!);
      inspections = inspections.filter(i => i.inspectedAt >= filters.startDate!);
      images = images.filter(img => img.capturedAt >= filters.startDate!);
      notes = notes.filter(n => n.createdAt >= filters.startDate!);
    }
    if (filters.endDate) {
      diseases = diseases.filter(d => d.diagnosedAt <= filters.endDate!);
      treatments = treatments.filter(t => t.appliedAt <= filters.endDate!);
      inspections = inspections.filter(i => i.inspectedAt <= filters.endDate!);
      images = images.filter(img => img.capturedAt <= filters.endDate!);
      notes = notes.filter(n => n.createdAt <= filters.endDate!);
    }

    // Apply disease filters
    if (filters.diseaseIds && filters.diseaseIds.length > 0) {
      diseases = diseases.filter(d => filters.diseaseIds!.includes(d.diseaseId));
    }
    if (filters.diseaseStatus && filters.diseaseStatus.length > 0) {
      diseases = diseases.filter(d => filters.diseaseStatus!.includes(d.status));
    }
    if (filters.diseaseSeverity && filters.diseaseSeverity.length > 0) {
      diseases = diseases.filter(d => filters.diseaseSeverity!.includes(d.severity));
    }

    // Apply treatment filters
    if (filters.treatmentIds && filters.treatmentIds.length > 0) {
      treatments = treatments.filter(t => filters.treatmentIds!.includes(t.treatmentId));
    }

    // Apply inspection filters
    if (filters.condition && filters.condition.length > 0) {
      inspections = inspections.filter(i => filters.condition!.includes(i.condition));
    }

    // Apply context filters
    if (filters.hasImages !== undefined) {
      if (filters.hasImages) {
        diseases = diseases.filter(d => d.imageIds.length > 0);
        treatments = treatments.filter(t => t.imageIds.length > 0);
        inspections = inspections.filter(i => i.imageIds.length > 0);
      }
    }
    if (filters.hasNotes !== undefined) {
      if (filters.hasNotes) {
        diseases = diseases.filter(d => d.notes && d.notes.length > 0);
        treatments = treatments.filter(t => t.notes && t.notes.length > 0);
        inspections = inspections.filter(i => i.notes && i.notes.length > 0);
      }
    }

    // Apply text search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      diseases = diseases.filter(d => 
        d.notes?.toLowerCase().includes(searchLower) ||
        d.symptoms.some(s => s.toLowerCase().includes(searchLower))
      );
      treatments = treatments.filter(t => 
        t.notes?.toLowerCase().includes(searchLower) ||
        t.dosage.toLowerCase().includes(searchLower)
      );
      inspections = inspections.filter(i => 
        i.notes?.toLowerCase().includes(searchLower)
      );
      notes = notes.filter(n => 
        n.content.toLowerCase().includes(searchLower)
      );
    }

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      images = images.filter(img => 
        filters.tags!.some(tag => img.tags.includes(tag))
      );
      notes = notes.filter(n => 
        filters.tags!.some(tag => n.tags.includes(tag))
      );
    }

    return {
      diseases,
      treatments,
      inspections,
      images,
      notes,
    };
  }

  // ==================== Utility Methods ====================

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
