import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Settings, AlertTriangle } from 'lucide-react';
import { setupHiveAnalysis } from '@/services/hives';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface SetupModalProps {
    hiveId: string;
    apiaryId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    hiveNumber?: string;
}

export function SetupModal({
    hiveId,
    apiaryId,
    isOpen,
    onClose,
    onSuccess,
    hiveNumber,
}: SetupModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [hiveType, setHiveType] = useState('MODERN');
    const [queenSource, setQueenSource] = useState('UNKNOWN');
    const [queenBreed, setQueenBreed] = useState('UNKNOWN');
    const [queenYear, setQueenYear] = useState(new Date().getFullYear().toString());
    const [queenMarked, setQueenMarked] = useState(false);
    const [queenMarkColor, setQueenMarkColor] = useState('#FFFFFF');
    const [strength, setStrength] = useState('GOOD');
    const [totalFrames, setTotalFrames] = useState(10);
    const [broodFrames, setBroodFrames] = useState(3);
    const [honeyFrames, setHoneyFrames] = useState(2);
    const [pollenFrames, setPollenFrames] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setHiveType('MODERN');
            setQueenSource('UNKNOWN');
            setQueenBreed('UNKNOWN');
            setQueenYear(new Date().getFullYear().toString());
            setQueenMarked(false);
            setQueenMarkColor('#FFFFFF');
            setStrength('GOOD');
            setTotalFrames(10);
            setBroodFrames(3);
            setHoneyFrames(2);
            setPollenFrames(1);
            setIsSaving(false);
        }
    }, [isOpen]);

    const remainingFrames = totalFrames - broodFrames - honeyFrames - pollenFrames;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (totalFrames <= 0) {
            toast.error('عدد الإطارات الإجمالي يجب أن يكون أكبر من صفر');
            return;
        }

        if (remainingFrames < 0) {
            toast.error('مجموع الإطارات الموزعة يتجاوز العدد الإجمالي');
            return;
        }

        setIsSaving(true);
        try {
            await setupHiveAnalysis(hiveId, {
                hiveNumber: hiveNumber || '',
                type: hiveType,
                queen: {
                    source: queenSource,
                    breed: queenBreed,
                    year: queenYear,
                    isMarked: queenMarked,
                    markColor: queenMarked ? queenMarkColor : undefined,
                },
                strength,
                frames: {
                    total: totalFrames,
                    brood: broodFrames,
                    honey: honeyFrames,
                    pollen: pollenFrames,
                },
            }, apiaryId);

            toast.success('تم تهيئة الخلية بنجاح');
            onSuccess();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            logger.error('فشل تهيئة الخلية', { error });
            toast.error(err.response?.data?.error || 'فشل تهيئة الخلية');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Settings className="w-6 h-6 text-amber-600" />
                        تهيئة الخلية
                        {hiveNumber && (
                            <span className="text-lg font-normal text-gray-500">
                                - خلية {hiveNumber}
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        أدخل البيانات التفصيلية للخلية لبدء المحاكاة الذكية
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isSaving && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                                <span className="text-sm text-gray-600">جاري حفظ التهيئة...</span>
                            </div>
                        </div>
                    )}

                    {/* Hive Type & Strength */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="space-y-2">
                            <Label>نوع الخلية</Label>
                            <Select value={hiveType} onValueChange={setHiveType}>
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
                            <Label>قوة الخلية</Label>
                            <Select value={strength} onValueChange={setStrength}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر القوة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EXCELLENT">ممتازة</SelectItem>
                                    <SelectItem value="GOOD">جيدة</SelectItem>
                                    <SelectItem value="FAIR">متوسطة</SelectItem>
                                    <SelectItem value="WEAK">ضعيفة</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Queen Info */}
                    <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-900">بيانات الملكة</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>مصدر الملكة</Label>
                                <Select value={queenSource} onValueChange={setQueenSource}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر المصدر" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BRED">مرباة محلياً (Bred)</SelectItem>
                                        <SelectItem value="PURCHASED">مشتراة (Purchased)</SelectItem>
                                        <SelectItem value="SWARM">من طرد (Swarm)</SelectItem>
                                        <SelectItem value="SPLIT">من تقسيم (Split)</SelectItem>
                                        <SelectItem value="UNKNOWN">غير معروف</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>سلالة الملكة</Label>
                                <Select value={queenBreed} onValueChange={setQueenBreed}>
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
                                <Select value={queenYear} onValueChange={setQueenYear}>
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
                            <div className="space-y-2">
                                <Label>وسم الملكة</Label>
                                <div className="flex items-center gap-3 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={queenMarked}
                                            onChange={(e) => setQueenMarked(e.target.checked)}
                                            className="w-4 h-4 text-purple-600 rounded"
                                        />
                                        <span className="text-sm">موسومة</span>
                                    </label>
                                    {queenMarked && (
                                        <input
                                            type="color"
                                            value={queenMarkColor}
                                            onChange={(e) => setQueenMarkColor(e.target.value)}
                                            className="w-8 h-8 p-0.5 border rounded cursor-pointer"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Frame Distribution */}
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900">توزيع الإطارات</h3>
                        <div className="space-y-2">
                            <Label>إجمالي عدد الإطارات</Label>
                            <Input
                                type="number"
                                min="1"
                                max="24"
                                value={totalFrames}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    setTotalFrames(val);
                                }}
                                className="w-32"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>إطارات الحضنة (Brood)</Label>
                                    <span className="font-mono font-bold text-amber-600 bg-amber-100 px-2 rounded">
                                        {broodFrames}
                                    </span>
                                </div>
                                <input
                                    type="range" min="0" max={totalFrames}
                                    className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    value={broodFrames}
                                    onChange={(e) => setBroodFrames(parseInt(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>إطارات العسل (Honey)</Label>
                                    <span className="font-mono font-bold text-yellow-600 bg-yellow-100 px-2 rounded">
                                        {honeyFrames}
                                    </span>
                                </div>
                                <input
                                    type="range" min="0" max={totalFrames - broodFrames}
                                    className="w-full accent-yellow-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    value={honeyFrames}
                                    onChange={(e) => setHoneyFrames(parseInt(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>إطارات حبوب اللقاح (Pollen)</Label>
                                    <span className="font-mono font-bold text-orange-600 bg-orange-100 px-2 rounded">
                                        {pollenFrames}
                                    </span>
                                </div>
                                <input
                                    type="range" min="0" max={totalFrames - broodFrames - honeyFrames}
                                    className="w-full accent-orange-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    value={pollenFrames}
                                    onChange={(e) => setPollenFrames(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        {remainingFrames >= 0 && (
                            <div className="text-sm text-gray-500 pt-2 border-t border-blue-100">
                                الإطارات المتبقية (فارغة): <span className="font-bold">{remainingFrames}</span>
                            </div>
                        )}
                        {remainingFrames < 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-700">
                                    مجموع الإطارات الموزعة يتجاوز العدد الإجمالي
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            className="bg-amber-600 hover:bg-amber-700"
                            disabled={isSaving || remainingFrames < 0}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <Settings className="w-4 h-4 ml-2" />
                                    حفظ التهيئة
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
