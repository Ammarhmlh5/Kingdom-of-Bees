import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowUp, Layers } from "lucide-react";
import { addSuperToHive } from "@/services/hives";

interface AddSuperDialogProps {
    hive: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddSuperDialog({ hive, onClose, onSuccess }: AddSuperDialogProps) {
    const [formData, setFormData] = useState({
        type: 'HONEY', // HONEY, DEEP
        frames: '10',
        hasExcluder: true,
        operationType: 'ADD_SECOND_STORY' as 'ADD_SECOND_STORY' | 'ADD_THIRD_STORY' | 'ADD_EXCLUDER',
        targetStory: 2 as 2 | 3,
        framesInSuper: 10
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await addSuperToHive(hive.id, formData, hive.apiaryId);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to add super:", error);
            alert("فشل إضافة العاسلة. حاول مرة أخرى.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <ArrowUp className="w-5 h-5" />
                        رفع عاسلة للخلية #{hive.hiveNumber}
                    </DialogTitle>
                    <DialogDescription>
                        إضافة طابق جديد للتوسع أو جمع العسل.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right col-span-1">النوع</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(v: string) => setFormData({ ...formData, type: v })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HONEY">عاسلة (Medium/Shallow)</SelectItem>
                                <SelectItem value="DEEP">صندوق حضنة (Deep)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right col-span-1">الإطارات</Label>
                        <Select
                            value={formData.frames}
                            onValueChange={(v: string) => setFormData({ ...formData, frames: v })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 إطارات</SelectItem>
                                <SelectItem value="9">9 إطارات (تخزين أكبر)</SelectItem>
                                <SelectItem value="8">8 إطارات</SelectItem>
                                <SelectItem value="0">فارغة (شمع أساس)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Layers className="w-4 h-4 text-slate-500" />
                            <Label htmlFor="excluder-mode">إضافة حاجز ملكات</Label>
                        </div>
                        <Switch
                            id="excluder-mode"
                            checked={formData.hasExcluder}
                            onCheckedChange={(c) => setFormData({ ...formData, hasExcluder: c })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 text-white">
                        {isSaving ? "جاري الإضافة..." : "تأكيد الإضافة"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
