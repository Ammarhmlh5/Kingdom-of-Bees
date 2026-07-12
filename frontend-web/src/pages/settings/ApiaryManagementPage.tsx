import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyApiaries, updateApiary, deleteApiary } from '@/services/apiaries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Trash2, Edit, MapPin, Globe, Lock, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
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

export default function ApiaryManagementPage() {
    const queryClient = useQueryClient();
    const [editingApiary, setEditingApiary] = useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [apiaryToDelete, setApiaryToDelete] = useState<string | null>(null);

    // Fetch Apiaries
    const { data: apiaries = [], isLoading } = useQuery({
        queryKey: ['apiaries'],
        queryFn: getMyApiaries
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateApiary(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apiaries'] });
            setEditingApiary(null);
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع';
            alert(`فشل تحديث المنحل: ${message}`);
            console.error('Update apiary error:', error);
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteApiary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apiaries'] });
            setIsDeleteDialogOpen(false);
            setApiaryToDelete(null);
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع';
            alert(`فشل حذف المنحل: ${message}`);
            console.error('Delete apiary error:', error);
        }
    });

    const handleSave = () => {
        if (!editingApiary) return;

        // Validate location
        if (!editingApiary.locationLat || !editingApiary.locationLng) {
            alert('يرجى تحديد موقع المنحل على الخريطة');
            return;
        }

        updateMutation.mutate({
            id: editingApiary.id,
            data: {
                name: editingApiary.name,
                type: editingApiary.type,
                locationLat: editingApiary.locationLat,
                locationLng: editingApiary.locationLng,
                isPublic: editingApiary.isPublic
            }
        });
    };

    if (isLoading) {
        return <div className="p-8 text-center">جاري التحميل...</div>;
    }

    return (
        <div className="container mx-auto py-8 space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">إعدادات المناحل</h1>
                    <p className="text-muted-foreground mt-1">
                        لوحة التحكم الخاصة بتكوين المناحل (الموقع، النوع، الخصوصية). هذه الإعدادات حساسة ولا تظهر للعمال.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {Array.isArray(apiaries) && apiaries.map((apiary: any) => (
                    <Card key={apiary.id} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 border-b flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {apiary.name}
                                    <Badge variant={apiary.isPublic ? "default" : "secondary"} className={apiary.isPublic ? "bg-green-600" : ""}>
                                        {apiary.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                                        {apiary.isPublic ? 'عام' : 'خاص'}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {apiary.locationLat && apiary.locationLng
                                        ? `الموقع المحدد: ${apiary.locationLat.toFixed(4)}, ${apiary.locationLng.toFixed(4)}`
                                        : 'لم يتم تحديد موقع دقيق'
                                    }
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingApiary({
                                        ...apiary,
                                        locationLat: apiary.locationLat || 24.7136,
                                        locationLng: apiary.locationLng || 46.6753
                                    })}
                                >
                                    <Edit className="w-4 h-4 ml-2" />
                                    تعديل
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        setApiaryToDelete(apiary.id);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-xs text-muted-foreground block mb-1">النوع</span>
                                <span className="font-bold">{apiary.type === 'FIXED' ? 'ثابت' : 'متنقل'}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-xs text-muted-foreground block mb-1">الخلايا</span>
                                <span className="font-bold">{apiary._count?.hives || apiary.currentHiveCount || 0} خلية</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-xs text-muted-foreground block mb-1">تاريخ التأسيس</span>
                                <span className="font-bold">{new Date(apiary.establishedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-end">
                                <Button asChild variant="link">
                                    <Link to={`/apiary/${apiary.id}`}>
                                        الانتقال للمنحل <ArrowLeft className="w-4 h-4 mr-2" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {apiaries.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground text-lg">لا توجد مناحل حالياً.</p>
                        <Button asChild className="mt-4" variant="outline">
                            <Link to="/">العودة للرئيسية</Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingApiary} onOpenChange={(open: boolean) => !open && setEditingApiary(null)}>
                <DialogContent className="max-w-3xl" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle>تعديل إعدادات المنحل</DialogTitle>
                        <DialogDescription>
                            يمكنك تعديل البيانات الحساسة للمنحل من هنا.
                        </DialogDescription>
                    </DialogHeader>

                    {editingApiary && (
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>اسم المنحل</Label>
                                    <Input
                                        value={editingApiary.name}
                                        onChange={(e) => setEditingApiary({ ...editingApiary, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>نوع المنحل</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={editingApiary.type}
                                        onChange={(e) => setEditingApiary({ ...editingApiary, type: e.target.value })}
                                    >
                                        <option value="FIXED">ثابت</option>
                                        <option value="MOBILE">متنقل</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    الخصوصية
                                    <span className="text-xs font-normal text-muted-foreground">(هل يظهر المنحل على الخريطة العامة؟)</span>
                                </Label>
                                <div className="flex items-center gap-4 border p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id="public"
                                            name="visibility"
                                            checked={editingApiary.isPublic}
                                            onChange={() => setEditingApiary({ ...editingApiary, isPublic: true })}
                                            className="w-4 h-4 text-emerald-600"
                                        />
                                        <Label htmlFor="public" className="cursor-pointer flex items-center gap-1">
                                            <Globe className="w-4 h-4 text-green-600" />
                                            عام (مرئي)
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id="private"
                                            name="visibility"
                                            checked={!editingApiary.isPublic}
                                            onChange={() => setEditingApiary({ ...editingApiary, isPublic: false })}
                                            className="w-4 h-4 text-emerald-600"
                                        />
                                        <Label htmlFor="private" className="cursor-pointer flex items-center gap-1">
                                            <Lock className="w-4 h-4 text-gray-600" />
                                            خاص (مخفي)
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[300px] border rounded-xl overflow-hidden relative">
                                <Label className="absolute top-2 right-2 z-[500] bg-white/80 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                    تحديث الموقع على الخريطة
                                </Label>
                                <MapContainer
                                    center={[editingApiary.locationLat || 24.7136, editingApiary.locationLng || 46.6753]}
                                    zoom={8}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                    <LocationMarker
                                        position={[editingApiary.locationLat, editingApiary.locationLng]}
                                        setPosition={(pos) => setEditingApiary({
                                            ...editingApiary,
                                            locationLat: pos[0],
                                            locationLng: pos[1]
                                        })}
                                    />
                                </MapContainer>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:justify-start">
                        <Button onClick={handleSave} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            {!updateMutation.isPending && <Save className="w-4 h-4 mr-2" />}
                        </Button>
                        <Button variant="outline" onClick={() => setEditingApiary(null)}>إلغاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                            onClick={() => apiaryToDelete && deleteMutation.mutate(apiaryToDelete)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'جاري الحذف...' : 'نعم، احذف المنحل'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>إلغاء</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
