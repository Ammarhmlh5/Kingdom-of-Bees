import { useSearchParams, useParams } from "react-router-dom";
import { useCurrentWeather, useForecast } from "@/hooks/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CloudSun, Wind, Droplets, Thermometer } from "lucide-react";

export function WeatherPage() {
    const [searchParams] = useSearchParams();
    const { id: paramId } = useParams<{ id: string }>();
    const apiaryId = paramId || searchParams.get('apiaryId');

    const { data: current, isLoading: loadingCurrent } = useCurrentWeather(apiaryId || '');
    const { data: forecast = [], isLoading: loadingForecast } = useForecast(apiaryId || '');

    const loading = loadingCurrent || loadingForecast;

    if (!apiaryId) return <div className="p-8 text-center">يرجى اختيار المنحل</div>;
    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <CloudSun className="w-8 h-8 text-amber-500" />
                حالة الطقس
            </h1>

            {current && (
                <Card className="bg-gradient-to-br from-blue-50 to-amber-50 border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-right">
                                <div className="text-gray-500 text-sm mb-1">{new Date(current.date).toLocaleDateString('ar-SA')}</div>
                                <div className="text-5xl font-bold text-slate-800">{Math.round(current.temperatureCelsius ?? 0)}°</div>
                                <div className="text-xl text-slate-600 mt-2">{current.conditions}</div>
                                {current.foragingOpportunity && (
                                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                        مناسب للسروح 🐝
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex flex-col items-center">
                                    <Wind className="w-6 h-6 text-slate-400 mb-1" />
                                    <span className="font-semibold">{current.windSpeedKmh} km/h</span>
                                    <span className="text-xs text-slate-500">الرياح</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Droplets className="w-6 h-6 text-blue-400 mb-1" />
                                    <span className="font-semibold">{current.humidityPercentage}%</span>
                                    <span className="text-xs text-slate-500">الرطوبة</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Thermometer className="w-6 h-6 text-red-400 mb-1" />
                                    <span className="font-semibold">{current.temperatureMax ?? '-'}° / {current.temperatureMin ?? '-'}°</span>
                                    <span className="text-xs text-slate-500">الحرارة</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <h2 className="text-xl font-bold mt-8 mb-4">التوقعات القادمة (5 أيام)</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {forecast.length > 0 ? forecast.map((day: any) => (
                    <Card key={day.id} className="text-center hover:shadow-md transition">
                        <CardContent className="p-4">
                            <div className="text-sm font-semibold mb-2">{new Date(day.forecastForDate).toLocaleDateString('ar-SA', { weekday: 'long' })}</div>
                            <CloudSun className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                            <div className="text-xl font-bold">{Math.round(day.temperatureMax)}°</div>
                            <div className="text-sm text-gray-500">{Math.round(day.temperatureMin)}°</div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="col-span-full text-center text-gray-400 py-8">لا توجد توقعات محفوظة</div>
                )}
            </div>
        </div>
    );
}
