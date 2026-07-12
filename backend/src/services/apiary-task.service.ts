import { TaskType, TaskStatus } from '@prisma/client';

import prisma from '../config/prisma';
import { logger } from '../utils/logger';

interface CreateTaskData {
    taskType: TaskType;
    title: string;
    description?: string;
    priority?: number;
    scheduledDate?: Date;
    dueDate?: Date;
    assignedToId?: string;
    hiveId?: string;
}

interface UpdateTaskData {
    title?: string;
    description?: string;
    taskType?: TaskType;
    status?: TaskStatus;
    priority?: number;
    scheduledDate?: Date;
    dueDate?: Date;
    assignedToId?: string;
    hiveId?: string;
}

interface TaskFilters {
    status?: TaskStatus;
    taskType?: TaskType;
    hiveId?: string;
    assignedToId?: string;
    overdue?: boolean;
}

interface TaskStats {
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

export class ApiaryTaskService {
    
    /**
     * Create a new task
     */
    async createTask(apiaryId: string, data: CreateTaskData): Promise<any> {
        logger.info(`[ApiaryTaskService] Creating task for apiary: ${apiaryId}`, data);
        
        // Validate apiary exists
        const apiary = await prisma.apiary.findUnique({
            where: { id: apiaryId }
        });
        
        if (!apiary) {
            throw new Error(`Apiary not found: ${apiaryId}`);
        }
        
        // If hiveId is provided, validate it belongs to the apiary
        if (data.hiveId) {
            const hive = await prisma.hive.findFirst({
                where: {
                    id: data.hiveId,
                    apiaryId
                }
            });
            
            if (!hive) {
                throw new Error(`Hive not found or doesn't belong to apiary: ${data.hiveId}`);
            }
        }
        
        // Create task
        const task = await prisma.apiaryTask.create({
            data: {
                apiaryId,
                taskType: data.taskType,
                title: data.title,
                description: data.description,
                priority: data.priority || 5,
                dueDate: new Date(data.dueDate || new Date()),
                // assignee field doesn't exist in schema, removing
                hiveId: data.hiveId,
                status: TaskStatus.PENDING
            },
            include: {
                hive: {
                    select: {
                        id: true,
                        hiveNumber: true,
                        name: true
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });
        
        logger.info(`[ApiaryTaskService] Task created:`, task);
        
        return task;
    }
    
    /**
     * Get all tasks for an apiary with optional filters
     */
    async getTasks(apiaryId: string, filters?: TaskFilters): Promise<any[]> {
        logger.info(`[ApiaryTaskService] Getting tasks for apiary: ${apiaryId}`, filters);
        
        const where: any = {
            apiaryId
        };
        
        // Apply filters
        if (filters) {
            if (filters.status) {
                where.status = filters.status;
            }
            
            if (filters.taskType) {
                where.taskType = filters.taskType;
            }
            
            if (filters.hiveId) {
                where.hiveId = filters.hiveId;
            }
            
            if (filters.assignedToId) {
                where.assignedToId = filters.assignedToId;
            }
            
            if (filters.overdue) {
                where.dueDate = {
                    lt: new Date()
                };
                where.status = {
                    notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED]
                };
            }
        }
        
        const tasks = await prisma.apiaryTask.findMany({
            where,
            include: {
                hive: {
                    select: {
                        id: true,
                        hiveNumber: true,
                        name: true
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            },
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' },
                { createdAt: 'desc' }
            ]
        });
        
        // Mark overdue tasks
        const now = new Date();
        const tasksWithOverdueFlag = tasks.map(task => ({
            ...task,
            isOverdue: task.dueDate && task.dueDate < now && 
                      task.status !== TaskStatus.COMPLETED && 
                      task.status !== TaskStatus.CANCELLED
        }));
        
        logger.info(`[ApiaryTaskService] Found ${tasks.length} tasks`);
        
        return tasksWithOverdueFlag;
    }
    
    /**
     * Get a single task by ID
     */
    async getTaskById(taskId: string): Promise<any> {
        const task = await prisma.apiaryTask.findUnique({
            where: { id: taskId },
            include: {
                hive: {
                    select: {
                        id: true,
                        hiveNumber: true,
                        name: true
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                apiary: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        
        if (!task) {
            throw new Error(`Task not found: ${taskId}`);
        }
        
        return task;
    }
    
    /**
     * Update a task
     */
    async updateTask(taskId: string, data: UpdateTaskData): Promise<any> {
        logger.info(`[ApiaryTaskService] Updating task: ${taskId}`, data);
        
        // Verify task exists
        const existingTask = await prisma.apiaryTask.findUnique({
            where: { id: taskId }
        });
        
        if (!existingTask) {
            throw new Error(`Task not found: ${taskId}`);
        }
        
        // If hiveId is being updated, validate it
        if (data.hiveId) {
            const hive = await prisma.hive.findFirst({
                where: {
                    id: data.hiveId,
                    apiaryId: existingTask.apiaryId
                }
            });
            
            if (!hive) {
                throw new Error(`Hive not found or doesn't belong to apiary: ${data.hiveId}`);
            }
        }
        
        // Update task
        const task = await prisma.apiaryTask.update({
            where: { id: taskId },
            data: {
                ...data,
                updatedAt: new Date()
            },
            include: {
                hive: {
                    select: {
                        id: true,
                        hiveNumber: true,
                        name: true
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });
        
        logger.info(`[ApiaryTaskService] Task updated:`, task);
        
        return task;
    }
    
    /**
     * Complete a task
     */
    async completeTask(taskId: string): Promise<any> {
        logger.info(`[ApiaryTaskService] Completing task: ${taskId}`);
        
        const task = await prisma.apiaryTask.update({
            where: { id: taskId },
            data: {
                completedAt: new Date(),
                updatedAt: new Date()
            },
            include: {
                hive: {
                    select: {
                        id: true,
                        hiveNumber: true,
                        name: true
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });
        
        logger.info(`[ApiaryTaskService] Task completed:`, task);
        
        return task;
    }
    
    /**
     * Delete a task
     */
    async deleteTask(taskId: string): Promise<void> {
        logger.info(`[ApiaryTaskService] Deleting task: ${taskId}`);
        
        await prisma.apiaryTask.delete({
            where: { id: taskId }
        });
        
        logger.info(`[ApiaryTaskService] Task deleted: ${taskId}`);
    }
    
    /**
     * Get task statistics for an apiary
     */
    async getTaskStats(apiaryId: string): Promise<TaskStats> {
        logger.info(`[ApiaryTaskService] Getting task stats for apiary: ${apiaryId}`);
        
        // Get all tasks
        const tasks = await prisma.apiaryTask.findMany({
            where: { apiaryId }
        });
        
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
        const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
        const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
        const cancelled = tasks.filter(t => t.status === TaskStatus.CANCELLED).length;
        
        // Calculate overdue tasks
        const now = new Date();
        const overdue = tasks.filter(t => 
            t.dueDate && 
            t.dueDate < now && 
            t.status !== TaskStatus.COMPLETED && 
            t.status !== TaskStatus.CANCELLED
        ).length;
        
        // Calculate completion rate
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Calculate breakdown by task type
        const breakdown = {
            inspections: {
                total: tasks.filter(t => t.taskType === TaskType.INSPECTION).length,
                completed: tasks.filter(t => t.taskType === TaskType.INSPECTION && t.status === TaskStatus.COMPLETED).length
            },
            feeding: {
                total: tasks.filter(t => t.taskType === TaskType.FEEDING).length,
                completed: tasks.filter(t => t.taskType === TaskType.FEEDING && t.status === TaskStatus.COMPLETED).length
            },
            operations: {
                total: tasks.filter(t => ['MOVEMENT', 'SPLIT', 'MERGE', 'REQUEEN'].includes(t.taskType)).length,
                completed: tasks.filter(t => ['MOVEMENT', 'SPLIT', 'MERGE', 'REQUEEN'].includes(t.taskType) && t.status === TaskStatus.COMPLETED).length
            },
            maintenance: {
                total: tasks.filter(t => t.taskType === TaskType.MAINTENANCE).length,
                completed: tasks.filter(t => t.taskType === TaskType.MAINTENANCE && t.status === TaskStatus.COMPLETED).length
            },
            harvest: {
                total: tasks.filter(t => t.taskType === TaskType.HARVEST).length,
                completed: tasks.filter(t => t.taskType === TaskType.HARVEST && t.status === TaskStatus.COMPLETED).length
            },
            treatment: {
                total: tasks.filter(t => t.taskType === TaskType.TREATMENT).length,
                completed: tasks.filter(t => t.taskType === TaskType.TREATMENT && t.status === TaskStatus.COMPLETED).length
            },
            other: {
                total: tasks.filter(t => t.taskType === TaskType.OTHER).length,
                completed: tasks.filter(t => t.taskType === TaskType.OTHER && t.status === TaskStatus.COMPLETED).length
            }
        };
        
        const stats: TaskStats = {
            total,
            completed,
            inProgress,
            pending,
            overdue,
            cancelled,
            completionRate,
            breakdown
        };
        
        logger.info(`[ApiaryTaskService] Task stats:`, stats);
        
        return stats;
    }
    
    /**
     * Mark overdue tasks
     * This should be called periodically (e.g., daily cron job)
     */
    async markOverdueTasks(): Promise<number> {
        logger.info(`[ApiaryTaskService] Marking overdue tasks`);
        
        const now = new Date();
        
        const result = await prisma.apiaryTask.updateMany({
            where: {
                dueDate: {
                    lt: now
                },
                status: {
                    notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED, TaskStatus.OVERDUE]
                }
            },
            data: {
                status: TaskStatus.OVERDUE,
                updatedAt: new Date()
            }
        });
        
        logger.info(`[ApiaryTaskService] Marked ${result.count} tasks as overdue`);
        
        return result.count;
    }
    
    /**
     * Auto-generate inspection tasks based on hive inspection schedule
     * This can be called periodically or when a new hive is added
     */
    async generateInspectionTasks(apiaryId: string): Promise<any[]> {
        logger.info(`[ApiaryTaskService] Generating inspection tasks for apiary: ${apiaryId}`);
        
        // Get all active hives that need inspection
        const hives = await prisma.hive.findMany({
            where: {
                apiaryId,
                status: 'ACTIVE',
                nextInspectionDue: {
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
                }
            }
        });
        
        const createdTasks = [];
        
        for (const hive of hives) {
            // Check if inspection task already exists
            const existingTask = await prisma.apiaryTask.findFirst({
                where: {
                    apiaryId,
                    hiveId: hive.id,
                    taskType: TaskType.INSPECTION,
                    status: {
                        notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED]
                    }
                }
            });
            
            if (!existingTask && hive.nextInspectionDue) {
                const task = await this.createTask(apiaryId, {
                    taskType: TaskType.INSPECTION,
                    title: `فحص الخلية ${hive.hiveNumber}`,
                    description: `فحص دوري للخلية ${hive.name || hive.hiveNumber}`,
                    priority: 7,
                    scheduledDate: hive.nextInspectionDue,
                    dueDate: hive.nextInspectionDue,
                    hiveId: hive.id
                });
                
                createdTasks.push(task);
            }
        }
        
        logger.info(`[ApiaryTaskService] Generated ${createdTasks.length} inspection tasks`);
        
        return createdTasks;
    }
}

export const apiaryTaskService = new ApiaryTaskService();
