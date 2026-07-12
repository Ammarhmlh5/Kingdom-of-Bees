import prisma from '../config/prisma';

export interface OperationFilters {
  apiaryId?: string;
  startDate?: Date;
  endDate?: Date;
  operationType?: string;
  performedBy?: string;
}

export interface OperationStats {
  totalOperations: number;
  operationsByType: Record<string, number>;
  operationsByWorker: Record<string, number>;
  mostActiveWorker: {
    id: string;
    name: string;
    count: number;
  };
  mostCommonOperation: {
    type: string;
    count: number;
  };
}

export class OperationsService {
  /**
   * Get daily operations with filters
   */
  async getDailyOperations(filters: OperationFilters) {
    const where: any = {};

    if (filters.apiaryId) where.apiaryId = filters.apiaryId;
    if (filters.operationType) where.operationType = filters.operationType;
    if (filters.performedBy) where.performedBy = filters.performedBy;

    if (filters.startDate || filters.endDate) {
      where.operationDate = {};
      if (filters.startDate) where.operationDate.gte = filters.startDate;
      if (filters.endDate) where.operationDate.lte = filters.endDate;
    }

    const operations = await prisma.apiaryOperation.findMany({
      where,
      include: {
        hive: {
          select: {
            hiveNumber: true,
            name: true
          }
        },
        apiary: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        operationDate: 'desc'
      }
    });

    // Format operations with readable data
    return operations.map(op => ({
      id: op.id,
      operationType: op.operationType,
      operationDate: op.operationDate,
      apiaryName: op.apiary.name,
      hiveNumber: op.hive?.hiveNumber,
      hiveName: op.hive?.name,
      operationData: this.formatOperationData(op.operationType, op.data as any),
      performedBy: op.performedBy,
      notes: (op.data as any)?.notes || op.description,
      createdAt: op.createdAt
    }));
  }

  /**
   * Get operation statistics
   */
  async getOperationStats(filters: OperationFilters): Promise<OperationStats> {
    const where: any = {};

    if (filters.apiaryId) where.apiaryId = filters.apiaryId;
    if (filters.startDate || filters.endDate) {
      where.operationDate = {};
      if (filters.startDate) where.operationDate.gte = filters.startDate;
      if (filters.endDate) where.operationDate.lte = filters.endDate;
    }

    const operations = await prisma.apiaryOperation.findMany({ where });

    // Calculate statistics
    const operationsByType: Record<string, number> = {};
    const operationsByWorker: Record<string, number> = {};

    for (const op of operations) {
      // By type
      operationsByType[op.operationType] = (operationsByType[op.operationType] || 0) + 1;

      // By worker
      const workerId = op.performedBy || 'unknown';
      operationsByWorker[workerId] = (operationsByWorker[workerId] || 0) + 1;
    }

    // Find most active worker
    const mostActiveWorkerId = Object.keys(operationsByWorker).reduce((a, b) =>
      operationsByWorker[a] > operationsByWorker[b] ? a : b
    , '');

    // Find most common operation
    const mostCommonOperationType = Object.keys(operationsByType).reduce((a, b) =>
      operationsByType[a] > operationsByType[b] ? a : b
    , '');

    return {
      totalOperations: operations.length,
      operationsByType,
      operationsByWorker,
      mostActiveWorker: {
        id: mostActiveWorkerId,
        name: 'Worker Name', // TODO: Fetch from user profile
        count: operationsByWorker[mostActiveWorkerId] || 0
      },
      mostCommonOperation: {
        type: mostCommonOperationType,
        count: operationsByType[mostCommonOperationType] || 0
      }
    };
  }

  /**
   * Delete operation (rollback)
   */
  async deleteOperation(operationId: string, userId: string) {
    const operation = await prisma.apiaryOperation.findUnique({
      where: { id: operationId }
    });

    if (!operation) {
      throw new Error('Operation not found');
    }

    // Check if user has permission (owner or performer)
    // TODO: Add proper authorization check

    // Delete the operation
    await prisma.apiaryOperation.delete({
      where: { id: operationId }
    });

    // Log the deletion
    await prisma.apiaryOperation.create({
      data: {
        apiaryId: operation.apiaryId,
        operationType: 'TREATMENT', 
        operationDate: new Date(),
        description: `تم حذف عملية: ${operation.operationType}`,
        data: {
          deletedOperationId: operationId,
          deletedOperationType: operation.operationType,
          reason: 'User rollback'
        },
        performedBy: userId,
      }
    });

    return {
      success: true,
      message: 'تم حذف العملية بنجاح',
      deletedOperation: operation
    };
  }

  /**
   * Format operation data for display
   */
  private formatOperationData(type: string, data: any): any {
    const formatters: Record<string, (data: any) => any> = {
      FRAME_TRANSFER: (d) => ({
        description: `نقل ${d.count} إطار`,
        details: `من الخلية ${d.sourceHiveNumber || 'غير محدد'} إلى الخلية ${d.targetHiveNumber || 'غير محدد'}`
      }),
      FOUNDATION_ADD: (d) => ({
        description: `إضافة ${d.count} شمع أساس`,
        details: `تم إضافة شمع أساس جديد`
      }),
      QUEEN_REPLACE: (d) => ({
        description: 'إحلال ملكة',
        details: `استبدال الملكة ${d.oldQueenId ? 'القديمة' : ''} بملكة جديدة`
      }),
      SPLIT: (d) => ({
        description: 'تقسيم خلية',
        details: `تم إنشاء خلية جديدة رقم ${d.newHiveNumber} بنقل ${d.framesMoved} إطار`
      }),
      MERGE: (d) => ({
        description: 'دمج خلايا',
        details: `تم الدمج بطريقة ${d.method === 'NEWSPAPER' ? 'الجريدة' : d.method}`
      }),
      ADD_SUPER: (d) => ({
        description: 'إضافة عاسلة',
        details: `إضافة طابق رقم ${d.superNumber} بـ ${d.framesInSuper} إطار`
      }),
      INSPECTION: (d) => ({
        description: 'فحص خلية',
        details: `فحص روتيني - ${d.queenSeen ? 'تم رؤية الملكة' : 'لم يتم رؤية الملكة'}`
      }),
      FEEDING: (d) => {
        const typeLabels: Record<string, string> = {
          SUGAR_SYRUP: 'شراب سكر',
          PROTEIN: 'بروتين',
          POLLEN_SUBSTITUTE: 'بديل حبوب لقاح',
          FONDANT: 'فوندان',
          MEDICINAL: 'دوائي',
          SUPPLEMENT: 'مكمل غذائي',
          OTHER: 'آخر'
        };
        const rawType = d.contentType || d.feedType || 'غير محدد';
        const typeLabel = typeLabels[rawType] || rawType;
        const qty = d.quantityKg || d.amount || d.quantityPerHive || 0;
        const unit = d.unit || 'كجم';
        return {
          description: 'تغذية',
          details: `تغذية بـ ${typeLabel} - كمية ${qty} ${unit}`
        };
      },
      TREATMENT: (d) => {
        if (d.diseaseId) {
          return {
            description: 'تسجيل مرض',
            details: `تم تسجيل تفشي مرض - خلايا مصابة: ${d.totalAffectedHives || 1}`
          };
        }
        if (d.queenId) {
          return {
            description: 'إدخال ملكة',
            details: `إدخال ملكة جديدة (مصدر: ${d.source || 'غير محدد'})`
          };
        }
        if (d.financialRecordId) {
          const isRevenue = d.type === 'REVENUE';
          return {
            description: isRevenue ? 'إيرادات' : 'مصروفات',
            details: `${d.category} - مبلغ: ${d.amount} SAR`
          };
        }
        if (d.deletedOperationType) {
          return {
            description: 'حذف عملية',
            details: `تم التراجع عن عملية ${d.deletedOperationType}`
          };
        }
        return {
          description: 'علاج',
          details: `علاج ${d.disease || 'غير محدد'} بـ ${d.medicine || 'غير محدد'}`
        };
      },
      HARVEST: (d) => ({
        description: 'قطف عسل',
        details: `حصاد عسل بكمية ${d.quantityKg || 0} كجم`
      })
    };

    const formatter = formatters[type];
    return formatter ? formatter(data) : { description: type, details: JSON.stringify(data) };
  }

  /**
   * Get operation type label in Arabic
   */
  getOperationTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      FRAME_TRANSFER: 'نقل إطار',
      FOUNDATION_ADD: 'إضافة شمع أساس',
      QUEEN_REPLACE: 'إحلال ملكة',
      SPLIT: 'تقسيم خلية',
      MERGE: 'دمج خلايا',
      ADD_SUPER: 'إضافة عاسلة',
      INSPECTION: 'فحص',
      FEEDING: 'تغذية',
      TREATMENT: 'علاج',
      HARVEST: 'قطف عسل',
      OPERATION_DELETED: 'حذف عملية'
    };

    return labels[type] || type;
  }
}

export const operationsService = new OperationsService();
