import prisma from '../config/prisma';
import * as cron from 'node-cron';
import { logger } from '../utils/logger';

function log(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
  const entry = `[${new Date().toISOString()}] [${level}] [Cron:Inspection] ${message}`;
  logger.info(entry);
  if (data) {
    if (data instanceof Error) {
      logger.info(data.stack || data.message);
      if ((data as any).code) logger.info(`Code: ${(data as any).code}`);
      if ((data as any).meta) logger.info(`Meta: ${JSON.stringify((data as any).meta)}`);
    } else {
      logger.info(JSON.stringify(data, null, 2));
    }
  }
}

async function sendReminders() {
  log('INFO', 'بدء إرسال تنبيهات الفحوصات القادمة');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  try {
    const upcoming = await prisma.inspectionSchedule.findMany({
      where: {
        status: 'PENDING' as any,
        scheduledDate: {
          gte: tomorrow,
          lt: dayAfter
        }
      },
      include: {
        hive: { select: { hiveNumber: true, name: true } },
        setting: { select: { nameAr: true } }
      }
    });

    for (const schedule of upcoming) {
      try {
        log('INFO', `إرسال تذكير: فحص ${schedule.setting.nameAr} للخلية ${schedule.hive.hiveNumber} غداً`);
        await prisma.inspectionSchedule.update({
          where: { id: schedule.id },
          data: {}
        });
      } catch (error) {
        log('ERROR', `فشل إرسال تذكير للجدول ${schedule.id}`, error);
      }
    }

    log('INFO', `تم إرسال ${upcoming.length} تذكير`);
  } catch (error) {
    log('ERROR', 'فشل في جلب الفحوصات القادمة', error);
    throw error;
  }
}

async function checkOverdue() {
  log('INFO', 'بدء فحص الجداول المتأخرة');

  const now = new Date();

  try {
    const overdue = await prisma.inspectionSchedule.findMany({
      where: {
        status: 'PENDING' as any,
        scheduledDate: { lt: now }
      },
      include: {
        hive: { select: { hiveNumber: true, name: true } },
        setting: { select: { nameAr: true } }
      }
    });

    for (const schedule of overdue) {
      const daysOverdue = Math.floor((now.getTime() - new Date(schedule.scheduledDate).getTime()) / (1000 * 60 * 60 * 24));
      try {
        log('WARN', `فحص متأخر: ${schedule.setting.nameAr} للخلية ${schedule.hive.hiveNumber} - متأخر ${daysOverdue} أيام`);
        await prisma.inspectionSchedule.update({
          where: { id: schedule.id },
          data: { status: 'OVERDUE' as any }
        });
      } catch (error) {
        log('ERROR', `فشل تحديث حالة الجدول ${schedule.id}`, error);
      }
    }

    log('INFO', `تم فحص ${overdue.length} جدول متأخر`);
  } catch (error) {
    log('ERROR', 'فشل في جلب الفحوصات المتأخرة', error);
    throw error;
  }
}

async function generateWeeklyReport() {
  log('INFO', 'بدء إنشاء التقرير الأسبوعي');

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const total = await prisma.inspectionSchedule.count();
  const completed = await prisma.inspectionSchedule.count({ where: { status: 'COMPLETED' as any } });
  const pending = await prisma.inspectionSchedule.count({ where: { status: 'PENDING' as any } });
  const overdue = await prisma.inspectionSchedule.count({ where: { status: 'OVERDUE' as any } });
  const weeklyCompleted = await prisma.inspectionSchedule.count({
    where: {
      status: 'COMPLETED' as any,
      completedAt: { gte: weekAgo }
    }
  });

  log('INFO', 'التقرير الأسبوعي للفحوصات', {
    total,
    completed,
    pending,
    overdue,
    weeklyCompleted,
    weekStart: weekAgo.toISOString().split('T')[0],
    weekEnd: now.toISOString().split('T')[0]
  });
}

export function startInspectionCronJobs() {
  log('INFO', 'بدء تشغيل المهام المجدولة للفحوصات');

  cron.schedule('0 8 * * *', () => {
    sendReminders().catch(e => log('ERROR', 'فشل في مهمة التنبيهات', e));
  });

  cron.schedule('0 9 * * *', () => {
    checkOverdue().catch(e => log('ERROR', 'فشل في مهمة المتأخرات', e));
  });

  cron.schedule('0 10 * * 1', () => {
    generateWeeklyReport().catch(e => log('ERROR', 'فشل في التقرير الأسبوعي', e));
  });

  sendReminders().catch(e => log('ERROR', 'فشل في التنبيهات عند بدء التشغيل', e));
  checkOverdue().catch(e => log('ERROR', 'فشل في فحص المتأخرات عند بدء التشغيل', e));

  log('INFO', 'تم تسجيل المهام المجدولة بنجاح');
}
