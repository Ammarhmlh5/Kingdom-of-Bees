import { useState } from 'react';
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
import { Loader2, Plus } from 'lucide-react';
import { createHive } from '@/services/hives';
import { toast } from 'sonner';

interface CreateHiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    apiaryId?: string;
    nextHiveNumber?: number;
    nextNucNumber?: number;
}

export default function CreateHiveModal({ isOpen, onClose, onSuccess, apiaryId, nextHiveNumber = 1, nextNucNumber = 1 }: CreateHiveModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [langstrothCount, setLangstrothCount] = useState(0);
    const [traditionalCount, setTraditionalCount] = useState(0);
    const [nucCount, setNucCount] = useState(0);
    const [error, setError] = useState('');

    const resetForm = () => {
        setLangstrothCount(0);
        setTraditionalCount(0);
        setNucCount(0);
        setError('');
        setIsSaving(false);
    };

    const total = langstrothCount + traditionalCount + nucCount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!apiaryId) {
            setError('خطأ: لم يتم تحديد المنحل');
            return;
        }

        if (total === 0) {
            setError('الرجاء إدخال عدد الخلايا المراد إنشاؤها');
            return;
        }

        setIsSaving(true);
        try {
            let num = nextHiveNumber;
            const created: string[] = [];

            for (let i = 0; i < langstrothCount; i++) {
                const h = await createHive(apiaryId, {
                    hiveNumber: String(num++).padStart(3, '0'),
                    hiveType: 'LANGSTROTH',
                    status: 'ACTIVE',
                });
                created.push(h?.id || '');
            }

            for (let i = 0; i < traditionalCount; i++) {
                const h = await createHive(apiaryId, {
                    hiveNumber: String(num++).padStart(3, '0'),
                    hiveType: 'BALADI',
                    status: 'ACTIVE',
                });
                created.push(h?.id || '');
            }

            for (let i = 0; i < nucCount; i++) {
                const h = await createHive(apiaryId, {
                    hiveNumber: `n${String(nextNucNumber + i).padStart(3, '0')}`,
                    hiveType: 'LANGSTROTH',
                    status: 'ACTIVE',
                    framesPerBox: 5,
                });
                created.push(h?.id || '');
            }

            toast.success(`تم إنشاء ${created.length} خلية بنجاح`);
            resetForm();
            onSuccess();
            onClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'حدث خطأ غير متوقع';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Plus className="w-6 h-6 text-green-600" />
                        إضافة خلايا جديدة
                    </DialogTitle>
                    <DialogDescription>
                        أدخل أعداد الخلايا حسب الأنواع. ستظهر في تبويب "تهيئة خلايا" لتعبئة بياناتها.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <Label className="font-bold text-blue-900 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                                لانجستروث
                            </Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={langstrothCount}
                                onChange={e => setLangstrothCount(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-24 text-center font-bold"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <Label className="font-bold text-amber-900 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                                بلدي
                            </Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={traditionalCount}
                                onChange={e => setTraditionalCount(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-24 text-center font-bold"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                            <Label className="font-bold text-green-900 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                                نويات
                            </Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={nucCount}
                                onChange={e => setNucCount(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-24 text-center font-bold"
                            />
                        </div>
                    </div>

                    {total > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <span className="text-gray-600">المجموع: </span>
                            <span className="font-black text-xl text-gray-900">{total}</span>
                            <span className="text-gray-600 mr-1">خلايا</span>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => { resetForm(); onClose(); }}
                            disabled={isSaving}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isSaving || total === 0}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الإنشاء...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 ml-2" />
                                    حفظ
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
