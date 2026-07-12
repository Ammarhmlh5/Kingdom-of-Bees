import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Combine, AlertTriangle } from "lucide-react";
import { mergeHives } from "@/services/hives";

interface MergeHivesDialogProps {
    weakHive: any;
    availableHives: any[];
    onClose: () => void;
    onSuccess: () => void;
}

export function MergeHivesDialog({ weakHive, availableHives, onClose, onSuccess }: MergeHivesDialogProps) {
    const [targetHiveId, setTargetHiveId] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const handleMerge = async () => {
        if (!targetHiveId) return;

        setIsSaving(true);
        try {
            await mergeHives(weakHive.id, { targetHiveId }, weakHive.apiaryId);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to merge hives:", error);
            alert("فشل دمج الخلايا. حاول مرة أخرى.");
        } finally {
            setIsSaving(false);
        }
    };

    const strongHives = availableHives.filter(h =>
        h.id !== weakHive.id &&
        (h.condition === 'EXCELLENT' || h.condition === 'VERY_GOOD' || h.condition === 'GOOD')
    );

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Combine className="w-5 h-5" />
                        دمج الخلية الضعيفة #{weakHive.hiveNumber}
                    </DialogTitle>
                    <DialogDescription>
                        اختر خلية قوية لدمج هذه الخلية معها لإنقاذ النحل والملكة.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Warning Alert */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">تحذير هام:</p>
                            <p>عملية الدمج ستؤدي إلى إزالة الخلية #{weakHive.hiveNumber} من السجلات. تأكد من نقل جميع الإطارات والنحل قبل التأكيد.</p>
                        </div>
                    </div>

                    {/* Source Hive Info */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-red-900">الخلية المصدر (الضعيفة)</span>
                            <Badge variant="destructive">ضعيفة</Badge>
                        </div>
                        <p className="text-lg font-bold text-red-700">خلية #{weakHive.hiveNumber}</p>
                        <p className="text-xs text-red-600 mt-1">الحالة: {weakHive.condition === 'WEAK' ? 'ضعيفة' : 'حرجة'}</p>
                    </div>

                    {/* Target Hive Selection */}
                    <div className="space-y-2">
                        <Label>اختر الخلية المستقبلة (القوية)</Label>
                        <Select value={targetHiveId} onValueChange={(v: string) => setTargetHiveId(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر خلية قوية..." />
                            </SelectTrigger>
                            <SelectContent>
                                {strongHives.length === 0 ? (
                                    <div className="p-4 text-center text-slate-500 text-sm">
                                        لا توجد خلايا قوية متاحة للدمج
                                    </div>
                                ) : (
                                    strongHives.map(hive => (
                                        <SelectItem key={hive.id} value={hive.id}>
                                            خلية #{hive.hiveNumber} - {hive.condition === 'EXCELLENT' ? 'ممتازة' : hive.condition === 'VERY_GOOD' ? 'جيدة جداً' : 'جيدة'}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">سيتم نقل جميع إطارات ونحل الخلية الضعيفة إلى الخلية المختارة.</p>
                    </div>

                    {/* Method Info */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-800">
                            <strong>طريقة الدمج الموصى بها:</strong> استخدم طريقة "الورق الجرائدي" لتجنب القتال بين النحل. ضع ورقة جرائد مثقوبة بين الصندوقين.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button
                        onClick={handleMerge}
                        disabled={!targetHiveId || isSaving}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isSaving ? "جاري الدمج..." : "تأكيد الدمج"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
