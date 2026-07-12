import prisma from '../config/prisma';
import type { ActionPriority, AlertStatus } from '@prisma/client';

export type AlertPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertType = string;
export type AlertFilters = {
  status?: AlertStatus;
  priority?: AlertPriority;
  alertType?: AlertType;
  apiaryId?: string;
  hiveId?: string;
  userId?: string;
};

const priorityMap: Record<AlertPriority, ActionPriority> = {
  HIGH: 'IMMEDIATE',
  MEDIUM: 'URGENT',
  LOW: 'SOON',
};

const reversePriorityMap: Record<string, AlertPriority> = {
  IMMEDIATE: 'HIGH',
  URGENT: 'MEDIUM',
  SOON: 'LOW',
  ROUTINE: 'LOW',
};

export class AlertService {
  async getAlerts(userId: string, filters?: AlertFilters) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.alertType) where.alertType = filters.alertType;
    if (filters?.apiaryId) where.apiaryId = filters.apiaryId;
    if (filters?.hiveId) where.hiveId = filters.hiveId;

    if (filters?.priority) {
      where.priority = priorityMap[filters.priority];
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    } else {
      where.OR = [
        { userId },
        { apiary: { members: { some: { userId, status: 'ACTIVE' } } } },
        { apiary: { ownerId: userId } },
      ];
    }

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        apiary: { select: { id: true, name: true } },
        hive: { select: { id: true, hiveNumber: true } },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return alerts.map(a => ({
      id: a.id,
      type: a.alertType,
      priority: reversePriorityMap[a.priority] || 'LOW',
      title: a.title,
      message: a.message,
      apiaryId: a.apiaryId,
      apiaryName: a.apiary?.name,
      hiveId: a.hiveId,
      hiveName: a.hive?.hiveNumber ? `خلية #${a.hive.hiveNumber}` : undefined,
      status: a.status,
      actionRequired: a.actionRequired,
      actionUrl: a.actionUrl,
      actionDeadline: a.actionDeadline,
      createdAt: a.createdAt.toISOString(),
      acknowledgedAt: a.acknowledgedAt?.toISOString(),
      expiresAt: a.expiresAt?.toISOString(),
    }));
  }

  async getAlertStats(userId: string, apiaryId?: string) {
    const where: any = {};
    if (apiaryId) where.apiaryId = apiaryId;
    where.OR = [
      { userId },
      { apiary: { members: { some: { userId, status: 'ACTIVE' } } } },
      { apiary: { ownerId: userId } },
    ];

    const alerts = await prisma.alert.findMany({ where, select: { priority: true, status: true, alertType: true } });

    const byPriority: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    const byType: Record<string, number> = {};
    let active = 0, resolved = 0, acknowledged = 0, dismissed = 0;

    for (const a of alerts) {
      const p = reversePriorityMap[a.priority] || 'LOW';
      byPriority[p] = (byPriority[p] || 0) + 1;
      byType[a.alertType] = (byType[a.alertType] || 0) + 1;
      if (a.status === 'ACTIVE') active++;
      else if (a.status === 'RESOLVED') resolved++;
      else if (a.status === 'ACKNOWLEDGED') acknowledged++;
      else if (a.status === 'DISMISSED') dismissed++;
    }

    return {
      total: alerts.length,
      byPriority,
      byType,
      active,
      resolved,
      acknowledged,
      dismissed,
    };
  }

  async getAlertById(id: string, _userId: string) {
    const alert = await prisma.alert.findFirst({
      where: { id },
      include: {
        apiary: { select: { id: true, name: true } },
        hive: { select: { id: true, hiveNumber: true } },
        user: { select: { id: true, fullName: true } },
      },
    });

    if (!alert) throw new Error('التنبيه غير موجود');

    return {
      ...alert,
      priority: reversePriorityMap[alert.priority] || 'LOW',
    };
  }

  async createAlert(data: {
    userId?: string;
    apiaryId?: string;
    hiveId?: string;
    alertType: string;
    priority: AlertPriority;
    title: string;
    message: string;
    actionRequired?: boolean;
    actionUrl?: string;
    actionDeadline?: string;
    expiresAt?: string;
  }) {
    const alert = await prisma.alert.create({
      data: {
        userId: data.userId,
        apiaryId: data.apiaryId,
        hiveId: data.hiveId,
        alertType: data.alertType,
        priority: priorityMap[data.priority],
        title: data.title,
        message: data.message,
        actionRequired: data.actionRequired ?? false,
        actionUrl: data.actionUrl,
        actionDeadline: data.actionDeadline ? new Date(data.actionDeadline) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
      include: {
        apiary: { select: { id: true, name: true } },
        hive: { select: { id: true, hiveNumber: true } },
      },
    });

    return {
      id: alert.id,
      type: alert.alertType,
      priority: reversePriorityMap[alert.priority] || 'LOW',
      title: alert.title,
      message: alert.message,
      apiaryId: alert.apiaryId,
      apiaryName: alert.apiary?.name,
      hiveId: alert.hiveId,
      hiveName: alert.hive?.hiveNumber ? `خلية #${alert.hive.hiveNumber}` : undefined,
      status: alert.status,
      actionRequired: alert.actionRequired,
      actionUrl: alert.actionUrl,
      createdAt: alert.createdAt.toISOString(),
    };
  }

  async updateAlertStatus(id: string, status: AlertStatus, userId?: string) {
    const data: any = { status };
    if (status === 'ACKNOWLEDGED') {
      data.acknowledgedAt = new Date();
      data.acknowledgedBy = userId;
    }
    if (status === 'RESOLVED') {
      data.resolvedAt = new Date();
    }

    const alert = await prisma.alert.update({
      where: { id },
      data,
    });

    return { id: alert.id, status: alert.status };
  }

  async deleteAlert(id: string) {
    await prisma.alert.delete({ where: { id } });
    return { success: true };
  }

  async dismissAll(userId: string, apiaryId?: string) {
    const where: any = { status: 'ACTIVE' };
    if (apiaryId) where.apiaryId = apiaryId;
    where.OR = [
      { userId },
      { apiary: { members: { some: { userId, status: 'ACTIVE' } } } },
      { apiary: { ownerId: userId } },
    ];

    const result = await prisma.alert.updateMany({
      where,
      data: { status: 'DISMISSED' },
    });

    return { dismissedCount: result.count };
  }
}
