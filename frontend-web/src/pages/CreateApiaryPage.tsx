import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createApiary } from '@/services/apiaries';
import { MapPin, ArrowRight, Check, Info, LayoutGrid, Settings, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Fix leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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

export function CreateApiaryPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Unified Form Data
    const [formData, setFormData] = useState({
        name: '',
        establishedDate: new Date().toISOString().split('T')[0],
        workerCount: 0,
        langstroth: 0,
        traditional: 0,
        nuc: 0,
        type: 'FIXED',
        isPublic: false,
        location: null as [number, number] | null
    });

    const getCurrentLocation = () => {
        setIsGettingLocation(true);
        setLocationError('');

        if (!navigator.geolocation) {
            setLocationError('المتصفح لا يدعم تحديد الموقع الجغرافي');
            setIsGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData({ ...formData, location: [latitude, longitude] });
                setIsGettingLocation(false);
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError('تم رفض إذن تحديد الموقع. يرجى السماح بالوصول إلى الموقع أو تحديد الموقع يدوياً على الخريطة.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('معلومات الموقع غير متوفرة. يرجى تحديد الموقع يدوياً على الخريطة.');
                        break;
                    case error.TIMEOUT:
                        setLocationError('انتهت مهلة تحديد الموقع. يرجى المحاولة مرة أخرى أو تحديد الموقع يدوياً.');
                        break;
                    default:
                        setLocationError('حدث خطأ أثناء تحديد الموقع. يرجى تحديد الموقع يدوياً على الخريطة.');
                }
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError("يرجى إدخال اسم المنحل");
            return;
        }

        if (formData.name.length < 3) {
            setError("اسم المنحل يجب أن يكون 3 أحرف على الأقل");
            return;
        }

        if (!formData.location) {
            setError("يرجى تحديد موقع المنحل على الخريطة");
            return;
        }

        setError('');
        setLoading(true);

        try {
            const result = await createApiary({
                name: formData.name,
                establishedDate: new Date(formData.establishedDate),
                workerCount: formData.workerCount,
                type: formData.type,
                locationLat: formData.location[0],
                locationLng: formData.location[1],
                isPublic: formData.isPublic,
                hivesCounts: {
                    langstroth: formData.langstroth,
                    traditional: formData.traditional,
                    nuc: formData.nuc
                }
            });

            const apiaryId = result?.data?.id || result?.id;
            if (apiaryId) {
                navigate(`/apiary/${apiaryId}/hives`);
            } else {
                navigate('/apiaries');
            }
        } catch (error: any) {
            console.error(error);
            setError(error?.response?.data?.message || 'حدث خطأ أثناء إنشاء المنحل. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-5xl py-8 animate-in fade-in duration-500 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/apiaries')}>
                    <ArrowRight className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900">إضافة منحل جديد</h1>
                    <p className="text-muted-foreground">قم بملء البيانات التالية لتسجيل منحل جديد</p>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 font-bold">!</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-red-800 font-medium">{error}</p>
                    </div>
                    <button
                        onClick={() => setError('')}
                        className="text-red-400 hover:text-red-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Location Error Alert */}
            {locationError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right Column: Form Fields */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-emerald-500" />
                                معلومات أساسية
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">اسم المنحل</label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="مثال: منحل الوادي الذهبي"
                                    className="h-12 text-lg"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ التأسيس</label>
                                <Input
                                    type="date"
                                    value={formData.establishedDate}
                                    onChange={e => setFormData({ ...formData, establishedDate: e.target.value })}
                                    className="h-12"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hives Config */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutGrid className="w-5 h-5 text-amber-500" />
                                تكوين الخلايا (اختياري)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-3">لانجستروث</label>
                                <Input
                                    type="number"
                                    min="0"
                                    className="text-center font-bold text-lg"
                                    value={formData.langstroth}
                                    onChange={e => setFormData({ ...formData, langstroth: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="bg-amber-50 p-4 rounded-xl text-center border border-amber-100">
                                <label className="block text-sm font-bold text-amber-900 mb-3">بلدي</label>
                                <Input
                                    type="number"
                                    min="0"
                                    className="text-center font-bold text-lg border-amber-200 focus-visible:ring-amber-500"
                                    value={formData.traditional}
                                    onChange={e => setFormData({ ...formData, traditional: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                                <label className="block text-sm font-bold text-blue-900 mb-3">نويات</label>
                                <Input
                                    type="number"
                                    min="0"
                                    className="text-center font-bold text-lg border-blue-200 focus-visible:ring-blue-500"
                                    value={formData.nuc}
                                    onChange={e => setFormData({ ...formData, nuc: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-500" />
                                الإعدادات
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">نوع المنحل</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setFormData({ ...formData, type: 'FIXED' })}
                                        className={`px-3 py-3 rounded-xl text-sm font-bold transition-all border ${formData.type === 'FIXED' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        ثابت
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, type: 'MOBILE' })}
                                        className={`px-3 py-3 rounded-xl text-sm font-bold transition-all border ${formData.type === 'MOBILE' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        متنقل
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">الخصوصية</label>
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 h-[50px]">
                                    <span className="text-sm font-medium text-gray-600">
                                        {formData.isPublic ? 'عام (مرئي للجميع)' : 'خاص (مخفي)'}
                                    </span>
                                    <button
                                        onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPublic ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPublic ? 'translate-x-1' : 'translate-x-6'}`} />
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Left Column: Map & Actions */}
                <div className="space-y-6">
                    {/* Map */}
                    <Card className="overflow-hidden border-2 border-emerald-100 flex flex-col h-[400px] lg:h-auto lg:aspect-square sticky top-24">
                        <div className="absolute top-4 right-4 z-[500] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-gray-100 text-xs font-bold text-emerald-800 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            تحديد الموقع إلزامي 🔴
                        </div>
                        <Button
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                            className="absolute bottom-4 right-4 z-[500] bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-bold"
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
                        <MapContainer
                            center={[24.7136, 46.6753]}
                            zoom={6}
                            style={{ height: '100%', width: '100%', flex: 1 }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                            <LocationMarker position={formData.location} setPosition={(pos) => setFormData({ ...formData, location: pos })} />
                        </MapContainer>
                        {formData.location && (
                            <div className="bg-emerald-50 p-3 border-t border-emerald-200 text-center">
                                <p className="text-sm font-bold text-emerald-800">
                                    📍 {formData.location[0].toFixed(6)}, {formData.location[1].toFixed(6)}
                                </p>
                            </div>
                        )}
                    </Card>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-14 text-lg font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 rounded-2xl"
                    >
                        {loading ? 'جاري الحفظ...' : 'إنشاء المنحل'}
                        {!loading && <Check className="mr-2 h-6 w-6" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default CreateApiaryPage;