import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useHives, useSplitHive } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GitFork, Loader2, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SplitHivePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const apiaryId = searchParams.get('apiaryId');

    const { data: allHives = [], isLoading: loading } = useHives(apiaryId || '');
    const hives = allHives.filter((h: any) => h.status === 'ACTIVE');

    const splitHiveMutation = useSplitHive();
    const [submitting, setSubmitting] = useState(false);
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

    const selectedMotherHiveId = watch('motherHiveId');
    const motherHive = hives.find((h: any) => h.id === selectedMotherHiveId);

    async function onSubmit(data: any) {
        if (!apiaryId) return;

        setSubmitting(true);
        try {
            // Prepare payload
            const payload = {
                apiaryId,
                motherHiveId: data.motherHiveId,
                splitDate: new Date().toISOString(),
                newHivesCount: parseInt(data.newHivesCount),
                method: data.method,
                resourceDistribution: {}, // Simplified for now
                notes: data.notes,
                newHivesData: Array.from({ length: parseInt(data.newHivesCount) }).map((_, i) => ({
                    name: `${motherHive?.name || 'Mother'} - Split ${i + 1}`,
                    hiveType: motherHive?.hiveType || 'LANGSTROTH'
                }))
            };

            await splitHiveMutation.mutateAsync(payload);
            navigate(`/operations?apiaryId=${apiaryId}`);
        } catch (e) {
            console.error(e);
            alert("فشلت عملية التقسيم");
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
                    <GitFork className="w-6 h-6 text-blue-600" />
                    تقسيم خلية
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>تفاصيل العملية</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-2">
                            <Label>الخلية الأم (المصدر)</Label>
                            <Select onValueChange={(val) => setValue('motherHiveId', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الخلية..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {hives.map((hive: any) => (
                                        <SelectItem key={hive.id} value={hive.id}>
                                            {hive.hiveNumber} - {hive.name} ({hive.framesPerBox} إطارات)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>عدد التقسيمات الجديدة</Label>
                                <Input type="number" min="1" max="5" defaultValue="1" {...register('newHivesCount')} />
                            </div>
                            <div className="space-y-2">
                                <Label>طريقة التقسيم</Label>
                                <Select onValueChange={(val) => setValue('method', val)} defaultValue="WALK_AWAY">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WALK_AWAY">Walk Away</SelectItem>
                                        <SelectItem value="SWARM_CONTROL">Swarm Control</SelectItem>
                                        <SelectItem value="QUEEN_REARING">Queen Rearing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>ملاحظات</Label>
                            <Input {...register('notes')} placeholder="أي تفاصيل إضافية..." />
                        </div>

                        {selectedMotherHiveId && (
                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertTitle className="text-blue-800">ملخص العملية</AlertTitle>
                                <AlertDescription className="text-blue-600">
                                    سيتم إنشاء {watch('newHivesCount') || 1} خلايا جديدة مشتقة من الخلية {motherHive?.hiveNumber}.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            تنفيذ التقسيم
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
