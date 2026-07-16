import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useHives, useMergeHives } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GitMerge, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

export function MergeHivePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const apiaryId = searchParams.get('apiaryId');

    const { data: allHives = [], isLoading: loading } = useHives(apiaryId || '');
    const hives = allHives.filter((h: any) => h.status === 'ACTIVE');

    const mergeHivesMutation = useMergeHives();
    const [submitting, setSubmitting] = useState(false);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

    const survivorId = watch('survivorHiveId');
    const mergedId = watch('mergedHiveId');

    async function onSubmit(data: any) {
        if (!apiaryId) return;
        if (data.survivorHiveId === data.mergedHiveId) {
            alert("لا يمكن دمج الخلية مع نفسها!");
            return;
        }

        setSubmitting(true);
        try {
            await mergeHivesMutation.mutateAsync({
                apiaryId,
                hiveId: data.survivorHiveId,
                data: {
                    targetHiveId: data.mergedHiveId,
                    mergeMethod: data.method,
                    queenKept: 'TARGET',
                    notes: data.notes
                }
            });
            navigate(`/operations?apiaryId=${apiaryId}`);
        } catch (e) {
            console.error(e);
            alert("فشل دمج الخلايا");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowRight className="w-4 h-4" />
                </Button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <GitMerge className="w-6 h-6 text-purple-600" />
                    دمج خلايا
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>دمج خليتين</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-4 p-4 border rounded-md bg-green-50/50">
                            <Label className="text-green-800 font-bold">الخلية الناجية (Survivor)</Label>
                            <p className="text-xs text-green-600 mb-2">هذه الخلية ستبقى وتستقبل نحل وموارد الخلية الأخرى.</p>
                            <Select onValueChange={(val: any) => setValue('survivorHiveId', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الخلية الباقية..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {hives.filter((h: any) => h.id !== mergedId).map((hive: any) => (
                                        <SelectItem key={hive.id} value={hive.id}>
                                            {hive.hiveNumber} - {hive.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4 p-4 border rounded-md bg-red-50/50">
                            <Label className="text-red-800 font-bold">الخلية المضمومة (ToBe Merged)</Label>
                            <p className="text-xs text-red-600 mb-2 warning">
                                <AlertTriangle className="inline w-3 h-3 mr-1" />
                                هذه الخلية ستصبح "مدمجة" (غير نشطة) بعد العملية.
                            </p>
                            <Select onValueChange={(val: any) => setValue('mergedHiveId', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الخلية التي سيتم ضمها..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {hives.filter((h: any) => h.id !== survivorId).map((hive: any) => (
                                        <SelectItem key={hive.id} value={hive.id}>
                                            {hive.hiveNumber} - {hive.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>طريقة الدمج</Label>
                            <Select onValueChange={(val: any) => setValue('method', val)} defaultValue="NEWSPAPER">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NEWSPAPER">طريقة الجريدة (Newspaper)</SelectItem>
                                    <SelectItem value="DIRECT">مباشر (Direct)</SelectItem>
                                    <SelectItem value="SCENTED">استخدام الروائح (Scented)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>ملاحظات</Label>
                            <Textarea {...register('notes')} placeholder="ملاحظات حول العملية..." />
                        </div>

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={submitting || !survivorId || !mergedId}>
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            تأكيد الدمج
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
