import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getHives } from '@/services/hives';
import { getApiaryById } from '@/services/apiaries';
import { recordFlightAssessment, recordPollenAssessment, recordWeatherData, recordAutoWeatherData } from '@/services/assessments';
import EvaluationsLog from './EvaluationsLog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Default fallback coordinates (Riyadh) if apiary has no location set
const DEFAULT_LAT = 24.7136;
const DEFAULT_LNG = 46.6753;

export default function ApiaryOverviewPage() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState('flight');
    const [selectedHive, setSelectedHive] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [assessmentData, setAssessmentData] = useState({
        date: '',
        time: '',
        duration: '1',
        beeCount: '',
        temperature: '',
        rainfall: '',
        notes: ''
    });
    const [weatherData, setWeatherData] = useState<any>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherSource, setWeatherSource] = useState<'manual' | 'auto'>('manual');
    const [hives, setHives] = useState<any[]>([]);
    const [hivesLoading, setHivesLoading] = useState(true);
    const [apiaryLocation, setApiaryLocation] = useState<{
        lat: number;
        lng: number;
        name: string;
        hasRealLocation: boolean;
    }>({
        lat: DEFAULT_LAT,
        lng: DEFAULT_LNG,
        name: '',
        hasRealLocation: false
    });

    // Fetch apiary info (for real coordinates)
    useEffect(() => {
        const fetchApiaryInfo = async () => {
            if (!apiaryId) return;
            try {
                const apiary = await getApiaryById(apiaryId);
                if (apiary) {
                    const lat = parseFloat(apiary.locationLat);
                    const lng = parseFloat(apiary.locationLng);
                    const hasReal = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
                    setApiaryLocation({
                        lat: hasReal ? lat : DEFAULT_LAT,
                        lng: hasReal ? lng : DEFAULT_LNG,
                        name: apiary.name || '',
                        hasRealLocation: hasReal
                    });
                }
            } catch (error) {
                console.error('Failed to fetch apiary info:', error);
            }
        };
        fetchApiaryInfo();
    }, [apiaryId]);

    // Fetch real hives data
    useEffect(() => {
        const fetchHives = async () => {
            if (!apiaryId) return;
            setHivesLoading(true);
            try {
                const data = await getHives(apiaryId);
                setHives(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch hives:', error);
                setHives([]);
            } finally {
                setHivesLoading(false);
            }
        };
        fetchHives();
    }, [apiaryId]);

    const fetchWeatherData = async () => {
        setWeatherLoading(true);
        try {
            if (!apiaryId) throw new Error('معرف المنحل مطلوب');

            const { default: api } = await import('@/services/api');
            const response = await api.get(`/apiaries/${apiaryId}/weather/real`);
            const data = response.data?.data || response.data;

            setWeatherData({
                temperature: data.temperature,
                humidity: data.humidity,
                rainfall: data.rainfall ?? 0,
                windSpeed: data.windSpeed,
                conditions: data.conditions || 'غير معروف',
                lastUpdate: data.lastUpdate
                    ? new Date(data.lastUpdate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                    : new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
                latitude: apiaryLocation.lat,
                longitude: apiaryLocation.lng,
                isRealLocation: data.isDefault !== true && apiaryLocation.hasRealLocation
            });
        } catch (error) {
            console.error('Error fetching weather from backend:', error);
            setWeatherData({
                temperature: 30,
                humidity: 20,
                rainfall: 0,
                windSpeed: 10,
                conditions: 'صافي',
                lastUpdate: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
                latitude: apiaryLocation.lat,
                longitude: apiaryLocation.lng,
                isRealLocation: false
            });
        } finally {
            setWeatherLoading(false);
        }
    };

    // Fetch weather when tab opens (wait for apiary location to load)
    useEffect(() => {
        if (activeTab === 'weather') {
            fetchWeatherData();
        }
    }, [activeTab, apiaryLocation.lat, apiaryLocation.lng]);

    const tabs = [
        { id: 'flight', label: 'تقييم السروح' },
        { id: 'pollen', label: 'تقييم حبوب اللقاح' },
        { id: 'weather', label: 'تقييم الطقس' },
        { id: 'log', label: 'سجل التقييمات' },
    ];

    const handleStartAssessment = () => {
        if (selectedHive) setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!apiaryId) { toast.error('بيانات المنحل غير متوفرة'); return; }
        if (activeTab !== 'weather' && !selectedHive) { toast.error('يرجى اختيار خلية أولاً'); return; }

        // Validate required fields for flight/pollen
        if (activeTab === 'flight' || activeTab === 'pollen') {
            if (!assessmentData.date) { toast.error('يرجى تحديد تاريخ التقييم'); return; }
            if (!assessmentData.time) { toast.error('يرجى تحديد وقت التقييم'); return; }
            if (!assessmentData.beeCount || isNaN(parseInt(assessmentData.beeCount))) {
                toast.error('يرجى إدخال عدد النحل'); return;
            }
        }

        // Validate required fields for weather
        if (activeTab === 'weather') {
            if (!assessmentData.date) { toast.error('يرجى تحديد التاريخ'); return; }
            if (weatherSource === 'manual' && !assessmentData.time) { toast.error('يرجى تحديد الوقت'); return; }
        }

        const selectedHiveData = hives.find(h => h.id === selectedHive);

        try {
            if (activeTab === 'flight') {
                await recordFlightAssessment(apiaryId, selectedHive, {
                    date: assessmentData.date,
                    time: assessmentData.time,
                    duration: parseInt(assessmentData.duration),
                    beeCount: parseInt(assessmentData.beeCount)
                });
                toast.success(`تم حفظ تقييم السروح للخلية #${selectedHiveData?.hiveNumber}`);
            } else if (activeTab === 'pollen') {
                await recordPollenAssessment(apiaryId, selectedHive, {
                    date: assessmentData.date,
                    time: assessmentData.time,
                    duration: parseInt(assessmentData.duration),
                    beeCount: parseInt(assessmentData.beeCount)
                });
                toast.success(`تم حفظ تقييم حبوب اللقاح للخلية #${selectedHiveData?.hiveNumber}`);
            } else if (activeTab === 'weather') {
                if (weatherSource === 'auto') {
                    await recordAutoWeatherData(apiaryId, assessmentData.date);
                    toast.success('تم جلب وحفظ بيانات الطقس تلقائياً');
                } else {
                    await recordWeatherData(apiaryId, {
                        date: assessmentData.date,
                        time: assessmentData.time,
                        temperature: assessmentData.temperature ? parseFloat(assessmentData.temperature) : weatherData?.temperature,
                        rainfall: assessmentData.rainfall ? parseFloat(assessmentData.rainfall) : weatherData?.rainfall,
                        notes: assessmentData.notes
                    });
                    toast.success('تم حفظ بيانات الطقس');
                }
            }

            setIsDialogOpen(false);
            setSelectedHive('');
            setAssessmentData({ date: '', time: '', duration: '1', beeCount: '', temperature: '', rainfall: '', notes: '' });
        } catch (error) {
            console.error('Error saving assessment:', error);
            toast.error('فشل في حفظ البيانات');
        }
    };

    const HiveSelector = ({ id }: { id: string }) => (
        <select
            id={id}
            value={selectedHive}
            onChange={(e) => setSelectedHive(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={hivesLoading}
        >
            <option value="">{hivesLoading ? 'جاري التحميل...' : '-- اختر خلية --'}</option>
            {hives.map((hive) => (
                <option key={hive.id} value={hive.id}>
                    #{hive.hiveNumber} {hive.name ? `- ${hive.name}` : ''}
                </option>
            ))}
        </select>
    );

    const renderTabContent = () => {
        if (activeTab === 'flight') {
            return (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="max-w-md space-y-4">
                        <div>
                            <Label htmlFor="hive-select" className="text-base font-semibold mb-2 block">اختر خلية</Label>
                            <HiveSelector id="hive-select" />
                        </div>
                        <Button onClick={handleStartAssessment} disabled={!selectedHive} className="w-full">
                            بدء التقييم
                        </Button>
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <h4 className="font-semibold text-amber-900 mb-2">⚠️ تعليمات مهمة:</h4>
                            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                                <li>لا تجري التقييم وقت الأمطار أو الرياح القوية</li>
                                <li>تجنب التقييم وقت الظهيرة في درجات الحرارة العالية (فوق 35°)</li>
                                <li>أفضل وقت للتقييم: الصباح الباكر (7-10 صباحاً) أو قبل الغروب</li>
                                <li>تأكد من ثبات الظروف الجوية طوال فترة التقييم</li>
                                <li>سجل الملاحظات فوراً لضمان دقة البيانات</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'pollen') {
            return (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="max-w-md space-y-4">
                        <div>
                            <Label htmlFor="hive-select-pollen" className="text-base font-semibold mb-2 block">اختر خلية</Label>
                            <HiveSelector id="hive-select-pollen" />
                        </div>
                        <Button onClick={handleStartAssessment} disabled={!selectedHive} className="w-full">
                            بدء التقييم
                        </Button>
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2">📋 تعليمات التقييم:</h4>
                            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                                <li>أفضل وقت: الصباح الباكر عند بداية نشاط النحل</li>
                                <li>راقب النحل العائد للخلية (وليس الخارج منها)</li>
                                <li>ابحث عن كرات حبوب اللقاح على أرجل النحل الخلفية</li>
                                <li>لاحظ ألوان حبوب اللقاح (تدل على مصادر الرحيق)</li>
                                <li>تجنب التقييم في الأيام الممطرة أو شديدة البرودة</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'weather') {
            if (weatherLoading) {
                return (
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">⏳</div>
                            <p className="text-slate-600">جاري تحميل بيانات الطقس...</p>
                            {apiaryLocation.name && (
                                <p className="text-sm text-slate-400 mt-2">📍 {apiaryLocation.name}</p>
                            )}
                        </div>
                    </div>
                );
            }

            if (!weatherData) {
                return (
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="text-center py-12 text-red-500">
                            <p>فشل تحميل بيانات الطقس. يرجى المحاولة مرة أخرى.</p>
                            <Button onClick={fetchWeatherData} variant="outline" className="mt-4">
                                إعادة المحاولة
                            </Button>
                        </div>
                    </div>
                );
            }

            return (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="max-w-2xl space-y-6">
                        {/* Location badge */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${weatherData.isRealLocation ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
                            <span>{weatherData.isRealLocation ? '✅' : '⚠️'}</span>
                            {weatherData.isRealLocation
                                ? `بيانات حقيقية لموقع المنحل: ${apiaryLocation.name} (${weatherData.latitude.toFixed(4)}°, ${weatherData.longitude.toFixed(4)}°)`
                                : `تحذير: المنحل لا يملك إحداثيات محددة — يتم عرض طقس الرياض كإحداثيات افتراضية`
                            }
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">بيانات الطقس الحالية (Open-Meteo API)</h3>
                                <Button onClick={fetchWeatherData} variant="ghost" size="sm" disabled={weatherLoading}>
                                    🔄 تحديث
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="text-sm text-blue-600 mb-1">درجة الحرارة</div>
                                    <div className="text-2xl font-bold text-blue-900">{weatherData.temperature}°C</div>
                                </div>
                                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                                    <div className="text-sm text-cyan-600 mb-1">الرطوبة</div>
                                    <div className="text-2xl font-bold text-cyan-900">{weatherData.humidity}%</div>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <div className="text-sm text-indigo-600 mb-1">هطول الأمطار</div>
                                    <div className="text-2xl font-bold text-indigo-900">{weatherData.rainfall} مم</div>
                                </div>
                                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                                    <div className="text-sm text-teal-600 mb-1">سرعة الرياح</div>
                                    <div className="text-2xl font-bold text-teal-900">{weatherData.windSpeed} كم/س</div>
                                </div>
                                <div className="p-4 bg-sky-50 rounded-lg border border-sky-200 md:col-span-2">
                                    <div className="text-sm text-sky-600 mb-1">الحالة العامة</div>
                                    <div className="text-xl font-bold text-sky-900">{weatherData.conditions}</div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">آخر تحديث: {weatherData.lastUpdate}</p>
                        </div>

                        <div className="border-t pt-6">
                            <h4 className="font-semibold mb-3">هل لاحظت اختلافاً في بيانات الطقس؟</h4>
                            <p className="text-sm text-slate-600 mb-4">
                                إذا كانت البيانات الفعلية في موقع المنحل تختلف عن البيانات المعروضة، يمكنك تسجيل البيانات الفعلية يدوياً.
                            </p>
                            <Button onClick={() => { setWeatherSource('manual'); setIsDialogOpen(true); }} variant="outline" className="w-full md:w-auto">
                                تسجيل بيانات الطقس يدوياً
                            </Button>
                            <Button onClick={() => { setAssessmentData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] })); setWeatherSource('auto'); setIsDialogOpen(true); }}
                                variant="outline" className="w-full md:w-auto">
                                جلب بيانات الطقس تلقائياً لتاريخ محدد
                            </Button>
                        </div>

                        {!weatherData.isRealLocation && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <h4 className="font-semibold text-amber-900 mb-1">📍 كيف أضيف موقع المنحل؟</h4>
                                <p className="text-sm text-amber-800">
                                    اذهب إلى إعدادات المنحل وأضف الإحداثيات الجغرافية (خط العرض وخط الطول) لتحصل على بيانات طقس دقيقة لموقعك الفعلي.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (activeTab === 'log') {
            return (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <EvaluationsLog />
                </div>
            );
        }

        return null;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">التقييم اليومي</h2>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'text-amber-600 border-b-2 border-amber-600'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {renderTabContent()}

            {/* Assessment Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>
                            {activeTab === 'flight'
                                ? `تقييم السروح - خلية #${hives.find(h => h.id === selectedHive)?.hiveNumber}`
                                : activeTab === 'pollen'
                                    ? `تقييم حبوب اللقاح - خلية #${hives.find(h => h.id === selectedHive)?.hiveNumber}`
                                    : weatherSource === 'auto' ? 'جلب بيانات الطقس تلقائياً' : 'تسجيل بيانات الطقس يدوياً'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {activeTab === 'weather' ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="weather-date">التاريخ</Label>
                                    <Input id="weather-date" type="date" value={assessmentData.date}
                                        onChange={(e) => setAssessmentData({ ...assessmentData, date: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>نوع البيانات</Label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="weatherSource" value="auto"
                                                checked={weatherSource === 'auto'}
                                                onChange={() => setWeatherSource('auto')}
                                                className="accent-amber-600" />
                                            <span>تلقائي - جلب من Open-Meteo</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="weatherSource" value="manual"
                                                checked={weatherSource === 'manual'}
                                                onChange={() => setWeatherSource('manual')}
                                                className="accent-amber-600" />
                                            <span>يدوي - إدخال البيانات</span>
                                        </label>
                                    </div>
                                </div>
                                {weatherSource === 'auto' && (
                                    <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg text-sm text-sky-800">
                                        سيتم جلب بيانات الطقس لهذا التاريخ تلقائياً من خدمة Open-Meteo
                                        {!apiaryLocation.hasRealLocation && (
                                            <p className="mt-1 text-amber-700">⚠️ المنحل لا يملك إحداثيات محددة — سيتم استخدام إحداثيات الرياض الافتراضية</p>
                                        )}
                                    </div>
                                )}
                                {weatherSource === 'manual' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="weather-time">الوقت</Label>
                                            <Input id="weather-time" type="time" value={assessmentData.time}
                                                onChange={(e) => setAssessmentData({ ...assessmentData, time: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="temperature">درجة الحرارة (°C)</Label>
                                            <Input id="temperature" type="number" placeholder={`افتراضي: ${weatherData?.temperature ?? ''}`}
                                                value={assessmentData.temperature}
                                                onChange={(e) => setAssessmentData({ ...assessmentData, temperature: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="rainfall">هطول الأمطار (مم)</Label>
                                            <Input id="rainfall" type="number" step="0.1" placeholder={`افتراضي: ${weatherData?.rainfall ?? ''}`}
                                                value={assessmentData.rainfall}
                                                onChange={(e) => setAssessmentData({ ...assessmentData, rainfall: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">ملاحظات</Label>
                                            <Input id="notes" placeholder="أي ملاحظات إضافية عن الطقس"
                                                value={assessmentData.notes}
                                                onChange={(e) => setAssessmentData({ ...assessmentData, notes: e.target.value })} />
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="date">تاريخ التقييم</Label>
                                    <Input id="date" type="date" value={assessmentData.date}
                                        onChange={(e) => setAssessmentData({ ...assessmentData, date: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time">الساعة</Label>
                                    <Input id="time" type="time" value={assessmentData.time}
                                        onChange={(e) => setAssessmentData({ ...assessmentData, time: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">مدة التقييم (دقيقة)</Label>
                                    <Input id="duration" type="number" min="1" value={assessmentData.duration}
                                        onChange={(e) => setAssessmentData({ ...assessmentData, duration: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="beeCount">
                                        {activeTab === 'flight' ? 'عدد النحل الخارج' : 'عدد النحل الحامل لحبوب اللقاح'}
                                    </Label>
                                    <Input id="beeCount" type="number" min="0"
                                        placeholder={activeTab === 'flight' ? 'عدد النحل الذي خرج خلال المدة المحددة' : 'عدد النحل الحامل لحبوب اللقاح'}
                                        value={assessmentData.beeCount}
                                        onChange={(e) => setAssessmentData({ ...assessmentData, beeCount: e.target.value })} />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                        <Button onClick={handleSave}>
                            {activeTab === 'weather' && weatherSource === 'auto' ? 'جلب وحفظ' : `حفظ ${activeTab === 'weather' ? 'البيانات' : 'التقييم'}`}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
