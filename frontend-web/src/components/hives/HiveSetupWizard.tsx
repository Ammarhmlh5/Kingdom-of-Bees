import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle, Save, ArrowLeft, ArrowRight, Dna, Loader2 } from "lucide-react";
import { setupHiveAnalysis, getHives, Hive } from "@/services/hives";

// Types
interface HiveSetupData {
    hiveNumber: string;
    type: string;
    queen: {
        source: string;
        breed: string;
        year: string;
        isMarked: boolean;
    };
    strength: string;
    frames: {
        total: number;
        brood: number;
        honey: number;
        pollen: number;
    };
}

export function HiveSetupWizard({ apiaryId, onClose }: { apiaryId: string; onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [selectedHives, setSelectedHives] = useState<string[]>([]); // Hive IDs to setup
    const [isSaving, setIsSaving] = useState(false);
    const [hives, setHives] = useState<Hive[]>([]);
    const [loadingHives, setLoadingHives] = useState(true);

    // Load real hives from API
    useEffect(() => {
        const fetchHives = async () => {
            try {
                setLoadingHives(true);
                const data = await getHives();
                // Filter hives for this apiary
                const apiaryHives = data.filter((h: any) => h.apiaryId === apiaryId);
                setHives(apiaryHives);
            } catch (error) {
                console.error("Failed to load hives:", error);
            } finally {
                setLoadingHives(false);
            }
        };
        fetchHives();
    }, [apiaryId]);

    // Temporary State for current hive being edited
    const [currentHiveData, setCurrentHiveData] = useState<HiveSetupData>({
        hiveNumber: '',
        type: 'MODERN',
        queen: { source: 'LOCAL', breed: 'UNKNOWN', year: new Date().getFullYear().toString(), isMarked: false },
        strength: 'GOOD',
        frames: { total: 10, brood: 3, honey: 2, pollen: 1 }
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Loop through selected hives and save setup data for each
            // In a real scenario, you might want to bulk create or handle individually based on UI
            // For now, we assume currentHiveData applies to the first selected or just one

            const promises = selectedHives.map((hiveId: any) =>
                setupHiveAnalysis(hiveId, currentHiveData, apiaryId)
            );

            await Promise.all(promises);

            onClose(); // Close wizard on success
            // Show success feedback via parent refresh
            window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'تم حفظ إعدادات الخلية بنجاح' } }));
        } catch (error) {
            console.error("Failed to save hive setup:", error);
            window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'فشل حفظ الإعدادات. يرجى المحاولة مرة أخرى.' } }));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border-2 border-amber-500/20">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                                <Dna className="w-6 h-6 text-amber-600" />
                                تهيئة الخلايا (Hive Setup)
                            </CardTitle>
                            <CardDescription className="text-amber-700 mt-1">
                                إدخال البيانات التفصيلية للخلايا لبدء المحاكاة الذكية
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={step >= 1 ? "default" : "outline"} className="h-8 w-8 rounded-full flex items-center justify-center p-0 text-lg">1</Badge>
                            <Separator className="w-8 shrink-0" />
                            <Badge variant={step >= 2 ? "default" : "outline"} className="h-8 w-8 rounded-full flex items-center justify-center p-0 text-lg">2</Badge>
                            <Separator className="w-8 shrink-0" />
                            <Badge variant={step >= 3 ? "default" : "outline"} className="h-8 w-8 rounded-full flex items-center justify-center p-0 text-lg">3</Badge>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <ScrollArea className="flex-1 p-6 bg-white">
                    <div className="max-w-3xl mx-auto space-y-8">

                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-semibold text-slate-800">اختيار الخلايا للتهيئة</h3>
                                    <p className="text-muted-foreground">حدد الخلايا التي تريد إدخال بياناتها التفصيلية الآن.</p>
                                </div>

                                {loadingHives ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                                        <span className="mr-3 text-slate-600">جاري تحميل الخلايا...</span>
                                    </div>
                                ) : hives.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                                        <p>لا توجد خلايا في هذا المنحل</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {hives.map((hive) => (
                                            <Button
                                                key={hive.id}
                                                variant={selectedHives.includes(hive.id) ? "default" : "outline"}
                                                className="h-20 text-lg font-bold border-2 flex-col"
                                                onClick={() => {
                                                    setSelectedHives(prev =>
                                                        prev.includes(hive.id)
                                                            ? prev.filter((h: any) => h !== hive.id)
                                                            : [...prev, hive.id]
                                                    );
                                                }}
                                            >
                                                <span>خلية #{hive.hiveNumber}</span>
                                                {selectedHives.includes(hive.id) && <CheckCircle2 className="mt-1 h-5 w-5 text-green-300" />}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-semibold text-slate-800">بيانات التكوين والملكة</h3>
                                    <p className="text-muted-foreground">أدخل المواصفات الأساسية للخلايا المحددة.</p>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>نوع الخلية</Label>
                                        <Select defaultValue="MODERN">
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر النوع" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MODERN">خلية حديثة (Langstroth)</SelectItem>
                                                <SelectItem value="TRADITIONAL">خلية بلدي (Traditional)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>سلالة الملكة</Label>
                                        <Select defaultValue="UNKNOWN">
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر السلالة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CARNIOLAN">كرنيولي (Carniolan)</SelectItem>
                                                <SelectItem value="ITALIAN">إيطالي (Italian)</SelectItem>
                                                <SelectItem value="LOCAL">بلدي محسن (Local)</SelectItem>
                                                <SelectItem value="UNKNOWN">غير معروف</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>سنة الملكة</Label>
                                        <Select defaultValue="2025">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2026">2026 (جديدة)</SelectItem>
                                                <SelectItem value="2025">2025</SelectItem>
                                                <SelectItem value="2024">2024</SelectItem>
                                                <SelectItem value="OLD">قديمة (&lt;2023)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-semibold text-slate-800">تفاصيل الإطارات (Digital Twin)</h3>
                                    <p className="text-muted-foreground">حدد محتوى الإطارات لتقدير قوة الخلية بدقة.</p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300">
                                    <div className="grid gap-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <Label className="text-base">عدد إطارات الحضنة (Brood)</Label>
                                                <span className="font-mono font-bold text-amber-600 bg-amber-100 px-2 rounded">{currentHiveData.frames.brood}</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="10"
                                                className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                value={currentHiveData.frames.brood}
                                                onChange={(e) => setCurrentHiveData({ ...currentHiveData, frames: { ...currentHiveData.frames, brood: parseInt(e.target.value) } })}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <Label className="text-base">عدد إطارات العسل (Honey)</Label>
                                                <span className="font-mono font-bold text-amber-600 bg-amber-100 px-2 rounded">{currentHiveData.frames.honey}</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="10"
                                                className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                value={currentHiveData.frames.honey}
                                                onChange={(e) => setCurrentHiveData({ ...currentHiveData, frames: { ...currentHiveData.frames, honey: parseInt(e.target.value) } })}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <Label className="text-base">عدد إطارات حبوب اللقاح (Pollen)</Label>
                                                <span className="font-mono font-bold text-amber-600 bg-amber-100 px-2 rounded">{currentHiveData.frames.pollen}</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="10"
                                                className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                value={currentHiveData.frames.pollen}
                                                onChange={(e) => setCurrentHiveData({ ...currentHiveData, frames: { ...currentHiveData.frames, pollen: parseInt(e.target.value) } })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Auto-Classification Preview */}
                                <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-900">التصنيف المتوقع</p>
                                            <p className="text-sm text-green-700">بناءً على المعطيات: <span className="font-bold">ممتازة (Excellent)</span></p>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-500 hover:bg-green-600 text-lg px-4 py-1">92%</Badge>
                                </div>
                            </div>
                        )}

                    </div>
                </ScrollArea>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
                    <Button variant="ghost" onClick={step === 1 ? onClose : handleBack} size="lg">
                        {step === 1 ? 'إلغاء' : <><ArrowRight className="ml-2 w-4 h-4" /> السابق </>}
                    </Button>

                    <Button
                        onClick={step === 3 ? handleSave : handleNext}
                        size="lg"
                        disabled={isSaving}
                        className="bg-amber-500 hover:bg-amber-600 text-white min-w-[150px]"
                    >
                        {isSaving ? (
                            <>جاري الحفظ...</>
                        ) : step === 3 ? (
                            <><Save className="mr-2 w-4 h-4" /> حفظ وإكمال</>
                        ) : (
                            <>التالي <ArrowLeft className="mr-2 w-4 h-4 ml-2" /></>
                        )}
                    </Button>
                </div>

            </Card>
        </div>
    );
}
