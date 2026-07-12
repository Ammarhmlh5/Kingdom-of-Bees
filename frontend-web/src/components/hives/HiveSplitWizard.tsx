import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Scissors, ArrowRight, ArrowLeft, Save, Copy, Box } from "lucide-react";
import { splitHive } from "@/services/hives";

interface HiveSplitWizardProps {
    sourceHive: any; // Type should be Hive but using any for flexibility during dev
    onClose: () => void;
    onSuccess: () => void;
}

export function HiveSplitWizard({ sourceHive, onClose, onSuccess }: HiveSplitWizardProps) {
    const [step, setStep] = useState(1);
    const [splitStrategy, setSplitStrategy] = useState<'EVEN' | 'NUC'>('EVEN');
    const [newHiveData, setNewHiveData] = useState({
        number: '',
        queenType: 'CELL', // Cell, Virgin, Mated
        boxCount: 1
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await splitHive(sourceHive.id, {
                strategy: splitStrategy,
                newHiveNumber: newHiveData.number,
                queenType: newHiveData.queenType
            }, sourceHive.apiaryId);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to split hive:", error);
            alert("فشل تقسيم الخلية. حاول مرة أخرى.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-3xl h-auto max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-2 border-green-500/20">

                {/* Header */}
                <div className="p-6 bg-green-50 border-b border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold text-green-900 flex items-center gap-2">
                                <Scissors className="w-6 h-6 text-green-600" />
                                معالج تقسيم الخلية #{sourceHive?.hiveNumber || '???'}
                            </CardTitle>
                            <CardDescription className="text-green-700 mt-1">
                                دليل خطوة بخطوة لتقسيم الخلية بأمان وضمان نجاح القسمة
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={step >= 1 ? "default" : "outline"} className={`h-8 w-8 rounded-full flex items-center justify-center p-0 text-lg ${step >= 1 ? 'bg-green-600' : ''}`}>1</Badge>
                            <Separator className="w-8 shrink-0" />
                            <Badge variant={step >= 2 ? "default" : "outline"} className={`h-8 w-8 rounded-full flex items-center justify-center p-0 text-lg ${step >= 2 ? 'bg-green-600' : ''}`}>2</Badge>
                            <Separator className="w-8 shrink-0" />
                            <Badge variant={step >= 3 ? "default" : "outline"} className={`h-8 w-8 rounded-full flex items-center justify-center p-0 text-lg ${step >= 3 ? 'bg-green-600' : ''}`}>3</Badge>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 p-6 bg-white">
                    <div className="max-w-2xl mx-auto space-y-8">

                        {/* Step 1: Strategy */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-slate-800">اختر استراتيجية التقسيم</h3>
                                    <p className="text-slate-500">كيف تريد توزيع الإطارات والنحل؟</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setSplitStrategy('EVEN')}
                                        className={`cursor-pointer p-6 rounded-xl border-2 transition-all hover:bg-green-50 ${splitStrategy === 'EVEN' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-slate-200'}`}
                                    >
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-2xl">⚖️</div>
                                        <h4 className="font-bold text-lg mb-2">قسمة متساوية</h4>
                                        <p className="text-sm text-slate-500">توزيع الإطارات (الحضنة والعسل) بالتساوي بين الخليتين. الأمثل عند الرغبة في خليتين قويتين.</p>
                                    </div>

                                    <div
                                        onClick={() => setSplitStrategy('NUC')}
                                        className={`cursor-pointer p-6 rounded-xl border-2 transition-all hover:bg-green-50 ${splitStrategy === 'NUC' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-slate-200'}`}
                                    >
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-2xl">📦</div>
                                        <h4 className="font-bold text-lg mb-2">نواة صغيرة (Nuc)</h4>
                                        <p className="text-sm text-slate-500">أخذ 3-4 إطارات فقط لإنشاء نواة جديدة، والإبقاء على الخلية الأم قوية للإنتاج.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: New Hive Config */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-slate-800">بيانات الخلية الجديدة</h3>
                                    <p className="text-slate-500">أدخل رقم وتفاصيل الخلية الناتجة عن التقسيم</p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-xl border border-dashed hover:border-solid border-slate-300 transition-all">
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <Label>رقم الخلية الجديدة</Label>
                                            <Input
                                                placeholder="مثلاً: 12-B"
                                                value={newHiveData.number}
                                                onChange={(e) => setNewHiveData({ ...newHiveData, number: e.target.value })}
                                                className="text-lg font-mono"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>حالة الملكة في القسمة</Label>
                                            <Select
                                                value={newHiveData.queenType}
                                                onValueChange={(v: string) => setNewHiveData({ ...newHiveData, queenType: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CELL">بيت ملكي (Queen Cell)</SelectItem>
                                                    <SelectItem value="VIRGIN">ملكة عذراء (Virgin Queen)</SelectItem>
                                                    <SelectItem value="MATED">ملكة ملقحة (Mated Queen)</SelectItem>
                                                    <SelectItem value="EGG">بيض (تربية ذاتية)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-slate-400">سيتم تسجيل التاريخ تلقائياً لحساب موعد التلقيح.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmation (Visual) */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-slate-800">مراجعة وتأكيد التقسيم</h3>
                                    <p className="text-slate-500">سيتم تحديث سجلات المنحل بناءً على هذا التوزيع</p>
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    {/* Source */}
                                    <div className="w-32 p-4 bg-amber-50 rounded-xl border border-amber-200 text-center opacity-70">
                                        <Box className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                                        <div className="font-bold text-amber-900">الأم #{sourceHive.hiveNumber}</div>
                                        <div className="text-xs text-amber-700 mt-1">
                                            {splitStrategy === 'EVEN' ? '5 إطارات' : '7 إطارات'}
                                        </div>
                                    </div>

                                    <ArrowRight className="text-slate-300" />

                                    {/* Target */}
                                    <div className="w-32 p-4 bg-green-50 rounded-xl border-2 border-green-500 text-center shadow-lg transform scale-105">
                                        <Box className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                        <div className="font-bold text-green-900">الجديدة #{newHiveData.number || '???'}</div>
                                        <div className="text-xs text-green-700 mt-1">
                                            {splitStrategy === 'EVEN' ? '5 إطارات' : '3 إطارات'}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-lg flex gap-3 text-sm text-yellow-800 border border-yellow-200">
                                    <div className="shrink-0 text-2xl">💡</div>
                                    <p>
                                        <strong>تذكير ذكي:</strong> بناءً على اختيارك "{newHiveData.queenType === 'CELL' ? 'بيت ملكي' : 'ملكة عذراء'}"، سيقوم النظام بإنشاء تنبيه للكشف عن التلقيح بعد {newHiveData.queenType === 'CELL' ? '12' : '7'} يوم.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
                    <Button variant="ghost" onClick={step === 1 ? onClose : handleBack} size="lg">
                        {step === 1 ? 'إلغاء' : 'السابق'}
                    </Button>

                    <Button
                        onClick={step === 3 ? handleSave : handleNext}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]"
                        disabled={step === 2 && !newHiveData.number}
                    >
                        {step === 3 ? <><Save className="mr-2 w-4 h-4" /> تأكيد التقسيم</> : <>التالي <ArrowLeft className="mr-2 w-4 h-4 ml-2" /></>}
                    </Button>
                </div>

            </Card>
        </div>
    );
}
