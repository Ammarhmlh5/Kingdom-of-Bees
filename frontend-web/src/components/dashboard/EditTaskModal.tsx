import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ApiaryTask, TaskType, UpdateTaskData } from '@/services/apiaryTasks';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (taskId: string, data: UpdateTaskData) => Promise<void>;
    task: ApiaryTask | null;
    hives?: Array<{ id: string; name: string; hiveNumber: string }>;
}

export function EditTaskModal({
    isOpen,
    onClose,
    onSubmit,
    task,
    hives = []
}: EditTaskModalProps) {
    const [formData, setFormData] = useState<UpdateTaskData>({
        title: '',
        description: '',
        taskType: TaskType.INSPECTION,
        priority: 5,
        scheduledDate: '',
        dueDate: '',
        hiveId: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                taskType: task.taskType,
                priority: task.priority,
                scheduledDate: task.scheduledDate ? task.scheduledDate.split('T')[0] : '',
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                hiveId: task.hiveId || ''
            });
        }
    }, [task]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title?.trim()) {
            newErrors.title = 'عنوان المهمة مطلوب';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate() || !task) return;

        setSubmitting(true);
        try {
            await onSubmit(task.id, {
                ...formData,
                title: formData.title?.trim(),
                description: formData.description?.trim() || undefined,
                scheduledDate: formData.scheduledDate || undefined,
                dueDate: formData.dueDate || undefined,
                hiveId: formData.hiveId || undefined
            });
            onClose();
        } catch (error) {
            console.error('Error updating task:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!task) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>تعديل المهمة</DialogTitle>
                    <DialogDescription>
                        تعديل تفاصيل المهمة
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <Label htmlFor="title">عنوان المهمة *</Label>
                        <Input
                            id="title"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="عنوان المهمة"
                            className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">الوصف</Label>
                        <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="وصف المهمة (اختياري)"
                            rows={3}
                        />
                    </div>

                    {/* Task Type */}
                    <div>
                        <Label>نوع المهمة</Label>
                        <Select
                            value={formData.taskType}
                            onValueChange={(value: string) => setFormData({ ...formData, taskType: value as TaskType })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TaskType.INSPECTION}>فحص</SelectItem>
                                <SelectItem value={TaskType.FEEDING}>تغذية</SelectItem>
                                <SelectItem value={TaskType.TREATMENT}>علاج</SelectItem>
                                <SelectItem value={TaskType.HARVEST}>حصاد</SelectItem>
                                <SelectItem value={TaskType.MAINTENANCE}>صيانة</SelectItem>
                                <SelectItem value={TaskType.OTHER}>أخرى</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority */}
                    <div>
                        <Label htmlFor="priority">الأولوية (1-10)</Label>
                        <Input
                            id="priority"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.priority || 5}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
                        />
                    </div>

                    {/* Scheduled Date */}
                    <div>
                        <Label htmlFor="scheduledDate">تاريخ الجدولة</Label>
                        <Input
                            id="scheduledDate"
                            type="date"
                            value={formData.scheduledDate || ''}
                            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        />
                    </div>

                    {/* Due Date */}
                    <div>
                        <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={formData.dueDate || ''}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </div>

                    {/* Hive */}
                    {hives.length > 0 && (
                        <div>
                            <Label>الخلية</Label>
                            <Select
                                value={formData.hiveId || 'none'}
                                onValueChange={(value: string) => setFormData({ ...formData, hiveId: value === 'none' ? '' : value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر خلية (اختياري)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">بدون خلية محددة</SelectItem>
                                    {hives.map((hive) => (
                                        <SelectItem key={hive.id} value={hive.id}>
                                            خلية #{hive.hiveNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
