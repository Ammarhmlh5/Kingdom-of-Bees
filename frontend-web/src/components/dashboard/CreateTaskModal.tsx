import { useState } from 'react';
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
import { TaskType, CreateTaskData } from '@/services/apiaryTasks';
import { Calendar } from 'lucide-react';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTaskData) => Promise<void>;
    hives?: Array<{ id: string; name: string; hiveNumber: string }>;
    loading?: boolean;
}

export function CreateTaskModal({
    isOpen,
    onClose,
    onSubmit,
    hives = [],
    loading = false
}: CreateTaskModalProps) {
    const [formData, setFormData] = useState<CreateTaskData>({
        taskType: TaskType.INSPECTION,
        title: '',
        description: '',
        priority: 5,
        scheduledDate: '',
        dueDate: '',
        hiveId: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Reset form when modal closes
    const handleClose = () => {
        setFormData({
            taskType: TaskType.INSPECTION,
            title: '',
            description: '',
            priority: 5,
            scheduledDate: '',
            dueDate: '',
            hiveId: ''
        });
        setErrors({});
        onClose();
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'العنوان مطلوب';
        }

        if (!formData.taskType) {
            newErrors.taskType = 'نوع المهمة مطلوب';
        }

        if ((formData.priority ?? 5) < 1 || (formData.priority ?? 5) > 10) {
            newErrors.priority = 'الأولوية يجب أن تكون بين 1 و 10';
        }

        if (formData.dueDate && formData.scheduledDate) {
            const scheduled = new Date(formData.scheduledDate);
            const due = new Date(formData.dueDate);
            if (due < scheduled) {
                newErrors.dueDate = 'تاريخ الاستحقاق يجب أن يكون بعد تاريخ الجدولة';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            // Clean up empty strings
            const cleanData: CreateTaskData = {
                ...formData,
                description: formData.description?.trim() || undefined,
                scheduledDate: formData.scheduledDate || undefined,
                dueDate: formData.dueDate || undefined,
                hiveId: formData.hiveId || undefined
            };

            await onSubmit(cleanData);
            handleClose();
        } catch (error) {
            console.error('Error creating task:', error);
            setErrors({ submit: 'حدث خطأ أثناء إنشاء المهمة' });
        } finally {
            setSubmitting(false);
        }
    };

    // Get task type options
    const taskTypeOptions = [
        { value: TaskType.INSPECTION, label: '🔍 فحص', icon: '🔍' },
        { value: TaskType.FEEDING, label: '🍯 تغذية', icon: '🍯' },
        { value: TaskType.OPERATION, label: '⚙️ عملية', icon: '⚙️' },
        { value: TaskType.MAINTENANCE, label: '🔧 صيانة', icon: '🔧' },
        { value: TaskType.HARVEST, label: '🌾 حصاد', icon: '🌾' },
        { value: TaskType.TREATMENT, label: '💊 علاج', icon: '💊' },
        { value: TaskType.OTHER, label: '📋 أخرى', icon: '📋' }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
                    <DialogDescription>
                        أضف مهمة جديدة للمنحل. املأ التفاصيل أدناه.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Task Type */}
                        <div className="space-y-2">
                            <Label htmlFor="taskType">
                                نوع المهمة <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.taskType}
                                onValueChange={(value: string) => 
                                    setFormData({ ...formData, taskType: value as TaskType })
                                }
                            >
                                <SelectTrigger id="taskType">
                                    <SelectValue placeholder="اختر نوع المهمة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {taskTypeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.taskType && (
                                <p className="text-sm text-red-500">{errors.taskType}</p>
                            )}
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                العنوان <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="مثال: فحص الخلية رقم 5"
                                value={formData.title}
                                onChange={(e) => 
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                className={errors.title ? 'border-red-500' : ''}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">{errors.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">الوصف</Label>
                            <Textarea
                                id="description"
                                placeholder="أضف تفاصيل إضافية عن المهمة..."
                                value={formData.description}
                                onChange={(e) => 
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                            />
                        </div>

                        {/* Priority and Hive Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Priority */}
                            <div className="space-y-2">
                                <Label htmlFor="priority">
                                    الأولوية (1-10)
                                </Label>
                                <Input
                                    id="priority"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.priority}
                                    onChange={(e) => 
                                        setFormData({ 
                                            ...formData, 
                                            priority: parseInt(e.target.value) || 5 
                                        })
                                    }
                                    className={errors.priority ? 'border-red-500' : ''}
                                />
                                {errors.priority && (
                                    <p className="text-sm text-red-500">{errors.priority}</p>
                                )}
                            </div>

                            {/* Hive Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="hive">الخلية (اختياري)</Label>
                                <Select
                                    value={formData.hiveId}
                                    onValueChange={(value: string) => 
                                        setFormData({ ...formData, hiveId: value })
                                    }
                                >
                                    <SelectTrigger id="hive">
                                        <SelectValue placeholder="اختر خلية" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">بدون خلية محددة</SelectItem>
                                        {hives.map((hive) => (
                                            <SelectItem key={hive.id} value={hive.id}>
                                                {hive.name || `خلية ${hive.hiveNumber}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dates Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Scheduled Date */}
                            <div className="space-y-2">
                                <Label htmlFor="scheduledDate">
                                    <Calendar className="w-4 h-4 inline ml-1" />
                                    تاريخ الجدولة
                                </Label>
                                <Input
                                    id="scheduledDate"
                                    type="date"
                                    value={formData.scheduledDate}
                                    onChange={(e) => 
                                        setFormData({ ...formData, scheduledDate: e.target.value })
                                    }
                                />
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">
                                    <Calendar className="w-4 h-4 inline ml-1" />
                                    تاريخ الاستحقاق
                                </Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => 
                                        setFormData({ ...formData, dueDate: e.target.value })
                                    }
                                    className={errors.dueDate ? 'border-red-500' : ''}
                                />
                                {errors.dueDate && (
                                    <p className="text-sm text-red-500">{errors.dueDate}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{errors.submit}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || loading}
                        >
                            {submitting ? 'جاري الإنشاء...' : 'إنشاء المهمة'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
