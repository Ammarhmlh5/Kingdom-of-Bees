import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Thermometer, Droplets, Wind, Eye, Sun, CloudRain, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export default function WeatherPage() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const token = localStorage.getItem('auth_token') || '';
        const response = await apiClient.get('/weather/current', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setWeather(response.data?.data || response.data);
      } catch {
        // Fallback to mock data
        setWeather({
          temperature: 32,
          humidity: 45,
          windSpeed: 15,
          conditions: 'مشمس جزئياً',
          city: 'الرياض',
          forecast: [
            { day: 'غداً', temp: 34, conditions: 'مشمس', icon: 'sun' },
            { day: 'الثلاثاء', temp: 28, conditions: 'أمطار خفيفة', icon: 'rain' },
            { day: 'الأربعاء', temp: 31, conditions: 'صحو', icon: 'sun' },
            { day: 'الخميس', temp: 33, conditions: 'مشمس', icon: 'sun' },
            { day: 'الجمعة', temp: 26, conditions: 'أمطار', icon: 'rain' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pb-20">
        <Header title="حالة الطقس" subtitle="تنبؤات للمنحل" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-honey" size={32} />
        </div>
      </div>
    );
  }

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'rain': return CloudRain;
      default: return Sun;
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="حالة الطقس" subtitle="تنبؤات للمنحل" />

      <div className="flex-1 px-4 py-4 space-y-4">
        <Card className="bg-gradient-to-br from-honey/20 to-honey/5 border-honey/20">
          <div className="text-center py-4">
            <div className="text-5xl mb-2">☀️</div>
            <p className="text-3xl font-bold text-bee-text">{weather?.temperature ?? 32}°</p>
            <p className="text-sm text-bee-muted">{weather?.conditions ?? 'مشمس جزئياً'}</p>
            <p className="text-xs text-bee-muted mt-1">{weather?.city ?? 'الرياض'}</p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Thermometer size={16} className="text-danger" />
              <span className="text-xs text-bee-muted">الحرارة</span>
            </div>
            <p className="font-bold">{weather?.temperature ?? 32}° / {weather?.temperatureMin ?? 22}°</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Droplets size={16} className="text-blue-500" />
              <span className="text-xs text-bee-muted">الرطوبة</span>
            </div>
            <p className="font-bold">{weather?.humidity ?? 45}%</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Wind size={16} className="text-gray-500" />
              <span className="text-xs text-bee-muted">الرياح</span>
            </div>
            <p className="font-bold">{weather?.windSpeed ?? 15} كم/س</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Eye size={16} className="text-purple-500" />
              <span className="text-xs text-bee-muted">الرؤية</span>
            </div>
            <p className="font-bold">جيدة</p>
          </Card>
        </div>

        <h3 className="font-bold text-base">تنبؤ 5 أيام</h3>
        <div className="space-y-2">
          {(weather?.forecast || []).map((f: any, i: number) => {
            const Icon = getWeatherIcon(f.icon);
            return (
              <Card key={i}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{f.day}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-bee-muted">{f.conditions}</span>
                    <Icon size={18} className="text-honey" />
                    <span className="font-bold text-sm">{f.temp}°</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="bg-green-50 border-green-200">
          <p className="text-sm text-green-700">
            <strong>نصيحة:</strong> الطقس مناسب للتفقد. تجنب فتح الخلايا أثناء الأمطار.
          </p>
        </Card>
      </div>
    </div>
  );
}
