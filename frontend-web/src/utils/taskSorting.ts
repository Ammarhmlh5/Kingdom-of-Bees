import { Task } from '@/components/dashboard/TaskCard';
import { TaskSortOptions } from '@/components/dashboard/TaskSortDialog';

/**
 * Sort tasks based on the provided sort options
 */
export function sortTasks(tasks: Task[], sortOptions: TaskSortOptions): Task[] {
    const { field, direction } = sortOptions;
    
    // Create a copy to avoid mutating the original array
    const sortedTasks = [...tasks];
    
    sortedTasks.sort((a, b) => {
        let comparison = 0;
        
        switch (field) {
            case 'priority':
                comparison = a.priority - b.priority;
                break;
                
            case 'dueDate':
                // Handle null/undefined dates - put them at the end
                if (!a.dueDate && !b.dueDate) comparison = 0;
                else if (!a.dueDate) comparison = 1;
                else if (!b.dueDate) comparison = -1;
                else {
                    const dateA = new Date(a.dueDate).getTime();
                    const dateB = new Date(b.dueDate).getTime();
                    comparison = dateA - dateB;
                }
                break;
                
            case 'createdAt':
                // Assuming tasks have a createdAt field (may need to add to Task interface)
                // For now, we'll use the task ID as a proxy for creation order
                comparison = a.id.localeCompare(b.id);
                break;
                
            case 'status':
                // Define status order: OVERDUE > IN_PROGRESS > PENDING > COMPLETED > CANCELLED
                const statusOrder: Record<Task['status'], number> = {
                    OVERDUE: 1,
                    IN_PROGRESS: 2,
                    PENDING: 3,
                    COMPLETED: 4,
                    CANCELLED: 5
                };
                comparison = statusOrder[a.status] - statusOrder[b.status];
                break;
                
            case 'title':
                comparison = a.title.localeCompare(b.title, 'ar');
                break;
                
            default:
                comparison = 0;
        }
        
        // Apply direction
        return direction === 'asc' ? comparison : -comparison;
    });
    
    return sortedTasks;
}

/**
 * Get a human-readable description of the current sort
 */
export function getSortDescription(sortOptions: TaskSortOptions): string {
    const { field, direction } = sortOptions;
    
    const fieldLabels: Record<TaskSortOptions['field'], string> = {
        priority: 'الأولوية',
        dueDate: 'تاريخ الاستحقاق',
        createdAt: 'تاريخ الإنشاء',
        status: 'الحالة',
        title: 'العنوان'
    };
    
    const directionLabel = direction === 'asc' ? 'تصاعدي' : 'تنازلي';
    
    return `${fieldLabels[field]} (${directionLabel})`;
}
