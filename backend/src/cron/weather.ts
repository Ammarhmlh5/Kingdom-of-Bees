import prisma from '../config/prisma';
import * as cron from 'node-cron';
import { logger } from '../utils/logger';

function log(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
  const entry = `[${new Date().toISOString()}] [${level}] [Cron:Weather] ${message}`;
  logger.info(entry);
  if (data) {
    if (data instanceof Error) {
      logger.info(data.stack || data.message);
    } else {
      logger.info(JSON.stringify(data, null, 2));
    }
  }
}

const WMO_CONDITIONS: Record<number, string> = {
  0: 'صافي', 1: 'صافي في الغالب', 2: 'غائم جزئياً', 3: 'غائم',
  45: 'ضباب', 48: 'ضباب متجمد', 51: 'رذاذ خفيف', 53: 'رذاذ',
  55: 'رذاذ كثيف', 61: 'مطر خفيف', 63: 'مطر', 65: 'مطر غزير',
  71: 'ثلج خفيف', 73: 'ثلج', 75: 'ثلج كثيف', 95: 'عاصفة رعدية'
};

function getConditionText(code: number): string {
  return WMO_CONDITIONS[code] || 'غير معروف';
}

async function fetchWeatherForApiary(lat: number, lng: number, apiaryId: string, apiaryName: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Weather API responded with ${response.status}`);

    const data: any = await response.json();
    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      throw new Error('Weather API returned unexpected data shape');
    }

    const idx = 0;
    const tempMax = data.daily.temperature_2m_max[idx];
    const tempMin = data.daily.temperature_2m_min[idx];
    const temperature = tempMax != null && tempMin != null
      ? Math.round((tempMax + tempMin) / 2)
      : (tempMax ?? tempMin ?? null);
    const rainfall = data.daily.precipitation_sum[idx] ?? 0;
    const windSpeed = data.daily.wind_speed_10m_max[idx] ?? null;
    const weatherCode = data.daily.weather_code[idx] ?? null;
    const conditions = weatherCode != null ? getConditionText(weatherCode) : 'غير معروف';

    // Save to weatherData cache
    await prisma.weatherData.create({
      data: {
        apiaryId,
        date: new Date(),
        time: new Date(),
        source: 'API',
        apiProvider: 'Open-Meteo',
        temperatureCelsius: temperature,
        temperatureMin: tempMin,
        temperatureMax: tempMax,
        rainfallMm: rainfall,
        windSpeedKmh: windSpeed,
        conditions
      }
    });

    // Save as ApiaryOperation so it appears in evaluations log
    await prisma.apiaryOperation.create({
      data: {
        apiaryId,
        operationType: 'OTHER',
        description: `بيانات الطقس اليومية - ${apiaryName || 'المنحل'}`,
        operationDate: new Date(),
        data: {
          assessmentType: 'WEATHER_LOG',
          source: 'api',
          temperature,
          tempMax,
          tempMin,
          rainfall,
          windSpeed,
          conditions,
          weatherCode
        }
      }
    });

    log('INFO', `تم تسجيل طقس ${apiaryName || apiaryId}: ${temperature}°C, ${conditions}`);
    return true;
  } catch (error) {
    log('ERROR', `فشل جلب الطقس للمنحل ${apiaryName || apiaryId}`, error);
    return false;
  }
}

async function fetchAllApiariesWeather() {
  log('INFO', 'بدء جلب الطقس اليومي لجميع المناحل');

  try {
    const apiaries = await prisma.apiary.findMany({
      where: {
        locationLat: { not: null },
        locationLng: { not: null },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        locationLat: true,
        locationLng: true
      }
    });

    log('INFO', `تم العثور على ${apiaries.length} منحل لجلب الطقس`);

    let successCount = 0;
    for (const apiary of apiaries) {
      const lat = Number(apiary.locationLat);
      const lng = Number(apiary.locationLng);

      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        log('WARN', `إحداثيات غير صالحة للمنحل ${apiary.name || apiary.id}`);
        continue;
      }

      const ok = await fetchWeatherForApiary(lat, lng, apiary.id, apiary.name || '');
      if (ok) successCount++;

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    log('INFO', `انتهى جلب الطقس: نجح ${successCount} من ${apiaries.length}`);
  } catch (error) {
    log('ERROR', 'فشل في جلب الطقس اليومي', error);
  }
}

export function startWeatherCronJobs() {
  log('INFO', 'بدء تشغيل المهمة المجدولة للطقس اليومي');

  // Run daily at 6:00 AM
  cron.schedule('0 6 * * *', () => {
    fetchAllApiariesWeather().catch(e => log('ERROR', 'فشل في مهمة الطقس اليومي', e));
  });

  // Also run once on startup
  fetchAllApiariesWeather().catch(e => log('ERROR', 'فشل في جلب الطقس عند بدء التشغيل', e));

  log('INFO', 'تم تسجيل مهمة الطقس اليومي بنجاح');
}
