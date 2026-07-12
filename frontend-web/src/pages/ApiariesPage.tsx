import { Plus, Search, MapPin, ArrowLeft, ArrowRight, Users, Activity, Briefcase, Settings, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApiaries, useUpdateApiary, useDeleteApiary } from '@/hooks/api';
import { Gauge } from '@/components/ui/Gauge';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { toast } from 'sonner';
import L from 'leaflet';

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
    useMapEvents({
        click(e: L.LeafletMouseEvent) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return position === null ? null : (
        <Marker position={position} />
    );
}

export function ApiariesPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingApiary, setEditingApiary] = useState<any>(null);
    const [newLocation, setNewLocation] = useState<[number, number] | null>(null);
    const [deletingApiary, setDeletingApiary] = useState<any>(null);

    const updateMutation = useUpdateApiary();
    const deleteMutation = useDeleteApiary();

    // Fetch real apiaries data
    const { data: apiaries = [], isLoading, isError } = useApiaries();

    // Calculate Summaries
    const totalApiaries = apiaries.length;
    const totalHives = apiaries.reduce((sum: number, apiary: any) => sum + (apiary._count?.hives || apiary.currentHiveCount || 0), 0);
    const averageHealth = 98; // Mocked for now until we have real health data

    // Filter apiaries
    const filteredApiaries = apiaries.filter((apiary: any) =>
        apiary.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apiary.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-screen text-red-600">
                <p>خطأ في تحميل المناحل</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Top Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/50 backdrop-blur-sm border-amber-100 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">إجمالي المناحل</p>
                            <h3 className="text-2xl font-bold text-slate-800">{totalApiaries}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 backdrop-blur-sm border-amber-100 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">إجمالي الخلايا</p>
                            <h3 className="text-2xl font-bold text-slate-800">{totalHives}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 backdrop-blur-sm border-amber-100 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">الصحة العامة</p>
                            <h3 className="text-2xl font-bold text-slate-800">%{averageHealth}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/40 p-4 rounded-2xl border border-white/20 backdrop-blur-md shadow-sm">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="ابحث عن منحل..."
                        className="pr-10 h-11 bg-white/60 border-slate-200 focus:border-amber-500 focus:ring-amber-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full md:w-auto">
                    <Button
                        onClick={() => navigate('/join')}
                        variant="outline"
                        className="flex-1 md:flex-none h-11 border-amber-200 text-amber-700 hover:bg-amber-50"
                    >
                        <Users className="w-4 h-4 ml-2" />
                        زيارة منحل
                    </Button>
                    <Button
                        onClick={() => navigate('/apiaries/new')}
                        className="flex-1 md:flex-none h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all"
                    >
                        <Plus className="w-4 h-4 ml-2" />
                        منحل جديد
                    </Button>
                </div>
            </div>

            {/* Apiaries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredApiaries.map((apiary: any) => (
                    <Card key={apiary.id} className="group relative overflow-visible border border-slate-100 bg-white/60 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 left-0 p-4 z-10">
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${apiary.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {apiary.isActive ? 'نشط' : 'غير نشط'}
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 p-2 z-20">
                            <button
                                onClick={() => setOpenMenuId(openMenuId === apiary.id ? null : apiary.id)}
                                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                            >
                                <Settings className="w-5 h-5 text-slate-400 hover:text-slate-700 transition-colors" />
                            </button>
                            {openMenuId === apiary.id && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                                    <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-40">
                                        <button
                                            onClick={() => {
                                                setEditingApiary(apiary);
                                                setNewLocation([apiary.locationLat || 24.7136, apiary.locationLng || 46.6753]);
                                                setOpenMenuId(null);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-right"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            تعديل الموقع
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeletingApiary(apiary);
                                                setOpenMenuId(null);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-right"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            حذف المنحل
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <CardHeader className="pb-2 pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">
                                        {apiary.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {apiary.address || (Number(apiary.locationLat) && Number(apiary.locationLng) ? `${Number(apiary.locationLat).toFixed(4)}, ${Number(apiary.locationLng).toFixed(4)}` : 'غير محدد')}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="flex items-center justify-between mb-6">
                                {/* Speedometer / Strength Gauge */}
                                <div className="flex flex-col items-center">
                                    <Gauge value={Math.floor(Math.random() * 30) + 70} size="sm" color="dynamic" label="مستوى القوة" />
                                </div>

                                {/* Stats Column */}
                                <div className="space-y-3 text-left">
                                    <div className="bg-amber-50/50 p-2 rounded-lg min-w-[100px]">
                                        <p className="text-xs text-slate-500 font-medium">الخلايا</p>
                                        <p className="text-lg font-bold text-amber-900">{apiary._count?.hives || apiary.currentHiveCount || 0}</p>
                                    </div>
                                    <div className="bg-blue-50/50 p-2 rounded-lg min-w-[100px]">
                                        <p className="text-xs text-slate-500 font-medium">التقييم</p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-lg font-bold text-blue-900">4.8</span>
                                            <span className="text-yellow-400 text-xs">★</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button asChild className="w-full bg-slate-800 hover:bg-slate-700 text-white shadow-md group-hover:bg-amber-600 group-hover:shadow-amber-500/20 transition-all duration-300">
                                <Link to={`/apiary/${apiary.id}`}>
                                    دخول للمنحل <ArrowRight className="w-4 h-4 mr-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredApiaries.length === 0 && !isLoading && (
                <div className="text-center py-20 bg-white/30 rounded-3xl border border-dashed border-slate-300">
                    <p className="text-xl text-slate-500 font-medium mb-4">لا توجد مناحل مسجلة</p>
                    <Button
                        onClick={() => navigate('/apiaries/new')}
                        variant="outline"
                        className="border-amber-500 text-amber-600 hover:bg-amber-50"
                    >
                        <Plus className="w-4 h-4 ml-2" />
                        أضف أول منحل لك
                    </Button>
                </div>
            )}

            {/* Location Edit Dialog */}
            <Dialog open={!!editingApiary} onOpenChange={(open: boolean) => { if (!open) setEditingApiary(null); }}>
                <DialogContent className="max-w-2xl" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle>تعديل موقع المنحل</DialogTitle>
                        <DialogDescription>اختر الموقع الجديد على الخريطة</DialogDescription>
                    </DialogHeader>
                    <div className="h-[350px] border rounded-xl overflow-hidden relative">
                        <div className="absolute top-2 right-2 z-[500] bg-white/80 px-2 py-1 rounded text-xs font-bold shadow-sm">
                            اختر الموقع على الخريطة
                        </div>
                        <MapContainer
                            center={newLocation || [24.7136, 46.6753]}
                            zoom={8}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                            <LocationMarker
                                position={newLocation}
                                setPosition={setNewLocation}
                            />
                        </MapContainer>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-start">
                        <Button
                            onClick={() => {
                                if (editingApiary && newLocation) {
                                    const [lat, lng] = newLocation;

                                    updateMutation.mutate(
                                        {
                                            id: editingApiary.id,
                                            data: { locationLat: lat, locationLng: lng }
                                        },
                                        {
                                            onSuccess: () => {
                                                toast.success('تم تحديث موقع المنحل بنجاح');
                                                setEditingApiary(null);

                                                fetch(
                                                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar`,
                                                    { headers: { 'User-Agent': 'KingdomOfBees/1.0' }, signal: AbortSignal.timeout(5000) }
                                                )
                                                    .then(r => r.json())
                                                    .then(geo => {
                                                        if (geo.display_name) {
                                                            updateMutation.mutate({
                                                                id: editingApiary.id,
                                                                data: { address: geo.display_name }
                                                            });
                                                        }
                                                    })
                                                    .catch(() => {});
                                            },
                                            onError: () => {
                                                toast.error('فشل تحديث موقع المنحل');
                                            }
                                        }
                                    );
                                }
                            }}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ الموقع'}
                            {!updateMutation.isPending && <Save className="w-4 h-4 mr-2" />}
                        </Button>
                        <Button variant="outline" onClick={() => setEditingApiary(null)}>إلغاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingApiary} onOpenChange={(open: boolean) => { if (!open) setDeletingApiary(null); }}>
                <DialogContent className="sm:max-w-md text-right" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-red-600">حذف المنحل نهائياً</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من رغبتك في حذف هذا المنحل؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف كافة الخلايا والسجلات المرتبطة به.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-start">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deletingApiary) {
                                    deleteMutation.mutate(deletingApiary.id, {
                                        onSuccess: () => {
                                            toast.success('تم حذف المنحل بنجاح');
                                            setDeletingApiary(null);
                                        },
                                        onError: () => {
                                            toast.error('فشل حذف المنحل');
                                        }
                                    });
                                }
                            }}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'جاري الحذف...' : 'نعم، احذف المنحل'}
                        </Button>
                        <Button variant="outline" onClick={() => setDeletingApiary(null)}>إلغاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
