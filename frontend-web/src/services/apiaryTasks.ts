import api from './api';

// ============================================================================
// ENUMS
// ============================================================================

export enum TaskType {
    INSPECTION = 'INSPECTION',
    FEEDING = 'FEEDING',
    OPERATION = 'OPERATION',
    MAINTENANCE = 'MAINTENANCE',
    HARVEST = 'HARVEST',
    TREATMENT = 'TREATMENT',
    OTHER = 'OTHER'
}

export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    OVERDUE = 'OVERDUE'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface ApiaryTask {
    id: string;
    apiaryId: string;
    taskType: TaskType;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: number; // 1-10
    scheduledDate?: string;
    dueDate?: string;
    completedDate?: string;
    assignedToId?: string;
    hiveId?: string;
    createdAt: string;
    updatedAt: string;
    isOverdue?: boolean;
    hive?: {
        id: string;
        hiveNumber: string;
        name?: string;
    };
    assignedTo?: {
        id: string;
        fullName: string;
        email: string;
    };
}

export interface CreateTaskData {
    taskType: TaskType;
    title: string;
    description?: string;
    priority?: number;
    scheduledDate?: string;
    dueDate?: string;
    assignedToId?: string;
    hiveId?: string;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    taskType?: TaskType;
    status?: TaskStatus;
    priority?: number;
    scheduledDate?: string;
    dueDate?: string;
    assignedToId?: string;
    hiveId?: string;
}

export interface TaskFilters {
    status?: TaskStatus;
    taskType?: TaskType;
    hiveId?: string;
    assignedToId?: string;
    overdue?: boolean;
}

export interface TaskStats {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
    cancelled: number;
    completionRate: number;
    breakdown: {
        inspections: { total: number; completed: number };
        feeding: { total: number; completed: number };
        operations: { total: number; completed: number };
        maintenance: { total: number; completed: number };
        harvest: { total: number; completed: number };
        treatment: { total: number; completed: number };
        other: { total: number; completed: number };
    };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all tasks for an apiary with optional filters
 */
export const getTasks = async (apiaryId: string, filters?: TaskFilters): Promise<ApiaryTask[]> => {
    const response = await api.get(`/apiaries/${apiaryId}/tasks`, {
        params: filters
    });
    return response.data.data;
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (apiaryId: string, taskId: string): Promise<ApiaryTask> => {
    const response = await api.get(`/apiaries/${apiaryId}/tasks/${taskId}`);
    return response.data.data;
};

/**
 * Create a new task
 */
export const createTask = async (apiaryId: string, data: CreateTaskData): Promise<ApiaryTask> => {
    const response = await api.post(`/apiaries/${apiaryId}/tasks`, data);
    return response.data.data;
};

/**
 * Update a task
 */
export const updateTask = async (apiaryId: string, taskId: string, data: UpdateTaskData): Promise<ApiaryTask> => {
    const response = await api.put(`/apiaries/${apiaryId}/tasks/${taskId}`, data);
    return response.data.data;
};

/**
 * Mark a task as completed
 */
export const completeTask = async (apiaryId: string, taskId: string): Promise<ApiaryTask> => {
    const response = await api.post(`/apiaries/${apiaryId}/tasks/${taskId}/complete`);
    return response.data.data;
};

/**
 * Delete a task
 */
export const deleteTask = async (apiaryId: string, taskId: string): Promise<void> => {
    await api.delete(`/apiaries/${apiaryId}/tasks/${taskId}`);
};

/**
 * Get task statistics for an apiary
 */
export const getTaskStats = async (apiaryId: string): Promise<TaskStats> => {
    const response = await api.get(`/apiaries/${apiaryId}/tasks/stats`);
    return response.data.data;
};

/**
 * Auto-generate inspection tasks
 */
export const generateInspectionTasks = async (apiaryId: string): Promise<ApiaryTask[]> => {
    const response = await api.post(`/apiaries/${apiaryId}/tasks/generate-inspections`);
    return response.data.data;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get Arabic label for task type
 */
export const getTaskTypeLabel = (type: TaskType): string => {
    switch (type) {
        case TaskType.INSPECTION:
            return 'فحص';
        case TaskType.FEEDING:
            return 'تغذية';
        case TaskType.OPERATION:
            return 'عملية';
        case TaskType.MAINTENANCE:
            return 'صيانة';
        case TaskType.HARVEST:
            return 'حصاد';
        case TaskType.TREATMENT:
            return 'علاج';
        case TaskType.OTHER:
            return 'أخرى';
        default:
            return 'غير محدد';
    }
};

/**
 * Get Arabic label for task status
 */
export const getTaskStatusLabel = (status: TaskStatus): string => {
    switch (status) {
        case TaskStatus.PENDING:
            return 'قيد الانتظار';
        case TaskStatus.IN_PROGRESS:
            return 'قيد التنفيذ';
        case TaskStatus.COMPLETED:
            return 'مكتمل';
        case TaskStatus.CANCELLED:
            return 'ملغي';
        case TaskStatus.OVERDUE:
            return 'متأخر';
        default:
            return 'غير محدد';
    }
};

/**
 * Get color for task status
 */
export const getTaskStatusColor = (status: TaskStatus): string => {
    switch (status) {
        case TaskStatus.PENDING:
            return 'gray';
        case TaskStatus.IN_PROGRESS:
            return 'blue';
        case TaskStatus.COMPLETED:
            return 'green';
        case TaskStatus.CANCELLED:
            return 'red';
        case TaskStatus.OVERDUE:
            return 'orange';
        default:
            return 'gray';
    }
};

/**
 * Get icon for task type
 */
export const getTaskTypeIcon = (type: TaskType): string => {
    switch (type) {
        case TaskType.INSPECTION:
            return '🔍';
        case TaskType.FEEDING:
            return '🍯';
        case TaskType.OPERATION:
            return '⚙️';
        case TaskType.MAINTENANCE:
            return '🔧';
        case TaskType.HARVEST:
            return '🌾';
        case TaskType.TREATMENT:
            return '💊';
        case TaskType.OTHER:
            return '📋';
        default:
            return '📋';
    }
};

/**
 * Get priority label
 */
export const getPriorityLabel = (priority: number): string => {
    if (priority >= 8) return 'عالية جداً';
    if (priority >= 6) return 'عالية';
    if (priority >= 4) return 'متوسطة';
    if (priority >= 2) return 'منخفضة';
    return 'منخفضة جداً';
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority: number): string => {
    if (priority >= 8) return 'red';
    if (priority >= 6) return 'orange';
    if (priority >= 4) return 'yellow';
    return 'gray';
};

/**
 * Check if task is overdue
 */
export const isTaskOverdue = (task: ApiaryTask): boolean => {
    if (!task.dueDate) return false;
    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED) return false;
    return new Date(task.dueDate) < new Date();
};

/**
 * Format date for display
 */
export const formatTaskDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Get days until due
 */
export const getDaysUntilDue = (dueDate?: string): number | null => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
