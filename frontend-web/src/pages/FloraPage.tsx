import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApiaryPlants, useSearchPlants, useAddLocalPlant, useUpdateLocalPlant, useRemoveLocalPlant } from "@/hooks/api";
import { plantsService } from "@/services/plants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Flower2, Plus, Trash2, Search, Calendar, MapPin, Circle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const directions = [
    { value: '', label: 'اختر الاتجاه' },
    { value: 'شمال', label: 'شمال' },
    { value: 'شمال شرق', label: 'شمال شرق' },
    { value: 'شرق', label: 'شرق' },
    { value: 'جنوب شرق', label: 'جنوب شرق' },
    { value: 'جنوب', label: 'جنوب' },
    { value: 'جنوب غرب', label: 'جنوب غرب' },
    { value: 'غرب', label: 'غرب' },
    { value: 'شمال غرب', label: 'شمال غرب' },
];

function BloomStatusBadge({ status }: { status?: string }) {
    if (status === 'BLOOMING') {
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Circle className="w-2 h-2 fill-yellow-500" /> في طور الإزهار</span>;
    }
    if (status === 'ENDED') {
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Circle className="w-2 h-2 fill-red-500" /> انتهى الإزهار</span>;
    }
    return <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Circle className="w-2 h-2 fill-gray-400" /> لم يبدأ</span>;
}

export function FloraPage() {
    const [searchParams] = useSearchParams();
    const apiaryId = searchParams.get('apiaryId');

    const { data: plants = [], isLoading: loading, refetch: loadPlants } = useApiaryPlants(apiaryId || '');
    const addPlantMutation = useAddLocalPlant();
    const updatePlantMutation = useUpdateLocalPlant();
    const removePlantMutation = useRemoveLocalPlant();

    // Search & Add
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Add form fields
    const [bloomStartDate, setBloomStartDate] = useState("");
    const [distanceKm, setDistanceKm] = useState("");
    const [direction, setDirection] = useState("");

    async function handleSearch() {
        if (!query.trim()) return;
        setSearching(true);
        try {
            const res = await plantsService.searchPlants(query);
            setSearchResults(res);
        } catch (e) {
            console.error(e);
        } finally {
            setSearching(false);
        }
    }

    async function handleAdd(plant: any) {
        try {
            await addPlantMutation.mutateAsync({
                apiaryId: apiaryId!,
                plantId: plant.id,
                coverage: 10,
                coverageUnit: 'PERCENTAGE',
                distanceKm: distanceKm ? Number(distanceKm) : undefined,
                direction: direction || undefined,
                bloomStartDate: bloomStartDate || undefined,
            });
            setDialogOpen(false);
            setBloomStartDate("");
            setDistanceKm("");
            setDirection("");
        } catch (e) {
            console.error(e);
            alert("فشل إضافة النبات");
        }
    }

    async function handleRemove(id: string) {
        if (!confirm("هل أنت متأكد من الحذف؟")) return;
        try {
            await removePlantMutation.mutateAsync({ apiaryId: apiaryId!, plantId: id });
        } catch (e) { console.error(e); }
    }

    async function handleStartBloom(localPlant: any) {
        const today = new Date().toISOString().split('T')[0];
        try {
            await updatePlantMutation.mutateAsync({
                apiaryId: apiaryId!,
                plantId: localPlant.id,
                bloomStartDate: today,
            });
        } catch (e) { console.error(e); }
    }

    async function handleEndBloom(localPlant: any) {
        const today = new Date().toISOString().split('T')[0];
        try {
            await updatePlantMutation.mutateAsync({
                apiaryId: apiaryId!,
                plantId: localPlant.id,
                bloomEndDate: today,
            });
        } catch (e) { console.error(e); }
    }

    function calcBloomDays(start?: string, end?: string): number | null {
        if (!start) return null;
        const s = new Date(start);
        const e = end ? new Date(end) : new Date();
        return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    }

    if (!apiaryId) return <div className="p-8 text-center">يرجى اختيار المنحل</div>;
    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Flower2 className="w-8 h-8 text-pink-500" />
                    الغطاء النباتي
                </h1>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4" />
                            إضافة نبات
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>البحث في مكتبة النباتات</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="اسم النبات (سدر، طلح...)"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                />
                                <Button variant="secondary" onClick={handleSearch} disabled={searching}>
                                    {searching ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>

                            <div className="border-t pt-3 space-y-3">
                                <h4 className="text-sm font-bold flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    موقع النبات (اختياري)
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500">المسافة (كم)</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            placeholder="مثال: 0.5"
                                            value={distanceKm}
                                            onChange={e => setDistanceKm(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">الاتجاه</label>
                                        <select
                                            value={direction}
                                            onChange={e => setDirection(e.target.value)}
                                            className="w-full h-10 px-3 border rounded-md text-sm bg-white"
                                        >
                                            {directions.map(d => (
                                                <option key={d.value} value={d.value}>{d.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-bold flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    تاريخ بدء الإزهار (اختياري)
                                </h4>
                                <Input
                                    type="date"
                                    value={bloomStartDate}
                                    onChange={e => setBloomStartDate(e.target.value)}
                                />
                            </div>

                            <div className="max-h-[250px] overflow-y-auto space-y-2">
                                {searchResults.map((p: any) => (
                                    <div key={p.id} className="flex justify-between items-center p-2 border rounded hover:bg-slate-50">
                                        <div>
                                            <div className="font-bold">{p.commonNameAr}</div>
                                            <div className="text-xs text-gray-500">{p.scientificName}</div>
                                        </div>
                                        <Button size="sm" onClick={() => handleAdd(p)}>إضافة</Button>
                                    </div>
                                ))}
                                {searchResults.length === 0 && query && !searching && (
                                    <div className="text-center text-gray-400 py-4">لا توجد نتائج. جرب اسماً آخر.</div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plants.map((localPlant: any) => {
                    const bloomDays = calcBloomDays(localPlant.bloomStartDate, localPlant.bloomEndDate);
                    return (
                        <Card key={localPlant.id} className="group relative overflow-hidden">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg">{localPlant.plant?.commonNameAr || 'نبات غير معروف'}</h3>
                                        <p className="text-sm text-gray-500 italic">{localPlant.plant?.scientificName}</p>
                                    </div>
                                    <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                                        {Number(localPlant.coverage)}%
                                    </div>
                                </div>

                                {/* Bloom Status */}
                                <div className="mb-3">
                                    <BloomStatusBadge status={localPlant.status} />
                                </div>

                                {/* Bloom Dates */}
                                <div className="space-y-1 text-xs text-gray-600">
                                    {localPlant.bloomStartDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>بداية الإزهار: {new Date(localPlant.bloomStartDate).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                    )}
                                    {localPlant.bloomEndDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>نهاية الإزهار: {new Date(localPlant.bloomEndDate).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                    )}
                                    {bloomDays !== null && (
                                        <div className="flex items-center gap-1 font-bold text-gray-700">
                                            <span>مدة الإزهار: {bloomDays} يوم</span>
                                        </div>
                                    )}
                                    {localPlant.distanceKm && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            <span>على بعد {Number(localPlant.distanceKm).toFixed(1)} كم {localPlant.direction || ''}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Bloom Actions */}
                                <div className="mt-3 flex gap-2">
                                    {!localPlant.bloomStartDate && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-yellow-700 border-yellow-300 hover:bg-yellow-50 text-xs"
                                            onClick={() => handleStartBloom(localPlant)}
                                        >
                                            تسجيل بداية الإزهار
                                        </Button>
                                    )}
                                    {localPlant.bloomStartDate && !localPlant.bloomEndDate && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-700 border-red-300 hover:bg-red-50 text-xs"
                                            onClick={() => handleEndBloom(localPlant)}
                                        >
                                            تسجيل نهاية الإزهار
                                        </Button>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-gray-500">
                                    <span>تمت الإضافة: {localPlant.addedDate ? new Date(localPlant.addedDate).toLocaleDateString('ar-SA') : '-'}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleRemove(localPlant.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {plants.length === 0 && (
                    <div className="col-span-full text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-gray-400">
                        لا توجد نباتات مسجلة في هذا المنحل. أضف النباتات المحيطة لتتبع المرعى.
                    </div>
                )}
            </div>
        </div>
    );
}
