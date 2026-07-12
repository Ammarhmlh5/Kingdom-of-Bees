// 📦 BatchesPage
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBatches, createBatch } from "@/services/traceability";
import { getMyHarvests } from "@/services/harvest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QrCode, Plus, Loader2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function BatchesPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [harvests, setHarvests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedHarvests, setSelectedHarvests] = useState<string[]>([]);
    const [bestBeforeDate, setBestBeforeDate] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [bData, hData] = await Promise.all([getBatches(), getMyHarvests()]);
            setBatches(bData);
            setHarvests(hData);
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    async function handleCreate() {
        if (selectedHarvests.length === 0 || !bestBeforeDate) return;
        setSubmitting(true);
        try {
            // Simple logic: Sum up quantity of selected harvests for now
            // In real app, user might partial select. Here assume full harvest used.
            const totalKg = harvests
                .filter(h => selectedHarvests.includes(h.id))
                .reduce((sum, h) => sum + Number(h.totalYieldKg || 0), 0);

            await createBatch({
                harvestRecordIds: selectedHarvests,
                totalQuantityKg: totalKg,
                bestBeforeDate: new Date(bestBeforeDate)
            });
            setDialogOpen(false);
            setSelectedHarvests([]);
            setBestBeforeDate("");
            loadData();
        } catch (e) {
            console.error(e);
            alert("فشل إنشاء الدفعة");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <QrCode className="w-8 h-8 text-blue-600" />
                    تتبع المنتج (Traceability)
                </h1>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <Plus className="w-4 h-4" /> إنشاء دفعة إنتاج
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>إنشاء دفعة جديدة</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">اختر الحصاد (يمكن اختيار متعدد)</label>
                                <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                                    {harvests.map(h => (
                                        <div key={h.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedHarvests.includes(h.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedHarvests([...selectedHarvests, h.id]);
                                                    else setSelectedHarvests(selectedHarvests.filter(id => id !== h.id));
                                                }}
                                            />
                                            <span className="text-sm">
                                                {new Date(h.harvestDate).toLocaleDateString()} - {h.apiary?.name} ({h.totalYieldKg} كجم)
                                            </span>
                                        </div>
                                    ))}
                                    {harvests.length === 0 && <p className="text-gray-400 text-sm">لا يوجد حصاد متاح</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">تاريخ انتهاء الصلاحية (Best Before)</label>
                                <Input type="date" value={bestBeforeDate} onChange={e => setBestBeforeDate(e.target.value)} />
                            </div>
                            <Button className="w-full bg-blue-600" onClick={handleCreate} disabled={submitting}>
                                {submitting ? <Loader2 className="animate-spin" /> : "توليد الدفعة والباركود"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map(batch => (
                    <Card key={batch.id} className="hover:shadow-lg transition-shadow border-blue-100">
                        <CardHeader className="flex flex-row justify-between items-start pb-2">
                            <div>
                                <CardTitle className="font-mono text-lg">{batch.batchCode}</CardTitle>
                                <p className="text-xs text-gray-400">تاريخ الحصاد: {new Date(batch.harvestDate).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">RAW</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-700 mb-4">{batch.totalQuantityKg} <span className="text-sm font-normal text-gray-400">كجم</span></div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to={`/traceability/batches/${batch.id}`}>
                                    التفاصيل وطباعة QR <ArrowRight className="w-4 h-4 mr-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {!loading && batches.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg text-gray-400">
                        لم يتم إنشاء أي دفعات بعد. ابدأ بتحويل الحصاد إلى منتجات قابلة للتتبع.
                    </div>
                )}
            </div>
        </div >
    );
}
