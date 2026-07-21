import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Thermometer, Droplets, Wind, Eye, Sun, CloudRain, Cloud, Loader2, AlertTriangle, CloudSnow, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface WeatherAlert {
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export default function WeatherPage() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [apiaries, setApiaries] = useState<any[]>([]);
  const [selectedApiary, setSelectedApiary] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadApiaries();
  }, []);

  useEffect(() => {
    if (selectedApiary) fetchWeather(selectedApiary);
  }, [selectedApiary]);

  const loadApiaries = async () => {
    try {
      const { data } = await apiClient.get('/apiaries');
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setApiaries(list);
      if (list.length > 0) {
        setSelectedApiary(list[0].id);
      } else {
        setError(true);
        setLoading(false);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  const fetchWeather = async (apiaryId: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data: raw } = await apiClient.get(`/weather/current/${apiaryId}`);
      const weatherData = raw?.data !== undefined ? raw.data : raw;
      setWeather(weatherData);
      setError(false);
      try { localStorage.setItem(`weather_${apiaryId}`, JSON.stringify({ data: weatherData, ts: Date.now() })); } catch { /* ignore */ }
    } catch {
      const cached = localStorage.getItem(`weather_${apiaryId}`);
      if (cached) {
        const { data } = JSON.parse(cached);
        setWeather(data);
        setError(false);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getWeatherIcon = (conditions: string) => {
    if (!conditions) return Sun;
    const c = conditions.toLowerCase();
    if (c.includes('rain') || c.includes('مطر')) return CloudRain;
    if (c.includes('snow') || c.includes('ثلج')) return CloudSnow;
    if (c.includes('cloud') || c.includes('غيم')) return Cloud;
    return Sun;
  };

  const getAlerts = (w: any): WeatherAlert[] => {
    const alerts: WeatherAlert[] = [];
    const temp = w.temperature || 0;
    const wind = w.windSpeed || 0;
    const humidity = w.humidity || 0;
    const visibility = w.visibility || 10;
    const conditions = (w.conditions || '').toLowerCase();

    if (temp > 45) alerts.push({ type: 'heat', message: 'حرارة شديدة — لا تفتح الخلايا', severity: 'high' });
    else if (temp > 38) alerts.push({ type: 'heat', message: 'حرارة مرتفعة — افحص في الصباح الباكر', severity: 'medium' });

    if (temp < 5) alerts.push({ type: 'cold', message: 'برودة شديدة — تأكد من تدفئة الخلايا', severity: 'high' });
    else if (temp < 10) alerts.push({ type: 'cold', message: 'حرارة منخفضة — تأكد من التخزين الكافٍ', severity: 'low' });

    if (wind > 40) alerts.push({ type: 'wind', message: 'رياح عاصفية — ممنوع فتح الخلايا', severity: 'high' });
    else if (wind > 25) alerts.push({ type: 'wind', message: 'رياح قوية — تجنب الفتح', severity: 'medium' });

    if (conditions.includes('rain')) alerts.push({ type: 'rain', message: 'أمطار — لا تفتح الخلايا', severity: 'medium' });
    if (humidity > 85) alerts.push({ type: 'humidity', message: 'رطوبة عالية — راقب الأمراض الفطرية', severity: 'medium' });
    if (visibility < 1) alerts.push({ type: 'visibility', message: 'رؤية منخفضة جداً', severity: 'low' });

    return alerts;
  };

  const getTip = (w: any): string => {
    const temp = w.temperature || 0;
    const humidity = w.humidity || 0;
    const conditions = (w.conditions || '').toLowerCase();

    if (conditions.includes('rain')) return 'أمطار متوقعة — اترك الخلايا مغلقة.';
    if (temp > 38) return 'الحرارة مرتفعة — افحص في الصباح الباكر أو المساء.';
    if (temp < 10) return 'الحرارة منخفضة — تأكد من التخزين الكافٍ للنحل.';
    if (humidity > 80) return 'الرطوبة مرتفعة — راقب الأمراض الفطرية.';
    return 'الطقس مناسب للتفقد. استمر في المراقبة الدورية.';
  };

  const WeatherIcon = weather ? getWeatherIcon(weather.conditions) : Sun;
  const alerts = weather ? getAlerts(weather) : [];
  const tip = weather ? getTip(weather) : '';

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pb-20">
        <Header title="حالة الطقس" subtitle="تنبؤات للمنحل" />
        <div className="flex-1 px-4 py-4 space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-bee-border/50 rounded-lg" />
            <div className="h-40 bg-bee-border/50 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 bg-bee-border/50 rounded-lg" />
              <div className="h-20 bg-bee-border/50 rounded-lg" />
              <div className="h-20 bg-bee-border/50 rounded-lg" />
              <div className="h-20 bg-bee-border/50 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex flex-col min-h-screen pb-20">
        <Header title="حالة الطقس" subtitle="تنبؤات للمنحل" />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <p className="text-lg font-medium text-bee-text mb-2">لا توجد بيانات طقس</p>
          <p className="text-sm text-bee-muted text-center mb-4">تأكد من اختيار منحل للحصول على بيانات الطقس</p>
          {selectedApiary && (
            <button
              onClick={() => fetchWeather(selectedApiary, true)}
              className="flex items-center gap-2 px-4 py-2 bg-honey text-white rounded-lg text-sm font-medium"
            >
              <RefreshCw size={14} />
              إعادة المحاولة
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="حالة الطقس" subtitle={weather?.city || ''} />

      <div className="flex-1 px-4 py-4 space-y-4">
        {apiaries.length > 1 && (
          <select
            value={selectedApiary}
            onChange={(e) => setSelectedApiary(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-bee-border bg-white text-sm"
          >
            {apiaries.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        )}

        <button
          onClick={() => fetchWeather(selectedApiary, true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs text-bee-muted hover:text-honey transition-colors"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'جاري التحديث...' : 'تحديث'}
        </button>

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <Card key={i} className={
                alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className={
                    alert.severity === 'high' ? 'text-red-500' :
                    alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                  } />
                  <p className={`text-sm font-medium ${
                    alert.severity === 'high' ? 'text-red-700' :
                    alert.severity === 'medium' ? 'text-yellow-700' : 'text-blue-700'
                  }`}>{alert.message}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-gradient-to-br from-honey/20 to-honey/5 border-honey/20">
          <div className="text-center py-4">
            <WeatherIcon size={48} className="mx-auto text-honey mb-2" />
            <p className="text-3xl font-bold text-bee-text">{weather.temperature}°</p>
            <p className="text-sm text-bee-muted">{weather.conditions}</p>
            {weather.city && <p className="text-xs text-bee-muted mt-1">{weather.city}</p>}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Thermometer size={16} className="text-danger" />
              <span className="text-xs text-bee-muted">الحرارة</span>
            </div>
            <p className="font-bold">{weather.temperature}°{weather.temperatureMax ? ` / ${weather.temperatureMin}°` : ''}</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Droplets size={16} className="text-blue-500" />
              <span className="text-xs text-bee-muted">الرطوبة</span>
            </div>
            <p className="font-bold">{weather.humidity}%</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Wind size={16} className="text-gray-500" />
              <span className="text-xs text-bee-muted">الرياح</span>
            </div>
            <p className="font-bold">{weather.windSpeed} كم/س</p>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Eye size={16} className="text-purple-500" />
              <span className="text-xs text-bee-muted">الرؤية</span>
            </div>
            <p className="font-bold">{weather.visibility || 'جيدة'}</p>
          </Card>
        </div>

        {weather.forecast && weather.forecast.length > 0 && (
          <>
            <h3 className="font-bold text-base">تنبؤ 5 أيام</h3>
            <div className="space-y-2">
              {weather.forecast.map((f: any, i: number) => {
                const Icon = getWeatherIcon(f.conditions);
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
          </>
        )}

        <Card className="bg-green-50 border-green-200">
          <p className="text-sm text-green-700">
            <strong>نصيحة:</strong> {tip}
          </p>
        </Card>
      </div>
    </div>
  );
}
