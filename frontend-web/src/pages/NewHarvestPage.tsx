import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useApiaries, useCreateHarvestRecord } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function NewHarvestPage() {
    const navigate = useNavigate();
    const { data: apiaries = [] } = useApiaries();
    const createHarvestMutation = useCreateHarvestRecord();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [apiaryId, setApiaryId] = useState("");
    const [harvestType, setHarvestType] = useState("HONEY");
    const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!apiaryId) {
            setError("يرجى اختيار المنحل");
            return;
        }

        setLoading(true);
        try {
            const result = await createHarvestMutation.mutateAsync({
                apiaryId,
                harvestType,
                harvestDate: new Date(harvestDate).toISOString(),
                notes,
                totalYieldKg: 0 // Initial
            });

            // Redirect to detail page to add hives
            // Assuming we will create a detail page route like /harvests/:id
            navigate(`/harvests/${result.id}`);
        } catch (err) {
            console.error(err);
            setError("فشل إنشاء سجل الحصاد");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <Droplet className="w-8 h-8 text-amber-500" />
                تسجيل حصاد جديد
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>بيانات العملية</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">المنحل</label>
                            <Select onValueChange={setApiaryId} value={apiaryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر المنحل" />
                                </SelectTrigger>
                                <SelectContent>
                                    {apiaries.map((a: any) => (
                                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">نوع الحصاد</label>
                            <Select onValueChange={setHarvestType} value={harvestType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HONEY">عسل</SelectItem>
                                    <SelectItem value="POLLEN">حبوب لقاح</SelectItem>
                                    <SelectItem value="ROYAL_JELLY">غذاء ملكي</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">التاريخ</label>
                            <Input
                                type="date"
                                value={harvestDate}
                                onChange={e => setHarvestDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">ملاحظات</label>
                            <Input
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="أي ملاحظات حول الظروف الجوية أو العملية..."
                            />
                        </div>

                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : "إنشاء وبدء التسجيل"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
