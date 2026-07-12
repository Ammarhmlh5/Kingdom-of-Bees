import { useState } from 'react';
import { Plus, Settings, MapPin, Calendar, Boxes, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fetchWithAuth } from '@/config';

export function HiveTemplatesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        date: '',
        type: 'fixed',
        hivesLangstroth: 0,
        hivesTraditional: 0,
        hivesNuc: 0
    });

    const handleSubmit = async () => {
        if (!formData.name) {
            alert("يرجى إدخال اسم المنحل");
            return;
        }

        try {
            const payload = {
                name: formData.name,
                address: formData.location,
                establishedDate: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
                type: formData.type.toUpperCase(),
                hivesCounts: {
                    langstroth: formData.hivesLangstroth,
                    traditional: formData.hivesTraditional,
                    nuc: formData.hivesNuc
                }
            };

            const response = await fetchWithAuth('/apiaries', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'فشل في حفظ المنحل');
            }

            // Success
            alert('تم حفظ المنحل بنجاح!');
            setIsDialogOpen(false);

            // Reset form
            setFormData({
                name: '',
                location: '',
                date: '',
                type: 'fixed',
                hivesLangstroth: 0,
                hivesTraditional: 0,
                hivesNuc: 0
            });

            // Reload to show updates (temporary until state management refactor)
            window.location.reload();

        } catch (error: any) {
            console.error(error);
            alert(error.message || 'حدث خطأ أثناء الحفظ');
        }
    };

    return (
        <div className="space-y-8" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">الإعدادات</h1>
                    <p className="text-muted-foreground">إدارة إعدادات المنصة والمناحل.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Apiary Management Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            إدارة المناحل
                        </CardTitle>
                        <CardDescription>إضافة وتعديل بيانات المناحل</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto bg-primary text-secondary font-bold hover:bg-primary/90">
                                    <Plus className="w-4 h-4 ml-2" />
                                    إضافة منحل جديد
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] text-right" dir="rtl">
                                <DialogHeader className="text-right">
                                    <DialogTitle>إضافة منحل جديد</DialogTitle>
                                    <DialogDescription>
                                        أدخل بيانات المنحل الجديد بدقة. يجب أن يكون اسم المنحل فريداً.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    {/* Name */}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">اسم المنحل</Label>
                                        <Input
                                            id="name"
                                            className="col-span-3"
                                            placeholder="مثال: منحل الوادي الذهبي"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    {/* Location */}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="location" className="text-right">الموقع</Label>
                                        <Input
                                            id="location"
                                            className="col-span-3"
                                            placeholder="المنطقة، المدينة"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>

                                    {/* Date */}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="date" className="text-right">تاريخ التأسيس</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            className="col-span-3"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>

                                    {/* Type */}
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="type" className="text-right">نوع المنحل</Label>
                                        <div className="col-span-3">
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            >
                                                <option value="fixed">ثابت</option>
                                                <option value="mobile">متحرك</option>
                                                <option value="mixed">مختلط</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Hives */}
                                    <div className="grid grid-cols-4 gap-4 items-start border-t pt-4 mt-2">
                                        <Label className="text-right pt-2">أعداد الخلايا</Label>
                                        <div className="col-span-3 grid gap-3">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs text-muted-foreground w-24">لانجستروث:</Label>
                                                <Input
                                                    type="number"
                                                    className="h-8"
                                                    value={formData.hivesLangstroth}
                                                    onChange={(e) => setFormData({ ...formData, hivesLangstroth: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs text-muted-foreground w-24">بلدي / تقليدي:</Label>
                                                <Input
                                                    type="number"
                                                    className="h-8"
                                                    value={formData.hivesTraditional}
                                                    onChange={(e) => setFormData({ ...formData, hivesTraditional: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs text-muted-foreground w-24">نويات (Nucs):</Label>
                                                <Input
                                                    type="number"
                                                    className="h-8"
                                                    value={formData.hivesNuc}
                                                    onChange={(e) => setFormData({ ...formData, hivesNuc: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="submit" onClick={handleSubmit}>حفظ المنحل</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/* Other Settings Placeholders */}
                <Card className="opacity-70">
                    <CardHeader>
                        <CardTitle>إعدادات الحساب</CardTitle>
                        <CardDescription>تفضيلات المستخدم (قريباً)</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
