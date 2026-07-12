
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function calculateHiveAssessments() {
  console.log('--- جاري حساب تقييمات الخلايا ---');

  try {
    // 1. جلب جميع الخلايا النشطة مع الإطارات وآخر فحص
    const hives = await prisma.hive.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        frames: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1
        },
        apiary: {
          select: { name: true }
        }
      }
    });

    if (hives.length === 0) {
      console.log('لا توجد خلايا نشطة في قاعدة البيانات.');
      return;
    }

    const results = hives.map(hive => {
      // أ. عدد الإطارات الإجمالي في الخلية
      const totalFramesCount = (hive.stories || 1) * (hive.framesPerBox || 10);

      // ب. حساب المتوسطات من جدول الإطارات HiveFrame (البيانات التفصيلية)
      const frames = hive.frames;
      const avgPollen = frames.length > 0 
        ? frames.reduce((sum, f) => sum + (f.pollenPercentage || 0), 0) / frames.length 
        : 0;
      const avgBrood = frames.length > 0 
        ? frames.reduce((sum, f) => sum + (f.broodPercentage || 0), 0) / frames.length 
        : 0;
      const avgHoney = frames.length > 0 
        ? frames.reduce((sum, f) => sum + (f.honeyPercentage || 0), 0) / frames.length 
        : 0;

      // ج. جلب بيانات آخر فحص (إذا وُجدت)
      const lastInspection = hive.inspections[0];

      // د. منطق التقييم (بناءً على الحسابات الحالية والنظام)
      const pollenAssessment = getAssessmentLabel(avgPollen, { weak: 10, good: 30 });
      const broodAssessment = getAssessmentLabel(avgBrood, { weak: 20, good: 50 });
      const honeyAssessment = getAssessmentLabel(avgHoney, { weak: 15, good: 40 });

      return {
        apiaryName: hive.apiary.name,
        hiveNumber: hive.hiveNumber,
        totalFrames: totalFramesCount,
        pollen: {
          percentage: `${avgPollen.toFixed(1)}%`,
          assessment: pollenAssessment,
          framesFromInspection: lastInspection?.pollenFramesCount || 0
        },
        brood: {
          percentage: `${avgBrood.toFixed(1)}%`,
          assessment: broodAssessment,
          framesFromInspection: lastInspection?.broodFramesCount || 0
        },
        honey: {
          percentage: `${avgHoney.toFixed(1)}%`,
          assessment: honeyAssessment,
          framesFromInspection: lastInspection?.honeyFramesCount || 0
        }
      };
    });

    // عرض النتائج بشكل جدول مرتب
    console.table(results.map(r => ({
      'المنحل': r.apiaryName,
      'الخلية': r.hiveNumber,
      'الإطارات': r.totalFrames,
      'حبوب اللقاح (%)': r.pollen.percentage,
      'تقييم حبوب اللقاح': r.pollen.assessment,
      'إطارات حبوب اللقاح (آخر فحص)': r.pollen.framesFromInspection,
      'الحضنة (%)': r.brood.percentage,
      'تقييم الحضنة': r.brood.assessment,
      'إطارات الحضنة (آخر فحص)': r.brood.framesFromInspection,
      'العسل (%)': r.honey.percentage,
      'تقييم العسل': r.honey.assessment,
      'إطارات العسل (آخر فحص)': r.honey.framesFromInspection,
    })));

    console.log(`\nتم تحليل ${results.length} خلية بنجاح.`);

  } catch (error) {
    console.error('حدث خطأ أثناء تشغيل السكربت:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * دالة لتحديد مسمى التقييم بناءً على النسب المئوية
 */
function getAssessmentLabel(value: number, thresholds: { weak: number, good: number }) {
  if (value < thresholds.weak) return 'ضعيف 🔴';
  if (value < thresholds.good) return 'جيد 🟡';
  return 'ممتاز 🟢';
}

calculateHiveAssessments();
