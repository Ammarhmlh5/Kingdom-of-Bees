import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HiveTemplate, getHiveTemplates } from '@/services/hiveTemplates';
import { createApiary } from '@/services/apiaries';
import { getHives, Hive } from '@/services/hives';
import { SetupModal } from '@/components/hives/SetupModal';
import { MapPin, ArrowRight, ArrowLeft, Check, Box, Info, Loader2, CheckCircle2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import L from 'leaflet';

// Fix leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface WizardProps {
    onClose: () => void;
    onSuccess: () => void;
}

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function CreateApiaryWizard({ onClose, onSuccess }: WizardProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<HiveTemplate[]>([]);

    // Form Data
    const [location, setLocation] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([24.7136, 46.6753]);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [details, setDetails] = useState({
        name: '',
        type: 'STATIONARY', // STATIONARY or MIGRATORY
        workerCount: 0,
        establishedDate: new Date().toISOString().split('T')[0]
    });
    const [hivesConfig, setHivesConfig] = useState<{ templateId: string; count: number; name: string }[]>([]);

    const [createdApiaryId, setCreatedApiaryId] = useState<string | null>(null);
    const [hives, setHives] = useState<Hive[]>([]);
    const [configuredHiveIds, setConfiguredHiveIds] = useState<Set<string>>(new Set());
    const [selectedHiveForSetup, setSelectedHiveForSetup] = useState<{ id: string; number: string } | null>(null);
    const [loadingHives, setLoadingHives] = useState(false);

    useEffect(() => {
        getHiveTemplates().then(data => setTemplates(data || []));
    }, []);

    // Update map center when location is set
    useEffect(() => {
        if (location) {
            setMapCenter(location);
        }
    }, [location]);

    const handleAddHiveConfig = (templateId: string, count: number) => {
        const template = templates.find(t => t.id === templateId);
        if (template && count > 0) {
            setHivesConfig([...hivesConfig, { templateId, count, name: template.name }]);
        }
    };

    const handleRemoveHiveConfig = (index: number) => {
        setHivesConfig(hivesConfig.filter((_, i) => i !== index));
    };

    const getCurrentLocation = () => {
        setIsGettingLocation(true);
        setLocationError('');

        if (!navigator.geolocation) {
            setLocationError('المتصفح لا يدعم تحديد الموقع الجغرافي.');
            setIsGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation([latitude, longitude]);
                setIsGettingLocation(false);
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError('تم رفض إذن تحديد الموقع. يرجى النقر على الخريطة.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('معلومات الموقع غير متوفرة. يرجى النقر على الخريطة.');
                        break;
                    case error.TIMEOUT:
                        setLocationError('انتهت مهلة تحديد الموقع. يرجى المحاولة مجدداً.');
                        break;
                    default:
                        setLocationError('حدث خطأ أثناء تحديد الموقع.');
                }
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = async () => {
        if (!location) {
            alert('يرجى تحديد موقع المنحل على الخريطة');
            return;
        }
        setLoading(true);

        try {
            const result = await createApiary({
                name: details.name,
                type: details.type,
                locationLat: location[0],
                locationLng: location[1],
                establishedDate: new Date(details.establishedDate),
                workerCount: details.workerCount,
                hivesConfig: hivesConfig.map(c => ({ templateId: c.templateId, count: c.count }))
            });

            const apiaryId = result?.data?.id || result?.id;
            if (!apiaryId) {
                alert('فشل إنشاء المنحل');
                return;
            }

            setCreatedApiaryId(apiaryId);
            setLoadingHives(true);
            const hivesData = await getHives(apiaryId);
            setHives(Array.isArray(hivesData) ? hivesData : []);
            setStep(5);
        } catch (error) {
            console.error(error);
            alert('حدث خطأ أثناء إنشاء المنحل');
        } finally {
            setLoading(false);
            setLoadingHives(false);
        }
    };

    const steps = [
        { number: 1, title: 'الموقع' },
        { number: 2, title: 'التفاصيل' },
        { number: 3, title: 'الخلايا' },
        { number: 4, title: 'مراجعة' },
        { number: 5, title: 'تهيئة الخلايا' }
    ];

    const unconfiguredHives = hives.filter(h => !configuredHiveIds.has(h.id));

    return (
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" dir="rtl">
            {/* Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">إنشاء منحل جديد</h2>
                    <p className="text-gray-500 text-sm mt-1">الخطوة {step} من 5: {steps[step - 1].title}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    ✕
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2">
                <div
                    className="bg-brand-600 h-2 transition-all duration-300"
                    style={{ width: `${(step / 5) * 100}%` }}
                ></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {step === 1 && (
                    <div className="space-y-4 flex flex-col">
                        <div className="bg-brand-50 p-4 rounded-xl flex gap-3 text-brand-800 text-sm justify-between items-center">
                            <div className="flex gap-3">
                                <MapPin className="w-5 h-5 shrink-0" />
                                <p>قم بالنقر على الخريطة لتحديد موقع المنحل بدقة.</p>
                            </div>
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                تحديد الموقع إلزامي 🔴
                            </span>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-gray-200 relative" style={{ height: '400px' }}>
                            <MapContainer
                                center={mapCenter}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                className="h-full w-full"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                {location && <LocationMarker position={location} setPosition={setLocation} />}
                            </MapContainer>
                            {!location && (
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                                    <div className="bg-white px-6 py-3 rounded-full shadow-lg text-sm font-bold animate-bounce">
                                        اختر الموقع على الخريطة
                                    </div>
                                </div>
                            )}
                            <Button
                                onClick={getCurrentLocation}
                                disabled={isGettingLocation}
                                className="absolute bottom-4 right-4 z-[500] bg-brand-600 hover:bg-brand-700 text-white shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-bold"
                            >
                                {isGettingLocation ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        جاري التحديد...
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="w-4 h-4" />
                                        تحديد بالموقع الحالي
                                    </>
                                )}
                            </Button>
                        </div>
                        {locationError && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                    <span className="text-red-600 font-bold">!</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-red-800 font-medium">{locationError}</p>
                                </div>
                                <button
                                    onClick={() => setLocationError('')}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 max-w-md mx-auto">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">اسم المنحل</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                value={details.name}
                                onChange={e => setDetails({ ...details, name: e.target.value })}
                                placeholder="مثال: منحل الوادي الشمالي"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">نوع المنحل</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    className={`p-4 rounded-xl border-2 transition-all ${details.type === 'STATIONARY' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-100 hover:border-gray-200'}`}
                                    onClick={() => setDetails({ ...details, type: 'STATIONARY' })}
                                >
                                    <div className="font-bold">ثابت</div>
                                    <div className="text-xs opacity-70 mt-1">لا يتم نقله</div>
                                </button>
                                <button
                                    className={`p-4 rounded-xl border-2 transition-all ${details.type === 'MIGRATORY' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-100 hover:border-gray-200'}`}
                                    onClick={() => setDetails({ ...details, type: 'MIGRATORY' })}
                                >
                                    <div className="font-bold">متنقل</div>
                                    <div className="text-xs opacity-70 mt-1">يتم نقله للمراعي</div>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ التأسيس</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                value={details.establishedDate}
                                onChange={e => setDetails({ ...details, establishedDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">عدد العمال (تقريبي)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                value={details.workerCount}
                                onChange={e => setDetails({ ...details, workerCount: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8">
                        {templates.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium mb-4">لا توجد قوالب خلايا معرفة.</p>
                                <p className="text-sm text-gray-400">يرجى إضافة قوالب من صفحة الإعدادات أولاً.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-4">إضافة خلايا</h3>
                                    <div className="space-y-4">
                                        {templates.map(template => (
                                            <div key={template.id} className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:border-brand-200 transition-colors">
                                                <div>
                                                    <div className="font-bold text-gray-900">{template.name}</div>
                                                    <div className="text-xs text-gray-500">{template.type}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-center font-bold"
                                                        id={`input-${template.id}`}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const input = document.getElementById(`input-${template.id}`) as HTMLInputElement;
                                                            const count = parseInt(input.value);
                                                            if (count > 0) {
                                                                handleAddHiveConfig(template.id, count);
                                                                input.value = '';
                                                            }
                                                        }}
                                                        className="bg-brand-600 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-brand-700 font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 h-fit">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Box className="w-5 h-5" />
                                        ملخص الخلايا
                                    </h3>
                                    {hivesConfig.length === 0 ? (
                                        <p className="text-gray-400 text-sm text-center py-4">لم يتم إضافة أي خلايا بعد</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {hivesConfig.map((config, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-lg flex justify-between items-center shadow-sm">
                                                    <span className="font-medium text-gray-700">{config.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-brand-100 text-brand-800 px-2 py-1 rounded-md text-xs font-bold">{config.count} خلية</span>
                                                        <button
                                                            onClick={() => handleRemoveHiveConfig(idx)}
                                                            className="text-red-400 hover:text-red-600 text-sm"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold text-gray-900">
                                                <span>المجموع الكلي</span>
                                                <span>{hivesConfig.reduce((acc, curr) => acc + curr.count, 0)} خلية</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === 4 && (
                    <div className="max-w-xl mx-auto space-y-8 text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900">جاهز للإنشاء!</h2>
                        <p className="text-gray-500 text-lg">يرجى مراجعة البيانات أدناه قبل التأكيد.</p>

                        <div className="bg-gray-50 rounded-2xl p-6 text-right space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">اسم المنحل</span>
                                <span className="font-bold text-gray-900">{details.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">الموقع</span>
                                <span className="font-bold text-gray-900" dir="ltr">
                                    {location ? `${location[0].toFixed(4)}, ${location[1].toFixed(4)}` : 'لم يتم التحديد (افتراضي)'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">النوع</span>
                                <span className="font-bold text-gray-900">{details.type === 'STATIONARY' ? 'ثابت' : 'متنقل'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">عدد العمال</span>
                                <span className="font-bold text-gray-900">{details.workerCount}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-4">
                                <span className="text-gray-500">عدد الخلايا</span>
                                <span className="font-bold text-brand-600">{hivesConfig.reduce((acc, curr) => acc + curr.count, 0)} خلية</span>
                            </div>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-6">
                        <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3 text-green-800 border border-green-200">
                            <CheckCircle2 className="w-6 h-6 shrink-0" />
                            <div>
                                <p className="font-bold text-base">تم إنشاء المنحل بنجاح!</p>
                                <p className="text-sm opacity-80">قم بتهيئة الخلايا أدناه. الخلايا المكتملة ستختفي تلقائياً.</p>
                            </div>
                        </div>

                        {loadingHives ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                <span className="mr-3 text-gray-600 font-medium">جاري تحميل الخلايا...</span>
                            </div>
                        ) : hives.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">لا توجد خلايا للتهيئة</p>
                                <p className="text-sm text-gray-400 mt-1">لم يتم إضافة أي خلايا عند إنشاء المنحل.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 text-lg">الخلايا المتبقية للتهيئة</h3>
                                    <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                                        {configuredHiveIds.size} من {hives.length} تمت
                                    </span>
                                </div>

                                {unconfiguredHives.length === 0 ? (
                                    <div className="text-center py-16 bg-green-50 rounded-2xl border-2 border-green-200">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-green-800">تم تهيئة جميع الخلايا!</h3>
                                        <p className="text-green-600 mt-2">يمكنك الآن المتابعة لإدارة المنحل.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {unconfiguredHives.map(hive => (
                                            <div key={hive.id} className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:border-amber-200 hover:shadow-sm transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 font-bold">
                                                        {hive.hiveNumber}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900">خلية {hive.hiveNumber}</span>
                                                        <span className="text-gray-500 mr-2 text-sm">
                                                            {hive.type as string === 'TRADITIONAL' ? 'بلدي' : 'حديثة'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedHiveForSetup({ id: hive.id, number: hive.hiveNumber })}
                                                    className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    تهيئة
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white p-6 border-t border-gray-100 flex justify-between">
                {step === 5 ? (
                    <>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            إنهاء لاحقاً
                        </button>
                        <button
                            onClick={() => {
                                if (createdApiaryId) {
                                    navigate(`/apiary/${createdApiaryId}/hives`);
                                }
                                onSuccess();
                            }}
                            className="bg-brand-600 hover:bg-brand-700 text-white px-10 py-3 rounded-xl font-black transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2"
                        >
                            <Check size={18} />
                            الذهاب للمنحل
                        </button>
                    </>
                ) : (
                    <>
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <ArrowRight size={18} />
                                السابق
                            </button>
                        ) : <div></div>}

                        {step < 4 ? (
                            <button
                                onClick={() => {
                                    if (step === 1 && !location) {
                                        setLocationError('يرجى تحديد موقع المنحل على الخريطة قبل المتابعة.');
                                        return;
                                    }
                                    if (step === 2 && !details.name) return alert('يرجى إدخال اسم المنحل');
                                    setStep(step + 1);
                                }}
                                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                            >
                                التالي
                                <ArrowLeft size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-brand-600 hover:bg-brand-700 text-white px-10 py-3 rounded-xl font-black transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'جاري الإنشاء...' : 'تأكيد وإنشاء'}
                                {!loading && <Check size={18} />}
                            </button>
                        )}
                    </>
                )}
            </div>

            {selectedHiveForSetup && createdApiaryId && (
                <SetupModal
                    hiveId={selectedHiveForSetup.id}
                    apiaryId={createdApiaryId}
                    isOpen={true}
                    onClose={() => setSelectedHiveForSetup(null)}
                    onSuccess={() => {
                        setConfiguredHiveIds(prev => {
                            const next = new Set(Array.from(prev));
                            next.add(selectedHiveForSetup.id);
                            return next;
                        });
                        setSelectedHiveForSetup(null);
                    }}
                    hiveNumber={selectedHiveForSetup.number}
                />
            )}
        </div>
    );
}
