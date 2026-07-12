import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    CheckCircle2, 
    Clock, 
    Circle, 
    AlertCircle, 
    Calendar,
    User,
    MoreVertical,
    Trash2,
    Edit
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ApiaryTask, TaskType, TaskStatus } from '@/services/apiaryTasks';

// Export ApiaryTask as Task for backward compatibility
export type Task = ApiaryTask;

interface TaskCardProps {
    task: Task;
    onComplete?: (taskId: string) => void;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
    
    // Get status icon and color
    const getStatusConfig = (status: Task['status']) => {
        switch (status) {
            case 'COMPLETED':
                return {
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    label: 'مكتملة'
                };
            case 'IN_PROGRESS':
                return {
                    icon: <Clock className="w-4 h-4" />,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    label: 'قيد التنفيذ'
                };
            case 'PENDING':
                return {
                    icon: <Circle className="w-4 h-4" />,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    label: 'قيد الانتظار'
                };
            case 'OVERDUE':
                return {
                    icon: <AlertCircle className="w-4 h-4" />,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100',
                    label: 'متأخرة'
                };
            case 'CANCELLED':
                return {
                    icon: <Circle className="w-4 h-4" />,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    label: 'ملغاة'
                };
            default:
                return {
                    icon: <Circle className="w-4 h-4" />,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    label: 'غير محدد'
                };
        }
    };

    // Get task type label and icon
    const getTaskTypeConfig = (type: Task['taskType']) => {
        switch (type) {
            case 'INSPECTION':
                return { icon: '🔍', label: 'فحص' };
            case 'FEEDING':
                return { icon: '🍯', label: 'تغذية' };
            case 'OPERATION':
                return { icon: '⚙️', label: 'عملية' };
            case 'MAINTENANCE':
                return { icon: '🔧', label: 'صيانة' };
            case 'HARVEST':
                return { icon: '🌾', label: 'حصاد' };
            case 'TREATMENT':
                return { icon: '💊', label: 'علاج' };
            case 'OTHER':
                return { icon: '📋', label: 'أخرى' };
            default:
                return { icon: '📋', label: 'غير محدد' };
        }
    };

    // Get priority color
    const getPriorityColor = (priority: number): string => {
        if (priority >= 8) return 'bg-red-500';
        if (priority >= 5) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const statusConfig = getStatusConfig(task.status);
    const typeConfig = getTaskTypeConfig(task.taskType);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                            {/* Status Icon */}
                            <div className={cn(
                                "p-2 rounded-full mt-1",
                                statusConfig.bgColor
                            )}>
                                <div className={statusConfig.color}>
                                    {statusConfig.icon}
                                </div>
                            </div>

                            {/* Task Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-sm truncate">
                                        {task.title}
                                    </h3>
                                    {/* Priority Indicator */}
                                    <div 
                                        className={cn(
                                            "w-2 h-2 rounded-full",
                                            getPriorityColor(task.priority)
                                        )}
                                        title={`الأولوية: ${task.priority}/10`}
                                    />
                                </div>
                                
                                {task.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {task.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {task.status !== 'COMPLETED' && onComplete && (
                                    <DropdownMenuItem onClick={() => onComplete(task.id)}>
                                        <CheckCircle2 className="ml-2 h-4 w-4" />
                                        إكمال المهمة
                                    </DropdownMenuItem>
                                )}
                                {onEdit && (
                                    <DropdownMenuItem onClick={() => onEdit(task)}>
                                        <Edit className="ml-2 h-4 w-4" />
                                        تعديل
                                    </DropdownMenuItem>
                                )}
                                {onDelete && (
                                    <DropdownMenuItem 
                                        onClick={() => onDelete(task.id)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="ml-2 h-4 w-4" />
                                        حذف
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        {/* Status Badge */}
                        <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                            {statusConfig.label}
                        </Badge>

                        {/* Type Badge */}
                        <Badge variant="outline" className="text-xs">
                            <span className="ml-1">{typeConfig.icon}</span>
                            {typeConfig.label}
                        </Badge>

                        {/* Hive Badge */}
                        {task.hive && (
                            <Badge variant="outline" className="text-xs">
                                خلية: {task.hive.name}
                            </Badge>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-4">
                            {/* Due Date */}
                            {task.dueDate && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {new Date(task.dueDate).toLocaleDateString('ar-EG', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            )}

                            {/* Assigned To */}
                            {task.assignedTo && (
                                <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>{task.assignedTo.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Completed Date */}
                        {task.completedDate && (
                            <div className="text-green-600">
                                ✓ {new Date(task.completedDate).toLocaleDateString('ar-EG', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
