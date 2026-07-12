import prisma from '../config/prisma';

export class NotificationSettingsService {
  async getSettings(userId: string) {
    let settings = await prisma.userNotificationSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userNotificationSettings.create({
        data: { userId },
      });
    }

    return {
      channels: {
        push: settings.pushEnabled,
        email: settings.emailEnabled,
        sms: settings.smsEnabled,
      },
      types: {
        inspectionReminders: settings.inspectionReminders,
        feedingReminders: settings.feedingReminders,
        harvestReminders: settings.harvestReminders,
        diseaseAlerts: settings.diseaseAlerts,
        swarmAlerts: settings.swarmAlerts,
        weatherAlerts: settings.weatherAlerts,
      },
      quietHours: {
        enabled: !!(settings.quietHoursStart && settings.quietHoursEnd),
        start: settings.quietHoursStart
          ? `${String(settings.quietHoursStart.getHours()).padStart(2, '0')}:${String(settings.quietHoursStart.getMinutes()).padStart(2, '0')}`
          : '22:00',
        end: settings.quietHoursEnd
          ? `${String(settings.quietHoursEnd.getHours()).padStart(2, '0')}:${String(settings.quietHoursEnd.getMinutes()).padStart(2, '0')}`
          : '07:00',
      },
    };
  }

  async updateSettings(userId: string, data: {
    channels?: { push?: boolean; email?: boolean; sms?: boolean };
    types?: {
      inspectionReminders?: boolean;
      feedingReminders?: boolean;
      harvestReminders?: boolean;
      diseaseAlerts?: boolean;
      swarmAlerts?: boolean;
      weatherAlerts?: boolean;
    };
    quietHours?: { enabled: boolean; start: string; end: string };
  }) {
    const updateData: any = {};

    if (data.channels) {
      if (data.channels.push !== undefined) updateData.pushEnabled = data.channels.push;
      if (data.channels.email !== undefined) updateData.emailEnabled = data.channels.email;
      if (data.channels.sms !== undefined) updateData.smsEnabled = data.channels.sms;
    }

    if (data.types) {
      if (data.types.inspectionReminders !== undefined) updateData.inspectionReminders = data.types.inspectionReminders;
      if (data.types.feedingReminders !== undefined) updateData.feedingReminders = data.types.feedingReminders;
      if (data.types.harvestReminders !== undefined) updateData.harvestReminders = data.types.harvestReminders;
      if (data.types.diseaseAlerts !== undefined) updateData.diseaseAlerts = data.types.diseaseAlerts;
      if (data.types.swarmAlerts !== undefined) updateData.swarmAlerts = data.types.swarmAlerts;
      if (data.types.weatherAlerts !== undefined) updateData.weatherAlerts = data.types.weatherAlerts;
    }

    if (data.quietHours) {
      if (data.quietHours.enabled) {
        const [startH, startM] = data.quietHours.start.split(':').map(Number);
        const [endH, endM] = data.quietHours.end.split(':').map(Number);
        const now = new Date();
        updateData.quietHoursStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM);
        updateData.quietHoursEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM);
      } else {
        updateData.quietHoursStart = null;
        updateData.quietHoursEnd = null;
      }
    }

    await prisma.userNotificationSettings.upsert({
      where: { userId },
      create: { userId, ...updateData },
      update: updateData,
    });

    return this.getSettings(userId);
  }

  async getTypeConfigs(userId: string) {
    const settings = await this.getSettings(userId);
    const types = [
      { type: 'SWARM_RISK', label: 'خطر تطريد', enabled: settings.types.swarmAlerts, defaultPriority: 'HIGH' as const },
      { type: 'NO_EGGS', label: 'غياب البيض', enabled: true, defaultPriority: 'HIGH' as const },
      { type: 'LOW_HONEY', label: 'نقص العسل', enabled: true, defaultPriority: 'MEDIUM' as const },
      { type: 'IRREGULAR_BROOD', label: 'حضنة غير منتظمة', enabled: true, defaultPriority: 'MEDIUM' as const },
      { type: 'FEEDING_NEEDED', label: 'تغذية مطلوبة', enabled: settings.types.feedingReminders, defaultPriority: 'HIGH' as const },
      { type: 'INSPECTION_DUE', label: 'فحص دوري', enabled: settings.types.inspectionReminders, defaultPriority: 'LOW' as const },
      { type: 'QUEEN_ISSUE', label: 'مشكلة ملكة', enabled: true, defaultPriority: 'HIGH' as const },
      { type: 'DISEASE', label: 'مرض', enabled: settings.types.diseaseAlerts, defaultPriority: 'HIGH' as const },
      { type: 'WEATHER', label: 'تحذير جوي', enabled: settings.types.weatherAlerts, defaultPriority: 'MEDIUM' as const },
      { type: 'OTHER', label: 'أخرى', enabled: true, defaultPriority: 'LOW' as const },
    ];

    return types.map(t => ({
      ...t,
      channels: settings.channels,
      quietHoursBypass: t.defaultPriority === 'HIGH',
    }));
  }
}
