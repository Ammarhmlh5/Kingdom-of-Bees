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
import { ArrowUp, ArrowDown } from 'lucide-react';

export interface TaskSortOptions {
    field: 'priority' | 'dueDate' | 'createdAt' | 'status' | 'title';
    direction: 'asc' | 'desc';
}

interface TaskSortDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (sort: TaskSortOptions) => void;
    currentSort: TaskSortOptions;
}

export function TaskSortDialog({
    isOpen,
    onClose,
    onApply,
    currentSort
}: TaskSortDialogProps) {
    const [sort, setSort] = useState<TaskSortOptions>(currentSort);

    // Update local sort when currentSort changes
    useEffect(() => {
        setSort(currentSort);
    }, [currentSort]);

    // Handle apply sort
    const handleApply = () => {
        onApply(sort);
        onClose();
    };

    // Handle reset to default
    const handleReset = () => {
        const defaultSort: TaskSortOptions = {
            field: 'priority',
            direction: 'desc'
        };
        setSort(defaultSort);
        onApply(defaultSort);
        onClose();
    };

    // Sort field options
    const sortFieldOptions = [
        { value: 'priority', label: 'الأولوية', icon: '🔥' },
        { value: 'dueDate', label: 'تاريخ الاستحقاق', icon: '📅' },
        { value: 'createdAt', label: 'تاريخ الإنشاء', icon: '🕐' },
        { value: 'status', label: 'الحالة', icon: '📊' },
        { value: 'title', label: 'العنوان', icon: '📝' }
    ];

    // Get current field label
    const currentFieldLabel = sortFieldOptions.find(
        option => option.value === sort.field
    )?.label || 'الأولوية';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>ترتيب المهام</DialogTitle>
                    <DialogDescription>
                        اختر كيفية ترتيب المهام في القائمة
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Sort Field */}
                    <div className="space-y-2">
                        <Label htmlFor="sort-field">الترتيب حسب</Label>
                        <Select
                            value={sort.field}
                            onValueChange={(value) => 
                                setSort({ 
                                    ...sort, 
                                    field: value as TaskSortOptions['field']
                                })
                            }
                        >
                            <SelectTrigger id="sort-field">
                                <SelectValue placeholder="اختر حقل الترتيب" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortFieldOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <span className="ml-2">{option.icon}</span>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort Direction */}
                    <div className="space-y-2">
                        <Label htmlFor="sort-direction">الاتجاه</Label>
                        <Select
                            value={sort.direction}
                            onValueChange={(value) => 
                                setSort({ 
                                    ...sort, 
                                    direction: value as 'asc' | 'desc'
                                })
                            }
                        >
                            <SelectTrigger id="sort-direction">
                                <SelectValue placeholder="اختر اتجاه الترتيب" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">
                                    <div className="flex items-center">
                                        <ArrowDown className="w-4 h-4 ml-2" />
                                        <span>تنازلي (من الأعلى للأدنى)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="asc">
                                    <div className="flex items-center">
                                        <ArrowUp className="w-4 h-4 ml-2" />
                                        <span>تصاعدي (من الأدنى للأعلى)</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Preview */}
                    <div className="pt-4 border-t">
                        <Label className="text-sm mb-2 block">معاينة الترتيب:</Label>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">
                                سيتم ترتيب المهام حسب <strong>{currentFieldLabel}</strong>
                                {' '}
                                {sort.direction === 'desc' ? (
                                    <>
                                        <ArrowDown className="w-3 h-3 inline mx-1" />
                                        <span className="text-muted-foreground">(تنازلي)</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowUp className="w-3 h-3 inline mx-1" />
                                        <span className="text-muted-foreground">(تصاعدي)</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Examples based on field */}
                    <div className="text-xs text-muted-foreground space-y-1">
                        {sort.field === 'priority' && (
                            <p>
                                💡 الأولوية: {sort.direction === 'desc' ? 'الأعلى أولاً (10 → 1)' : 'الأدنى أولاً (1 → 10)'}
                            </p>
                        )}
                        {sort.field === 'dueDate' && (
                            <p>
                                💡 تاريخ الاستحقاق: {sort.direction === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}
                            </p>
                        )}
                        {sort.field === 'createdAt' && (
                            <p>
                                💡 تاريخ الإنشاء: {sort.direction === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}
                            </p>
                        )}
                        {sort.field === 'status' && (
                            <p>
                                💡 الحالة: {sort.direction === 'desc' ? 'المكتملة أولاً' : 'المعلقة أولاً'}
                            </p>
                        )}
                        {sort.field === 'title' && (
                            <p>
                                💡 العنوان: {sort.direction === 'desc' ? 'من ي إلى أ' : 'من أ إلى ي'}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                    >
                        إعادة تعيين
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
