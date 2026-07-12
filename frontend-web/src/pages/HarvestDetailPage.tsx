import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHarvestRecord, useHives, useCreateHoneyHarvest, useCreatePollenHarvest } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, ArrowRight, Save, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function HarvestDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: record, isLoading: loading, refetch: loadData } = useHarvestRecord(id || '');
    const { data: hives = [] } = useHives(record?.apiary?.id || '');

    const createHoneyMutation = useCreateHoneyHarvest();
    const createPollenMutation = useCreatePollenHarvest();

    // Add Form State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedHive, setSelectedHive] = useState("");
    const [yieldKg, setYieldKg] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleAddEntry() {
        if (!selectedHive || !yieldKg) return;
        setSubmitting(true);
        try {
            const payload = {
                harvestRecordId: id,
                hiveId: selectedHive,
                yieldKg: Number(yieldKg),
                notes: ""
            };

            if (record?.harvestType === 'HONEY') {
                await createHoneyMutation.mutateAsync(payload);
            } else {
                await createPollenMutation.mutateAsync(payload);
            }

            setDialogOpen(false);
            setYieldKg("");
            setSelectedHive("");
        } catch (e) {
            console.error(e);
            alert("فشل الحفظ");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!record) return <div className="p-10 text-center">السجل غير موجود</div>;

    const entries = record.harvestType === 'HONEY' ? record.honeyHarvests : record.pollenHarvests;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/harvests')}>
                    <ArrowRight className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">تفاصيل الحصاد - {record.harvestType}</h1>
                    <p className="text-gray-500">{new Date(record.harvestDate).toLocaleDateString('ar-SA')} | {record.apiary?.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-amber-50 md:col-span-1 border-amber-200">
                    <CardHeader>
                        <CardTitle className="text-amber-800">الكمية الإجمالية</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black text-amber-600">{record.totalYieldKg} <span className="text-xl">كجم</span></div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>سجل الخلايا ({entries.length})</CardTitle>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
                                    <Plus className="w-4 h-4" />
                                    إضافة إنتاج خلية
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>تسجيل إنتاج خلية</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <label>الخلية</label>
                                        <Select onValueChange={setSelectedHive} value={selectedHive}>
                                            <SelectTrigger><SelectValue placeholder="اختر الخلية" /></SelectTrigger>
                                            <SelectContent>
                                                {hives.map((h: any) => (
                                                    <SelectItem key={h.id} value={h.id}>{h.hiveNumber} - {h.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label>الكمية (كجم)</label>
                                        <Input type="number" value={yieldKg} onChange={e => setYieldKg(e.target.value)} />
                                    </div>
                                    <Button onClick={handleAddEntry} className="w-full" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin" /> : "حفظ"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="border-b text-sm text-gray-400">
                                        <th className="py-2">رقم الخلية</th>
                                        <th className="py-2">الاسم</th>
                                        <th className="py-2">الكمية</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry: any) => (
                                        <tr key={entry.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="py-3 font-bold">{entry.hive?.hiveNumber}</td>
                                            <td className="py-3 text-gray-600">{entry.hive?.name}</td>
                                            <td className="py-3 font-bold text-amber-600">{entry.yieldKg} كجم</td>
                                        </tr>
                                    ))}
                                    {entries.length === 0 && (
                                        <tr><td colSpan={3} className="text-center py-8 text-gray-400">لا توجد سجلات بعد</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
