import { useState, useEffect } from 'react';
import { TaskList } from './TaskList';
import { CreateTaskModal } from './CreateTaskModal';
import { EditTaskModal } from './EditTaskModal';
import { TaskSortOptions } from './TaskSortDialog';
import { 
    getTasks, 
    createTask, 
    updateTask, 
    completeTask, 
    deleteTask,
    TaskFilters,
    CreateTaskData,
    UpdateTaskData,
    ApiaryTask
} from '@/services/apiaryTasks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface TaskManagementTabProps {
    apiaryId: string;
    hives?: Array<{ id: string; name: string; hiveNumber: string }>;
}

export function TaskManagementTab({ apiaryId, hives = [] }: TaskManagementTabProps) {
    const [tasks, setTasks] = useState<ApiaryTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState<ApiaryTask | null>(null);
    const [filters, setFilters] = useState<TaskFilters>({});
    const [sortOptions, setSortOptions] = useState<TaskSortOptions>({
        field: 'priority',
        direction: 'desc'
    });

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTasks(apiaryId, filters);
            setTasks(data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('فشل تحميل المهام. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    // Initial load and when filters change
    useEffect(() => {
        if (apiaryId) {
            fetchTasks();
        }
    }, [apiaryId, filters]);

    // Handle create task
    const handleCreateTask = async (data: CreateTaskData) => {
        try {
            await createTask(apiaryId, data);
            setShowCreateModal(false);
            fetchTasks(); // Refresh the list
        } catch (err) {
            console.error('Error creating task:', err);
            throw err; // Let the modal handle the error
        }
    };

    // Handle complete task
    const handleCompleteTask = async (taskId: string) => {
        try {
            await completeTask(apiaryId, taskId);
            fetchTasks(); // Refresh the list
        } catch (err) {
            console.error('Error completing task:', err);
            setError('فشل إكمال المهمة. يرجى المحاولة مرة أخرى.');
        }
    };

    // Handle edit task
    const handleEditTask = async (task: ApiaryTask) => {
        setEditingTask(task);
        setShowEditModal(true);
    };

    // Handle update task
    const handleUpdateTask = async (taskId: string, data: UpdateTaskData) => {
        try {
            await updateTask(apiaryId, taskId, data);
            setShowEditModal(false);
            setEditingTask(null);
            fetchTasks(); // Refresh the list
        } catch (err) {
            console.error('Error updating task:', err);
            throw err; // Let the modal handle the error
        }
    };

    // Handle delete task
    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
            return;
        }

        try {
            await deleteTask(apiaryId, taskId);
            fetchTasks(); // Refresh the list
        } catch (err) {
            console.error('Error deleting task:', err);
            setError('فشل حذف المهمة. يرجى المحاولة مرة أخرى.');
        }
    };

    // Handle filter change
    const handleFilterChange = (newFilters: TaskFilters) => {
        setFilters(newFilters);
    };

    // Handle sort change
    const handleSortChange = (newSort: TaskSortOptions) => {
        setSortOptions(newSort);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">إدارة المهام</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    إنشاء وتتبع مهام المنحل
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Task List */}
            <TaskList
                tasks={tasks}
                loading={loading}
                error={error}
                onCreateTask={() => setShowCreateModal(true)}
                onCompleteTask={handleCompleteTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                currentFilters={filters}
                hives={hives}
            />

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateTask}
                hives={hives}
            />

            {/* Edit Task Modal */}
            <EditTaskModal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditingTask(null); }}
                onSubmit={handleUpdateTask}
                task={editingTask}
                hives={hives}
            />
        </div>
    );
}
