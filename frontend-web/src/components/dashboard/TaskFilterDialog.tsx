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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TaskType, TaskStatus, TaskFilters } from '@/services/apiaryTasks';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TaskFilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: TaskFilters) => void;
    currentFilters: TaskFilters;
    hives?: Array<{ id: string; name: string; hiveNumber: string }>;
}

export function TaskFilterDialog({
    isOpen,
    onClose,
    onApply,
    currentFilters,
    hives = []
}: TaskFilterDialogProps) {
    const [filters, setFilters] = useState<TaskFilters>(currentFilters);

    // Update local filters when currentFilters change
    useEffect(() => {
        setFilters(currentFilters);
    }, [currentFilters]);

    // Handle apply filters
    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    // Handle reset filters
    const handleReset = () => {
        const emptyFilters: TaskFilters = {};
        setFilters(emptyFilters);
        onApply(emptyFilters);
        onClose();
    };

    // Count active filters
    const activeFilterCount = Object.keys(filters).filter(
        key => filters[key as keyof TaskFilters] !== undefined && filters[key as keyof TaskFilters] !== ''
    ).length;

    // Task status options
    const statusOptions = [
        { value: TaskStatus.PENDING, label: 'قيد الانتظار', icon: '⏳' },
        { value: TaskStatus.IN_PROGRESS, label: 'قيد التنفيذ', icon: '🔄' },
        { value: TaskStatus.COMPLETED, label: 'مكتمل', icon: '✅' },
        { value: TaskStatus.OVERDUE, label: 'متأخر', icon: '⚠️' },
        { value: TaskStatus.CANCELLED, label: 'ملغي', icon: '❌' }
    ];

    // Task type options
    const taskTypeOptions = [
        { value: TaskType.INSPECTION, label: 'فحص', icon: '🔍' },
        { value: TaskType.FEEDING, label: 'تغذية', icon: '🍯' },
        { value: TaskType.OPERATION, label: 'عملية', icon: '⚙️' },
        { value: TaskType.MAINTENANCE, label: 'صيانة', icon: '🔧' },
        { value: TaskType.HARVEST, label: 'حصاد', icon: '🌾' },
        { value: TaskType.TREATMENT, label: 'علاج', icon: '💊' },
        { value: TaskType.OTHER, label: 'أخرى', icon: '📋' }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>تصفية المهام</span>
                        {activeFilterCount > 0 && (
                            <Badge variant="secondary">
                                {activeFilterCount} {activeFilterCount === 1 ? 'فلتر' : 'فلاتر'}
                            </Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        اختر الفلاتر لتضييق نطاق المهام المعروضة
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="status-filter">الحالة</Label>
                        <Select
                            value={filters.status || ''}
                            onValueChange={(value) => 
                                setFilters({ 
                                    ...filters, 
                                    status: value ? value as TaskStatus : undefined 
                                })
                            }
                        >
                            <SelectTrigger id="status-filter">
                                <SelectValue placeholder="جميع الحالات" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">جميع الحالات</SelectItem>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="ml-2">{option.icon}</span>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Task Type Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="type-filter">نوع المهمة</Label>
                        <Select
                            value={filters.taskType || ''}
                            onValueChange={(value) => 
                                setFilters({ 
                                    ...filters, 
                                    taskType: value ? value as TaskType : undefined 
                                })
                            }
                        >
                            <SelectTrigger id="type-filter">
                                <SelectValue placeholder="جميع الأنواع" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">جميع الأنواع</SelectItem>
                                {taskTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="ml-2">{option.icon}</span>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Hive Filter */}
                    {hives.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="hive-filter">الخلية</Label>
                            <Select
                                value={filters.hiveId || ''}
                                onValueChange={(value) => 
                                    setFilters({ 
                                        ...filters, 
                                        hiveId: value || undefined 
                                    })
                                }
                            >
                                <SelectTrigger id="hive-filter">
                                    <SelectValue placeholder="جميع الخلايا" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">جميع الخلايا</SelectItem>
                                    {hives.map((hive) => (
                                        <SelectItem key={hive.id} value={hive.id}>
                                            {hive.name || `خلية ${hive.hiveNumber}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Overdue Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="overdue-filter">المهام المتأخرة</Label>
                        <Select
                            value={filters.overdue !== undefined ? String(filters.overdue) : ''}
                            onValueChange={(value) => 
                                setFilters({ 
                                    ...filters, 
                                    overdue: value === '' ? undefined : value === 'true'
                                })
                            }
                        >
                            <SelectTrigger id="overdue-filter">
                                <SelectValue placeholder="الكل" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">الكل</SelectItem>
                                <SelectItem value="true">
                                    <span className="ml-2">⚠️</span>
                                    المتأخرة فقط
                                </SelectItem>
                                <SelectItem value="false">
                                    <span className="ml-2">✅</span>
                                    غير المتأخرة فقط
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Active Filters Summary */}
                    {activeFilterCount > 0 && (
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm">الفلاتر النشطة:</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    className="h-auto p-0 text-xs"
                                >
                                    <X className="w-3 h-3 ml-1" />
                                    مسح الكل
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {filters.status && (
                                    <Badge variant="secondary">
                                        الحالة: {statusOptions.find(o => o.value === filters.status)?.label}
                                    </Badge>
                                )}
                                {filters.taskType && (
                                    <Badge variant="secondary">
                                        النوع: {taskTypeOptions.find(o => o.value === filters.taskType)?.label}
                                    </Badge>
                                )}
                                {filters.hiveId && (
                                    <Badge variant="secondary">
                                        الخلية: {hives.find(h => h.id === filters.hiveId)?.name || 'محددة'}
                                    </Badge>
                                )}
                                {filters.overdue !== undefined && (
                                    <Badge variant="secondary">
                                        {filters.overdue ? 'متأخرة فقط' : 'غير متأخرة فقط'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                    >
                        مسح الفلاتر
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApply}
                    >
                        تطبيق
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
