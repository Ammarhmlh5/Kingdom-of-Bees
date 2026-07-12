import { useState } from 'react';
import { TaskCard, Task } from './TaskCard';
import { TaskFilterDialog } from './TaskFilterDialog';
import { TaskSortDialog, TaskSortOptions } from './TaskSortDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, SortAsc } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { TaskFilters } from '@/services/apiaryTasks';
import { Badge } from '@/components/ui/badge';
import { sortTasks } from '@/utils/taskSorting';

interface TaskListProps {
    tasks: Task[];
    loading?: boolean;
    error?: string | null;
    onCreateTask?: () => void;
    onCompleteTask?: (taskId: string) => void;
    onEditTask?: (task: Task) => void;
    onDeleteTask?: (taskId: string) => void;
    onFilterChange?: (filters: TaskFilters) => void;
    onSortChange?: (sort: any) => void;
    currentFilters?: TaskFilters;
    hives?: Array<{ id: string; name: string; hiveNumber: string }>;
}

export function TaskList({
    tasks,
    loading = false,
    error = null,
    onCreateTask,
    onCompleteTask,
    onEditTask,
    onDeleteTask,
    onFilterChange,
    onSortChange,
    currentFilters = {},
    hives = []
}: TaskListProps) {
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [showSortDialog, setShowSortDialog] = useState(false);
    const [currentSort, setCurrentSort] = useState<TaskSortOptions>({
        field: 'priority',
        direction: 'desc'
    });
    
    // Helper function to get sort field label
    const getSortFieldLabel = (field: TaskSortOptions['field']): string => {
        const labels: Record<TaskSortOptions['field'], string> = {
            priority: 'الأولوية',
            dueDate: 'الاستحقاق',
            createdAt: 'الإنشاء',
            status: 'الحالة',
            title: 'العنوان'
        };
        return labels[field];
    };
    
    // Count active filters
    const activeFilterCount = Object.keys(currentFilters).filter(
        key => currentFilters[key as keyof TaskFilters] !== undefined && currentFilters[key as keyof TaskFilters] !== ''
    ).length;
    
    // Apply sorting to tasks
    const sortedTasks = sortTasks(tasks, currentSort);
    
    // Loading state
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>المهام</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>المهام</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>المهام</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {sortedTasks.length} {sortedTasks.length === 1 ? 'مهمة' : 'مهام'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Filter Button */}
                        {onFilterChange && (
                            <>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowFilterDialog(true)}
                                >
                                    <Filter className="h-4 w-4 ml-2" />
                                    تصفية
                                    {activeFilterCount > 0 && (
                                        <Badge variant="secondary" className="mr-2">
                                            {activeFilterCount}
                                        </Badge>
                                    )}
                                </Button>
                                
                                <TaskFilterDialog
                                    isOpen={showFilterDialog}
                                    onClose={() => setShowFilterDialog(false)}
                                    onApply={onFilterChange}
                                    currentFilters={currentFilters}
                                    hives={hives}
                                />
                            </>
                        )}
                        
                        {/* Sort Button */}
                        {onSortChange && (
                            <>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowSortDialog(true)}
                                >
                                    <SortAsc className="h-4 w-4 ml-2" />
                                    ترتيب
                                    {currentSort.field !== 'priority' && (
                                        <Badge variant="secondary" className="mr-2">
                                            {getSortFieldLabel(currentSort.field)}
                                        </Badge>
                                    )}
                                </Button>
                                
                                <TaskSortDialog
                                    isOpen={showSortDialog}
                                    onClose={() => setShowSortDialog(false)}
                                    onApply={(sort) => {
                                        setCurrentSort(sort);
                                        onSortChange(sort);
                                    }}
                                    currentSort={currentSort}
                                />
                            </>
                        )}
                        
                        {/* Create Task Button */}
                        {onCreateTask && (
                            <Button 
                                size="sm"
                                onClick={onCreateTask}
                            >
                                <Plus className="h-4 w-4 ml-2" />
                                مهمة جديدة
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {tasks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-muted-foreground mb-4">
                            <div className="text-4xl mb-2">📋</div>
                            <p className="text-lg font-medium">لا توجد مهام</p>
                            <p className="text-sm mt-1">ابدأ بإنشاء مهمة جديدة</p>
                        </div>
                        {onCreateTask && (
                            <Button onClick={onCreateTask}>
                                <Plus className="h-4 w-4 ml-2" />
                                إنشاء مهمة
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onComplete={onCompleteTask}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
