import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class WeatherService {

    // Helper to fetch from Open-Meteo
    private static async fetchFromOpenMeteo(lat: number, lng: number): Promise<any> {
        // Fetch Current Weather and Forecast
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather API Error");
        return response.json();
    }

    private static mapWMOToCondition(code: number): string {
        // Simple WMO code mapper
        if (code === 0) return 'Clear';
        if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
        if (code >= 45 && code <= 48) return 'Fog';
        if (code >= 51 && code <= 67) return 'Drizzle/Rain';
        if (code >= 71) return 'Snow';
        if (code >= 95) return 'Thunderstorm';
        return 'Unknown';
    }

    static async recordManual(apiaryId: string, data: any) {
        return prisma.weatherData.create({
            data: {
                apiaryId,
                date: new Date(data.date),
                time: data.time ? new Date(`${data.date}T${data.time}`) : new Date(),
                source: 'MANUAL',
                temperatureCelsius: Number(data.temperatureCelsius),
                rainfallMm: Number(data.rainfallMm || 0),
                rainfallManual: true,
                conditions: data.conditions,
                windSpeedKmh: Number(data.windSpeedKmh || 0),
                humidityPercentage: Number(data.humidityPercentage || 0)
            }
        });
    }

    static async getCurrentWeather(apiaryId: string) {
        // 1. Check for recent MANUAL entry (User Override - valid for 2 hours)
        const manualWindow = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const manualEntry = await prisma.weatherData.findFirst({
            where: {
                apiaryId,
                source: 'MANUAL',
                createdAt: { gt: manualWindow }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (manualEntry) return manualEntry;

        // 2. Try to get recent API record (last 30 mins)
        const timeWindow = new Date(Date.now() - 30 * 60 * 1000); // 30 mins
        const recent = await prisma.weatherData.findFirst({
            where: {
                apiaryId,
                source: 'API',
                createdAt: { gt: timeWindow }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (recent) return recent;

        // 3. Fetch external
        const apiary = await prisma.apiary.findUnique({ where: { id: apiaryId } });
        if (!apiary || !apiary.locationLat || !apiary.locationLng) {
            // Return null if coordinates not set - don't crash the entire API
            return null;
        }

        const data = await this.fetchFromOpenMeteo(Number(apiary.locationLat), Number(apiary.locationLng));
        const current = data.current;
        const daily = data.daily; // Use today's daily for max/min

        const condition = this.mapWMOToCondition(current.weather_code);

        // Save Current
        const weatherData = await prisma.weatherData.create({
            data: {
                apiaryId,
                date: new Date(),
                time: new Date(),
                source: 'API',
                apiProvider: 'Open-Meteo',
                temperatureCelsius: current.temperature_2m,
                temperatureMin: daily.temperature_2m_min[0],
                temperatureMax: daily.temperature_2m_max[0],
                humidityPercentage: current.relative_humidity_2m,
                windSpeedKmh: current.wind_speed_10m,
                conditions: condition,
                foragingOpportunity: current.temperature_2m > 15 && current.wind_speed_10m < 25 && current.rain === 0
            }
        });

        // Optimistically update or create forecast (Future improvement: separate function)
        await this.updateForecasts(apiaryId, data.daily);

        return weatherData;
    }

    static async updateForecasts(apiaryId: string, dailyData: any) {
        // Clear old forecasts for future clean up or just upsert
        // For simple MVP we just create new ones or overwrite? 
        // Prisma createMany is not supported with sqlite, but okay with postgres. 
        // Let's iterate.
        // Logic: Delete old forecasts from today onwards, insert new.
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.weatherForecast.deleteMany({
            where: { apiaryId, forecastForDate: { gte: today } }
        });

        const forecasts = [];
        for (let i = 0; i < dailyData.time.length; i++) {
            forecasts.push({
                apiaryId,
                forecastDate: new Date(), // issued at
                forecastForDate: new Date(dailyData.time[i]),
                temperatureMax: dailyData.temperature_2m_max[i],
                temperatureMin: dailyData.temperature_2m_min[i],
                precipitationProbability: dailyData.precipitation_probability_max[i],
                conditions: this.mapWMOToCondition(dailyData.weather_code[i]),
                apiProvider: 'Open-Meteo'
            });
        }

        await prisma.weatherForecast.createMany({ data: forecasts });
    }

    static async getForecast(apiaryId: string) {
        // If we just fetched current, we likely updated forecast. 
        // We retrieve saved forecast.
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return prisma.weatherForecast.findMany({
            where: {
                apiaryId,
                forecastForDate: { gte: today }
            },
            orderBy: { forecastForDate: 'asc' },
            take: 5
        });
    }
}
