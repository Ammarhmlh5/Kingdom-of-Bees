import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class NotificationService {
    // Get all notifications for user
    async getAll(userId: string, filters?: {
        read?: boolean;
        type?: string;
        limit?: number;
    }) {
        const where: any = {
            userId,
        };

        if (filters?.read !== undefined) {
            where.read = filters.read;
        }

        if (filters?.type) {
            where.type = filters.type;
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            take: filters?.limit || 50,
        });

        return notifications;
    }

    // Get notification by ID
    async getById(id: string, userId: string) {
        const notification = await prisma.notification.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!notification) {
            throw new AppError('Notification not found', 404);
        }

        return notification;
    }

    // Mark notification as read
    async markAsRead(id: string, userId: string) {
        // Check ownership
        await this.getById(id, userId);

        return prisma.notification.update({
            where: { id },
            data: {
                read: true,
                readAt: new Date(),
            },
        });
    }

    // Mark all notifications as read
    async markAllAsRead(userId: string) {
        await prisma.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: {
                read: true,
                readAt: new Date(),
            },
        });

        return { message: 'All notifications marked as read' };
    }

    // Delete notification
    async delete(id: string, userId: string) {
        // Check ownership
        await this.getById(id, userId);

        await prisma.notification.delete({
            where: { id },
        });
    }

    // Delete all read notifications
    async deleteAllRead(userId: string) {
        await prisma.notification.deleteMany({
            where: {
                userId,
                read: true,
            },
        });

        return { message: 'All read notifications deleted' };
    }

    // Get notification settings
    async getSettings(userId: string) {
        let settings = await prisma.userNotificationSettings.findUnique({
            where: { userId },
        });

        // Create default settings if not exists
        if (!settings) {
            settings = await prisma.userNotificationSettings.create({
                data: {
                    userId,
                    pushEnabled: true,
                    emailEnabled: true,
                    smsEnabled: false,
                    inspectionReminders: true,
                    feedingReminders: true,
                    harvestReminders: true,
                    diseaseAlerts: true,
                    swarmAlerts: true,
                    weatherAlerts: true,
                },
            });
        }

        return settings;
    }

    // Update notification settings
    async updateSettings(userId: string, data: {
        pushEnabled?: boolean;
        emailEnabled?: boolean;
        smsEnabled?: boolean;
        inspectionReminders?: boolean;
        feedingReminders?: boolean;
        harvestReminders?: boolean;
        diseaseAlerts?: boolean;
        swarmAlerts?: boolean;
        weatherAlerts?: boolean;
        quietHoursStart?: string;
        quietHoursEnd?: string;
    }) {
        // Get or create settings
        await this.getSettings(userId);

        return prisma.userNotificationSettings.update({
            where: { userId },
            data: data as any,
        });
    }

    // Get unread count
    async getUnreadCount(userId: string) {
        const count = await prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });

        return { count };
    }

    // Create notification (internal use)
    async create(data: {
        userId: string;
        title: string;
        message: string;
        type: string;
        category: string;
        data?: any;
        actionUrl?: string;
        actionLabel?: string;
    }) {
        return prisma.notification.create({
            data: data as any,
        });
    }

    // Send notification (checks settings and creates)
    async send(data: {
        userId: string;
        title: string;
        message: string;
        type: 'INFO' | 'WARNING' | 'CRITICAL' | 'REMINDER' | 'ALERT';
        category: string;
        data?: any;
        actionUrl?: string;
        actionLabel?: string;
    }) {
        // Get user settings
        const settings = await this.getSettings(data.userId);

        // Check if notification type is enabled
        const categoryMap: any = {
            inspection: settings.inspectionReminders,
            feeding: settings.feedingReminders,
            harvest: settings.harvestReminders,
            disease: settings.diseaseAlerts,
            swarm: settings.swarmAlerts,
            weather: settings.weatherAlerts,
        };

        if (categoryMap[data.category] === false) {
            return null; // Don't send if disabled
        }

        // Check quiet hours
        if (settings.quietHoursStart && settings.quietHoursEnd) {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            if (currentTime >= settings.quietHoursStart && currentTime <= settings.quietHoursEnd) {
                return null; // Don't send during quiet hours
            }
        }

        // Create notification
        const notification = await this.create(data);

        // TODO: Send push notification if enabled
        // TODO: Send email if enabled
        // TODO: Send SMS if enabled

        return notification;
    }
}

export const notificationService = new NotificationService();
