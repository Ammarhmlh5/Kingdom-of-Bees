import { Request, Response } from 'express';
import { apiaryTaskService } from '../services/apiary-task.service';
import { TaskType, TaskStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

export class ApiaryTaskController {
    /**
     * GET /api/apiaries/:apiaryId/tasks
     * Get all tasks for an apiary with optional filters
     */
    async getTasks(req: Request, res: Response) {
        try {
            const { apiaryId } = req.params;
            const { status, taskType, hiveId, assignedToId, overdue } = req.query;
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const filters: any = {};
            
            if (status) filters.status = status as TaskStatus;
            if (taskType) filters.taskType = taskType as TaskType;
            if (hiveId) filters.hiveId = hiveId as string;
            if (assignedToId) filters.assignedToId = assignedToId as string;
            if (overdue === 'true') filters.overdue = true;

            const tasks = await apiaryTaskService.getTasks(apiaryId, filters);

            ApiResponse.success(res, { data: tasks, count: tasks.length });
        } catch (error) {
            logger.error('Error fetching tasks:', error);
            ApiResponse.error(res, 'فشل في جلب المهام', 500);
        }
    }

    /**
     * GET /api/apiaries/:apiaryId/tasks/:taskId
     * Get a single task by ID
     */
    async getTaskById(req: Request, res: Response) {
        try {
            const { taskId } = req.params;
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const task = await apiaryTaskService.getTaskById(taskId);

            ApiResponse.success(res, task);
        } catch (error: any) {
            logger.error('Error fetching task:', error);
            
            if (error.message.includes('not found')) {
                return ApiResponse.error(res, 'المهمة غير موجودة', 404);
            }
            
            ApiResponse.error(res, 'فشل في جلب المهمة', 500);
        }
    }

    /**
     * POST /api/apiaries/:apiaryId/tasks
     * Create a new task
     */
    async createTask(req: Request, res: Response) {
        try {
            const { apiaryId } = req.params;
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const taskData = req.body;

            // Validate required fields
            if (!taskData.taskType || !taskData.title) {
                return ApiResponse.badRequest(res, 'نوع المهمة والعنوان مطلوبان');
            }

            // Convert date strings to Date objects if provided
            if (taskData.scheduledDate) {
                taskData.scheduledDate = new Date(taskData.scheduledDate);
            }
            if (taskData.dueDate) {
                taskData.dueDate = new Date(taskData.dueDate);
            }

            const task = await apiaryTaskService.createTask(apiaryId, taskData);

            ApiResponse.created(res, task, 'تم إنشاء المهمة بنجاح');
        } catch (error: any) {
            logger.error('Error creating task:', error);
            
            if (error.message.includes('not found')) {
                return ApiResponse.error(res, error.message, 404);
            }
            
            ApiResponse.error(res, 'فشل في إنشاء المهمة', 500);
        }
    }

    /**
     * PUT /api/apiaries/:apiaryId/tasks/:taskId
     * Update a task
     */
    async updateTask(req: Request, res: Response) {
        try {
            const { taskId } = req.params;
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const updateData = req.body;

            // Convert date strings to Date objects if provided
            if (updateData.scheduledDate) {
                updateData.scheduledDate = new Date(updateData.scheduledDate);
            }
            if (updateData.dueDate) {
                updateData.dueDate = new Date(updateData.dueDate);
            }

            const task = await apiaryTaskService.updateTask(taskId, updateData);

            ApiResponse.success(res, task, 'تم تحديث المهمة بنجاح');
        } catch (error: any) {
            logger.error('Error updating task:', error);
            
            if (error.message.includes('not found')) {
                return ApiResponse.error(res, 'المهمة غير موجودة', 404);
            }
            
            ApiResponse.error(res, 'فشل في تحديث المهمة', 500);
        }
    }

    /**
     * POST /api/apiaries/:apiaryId/tasks/:taskId/complete
     * Mark a task as completed
     */
    async completeTask(req: Request, res: Response) {
        try {
            const { taskId } = req.params;
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const task = await apiaryTaskService.completeTask(taskId);

            ApiResponse.success(res, task, 'تم إكمال المهمة بنجاح');
        } catch (error: any) {
            logger.error('Error completing task:', error);
            
            if (error.message.includes('not found')) {
                return ApiResponse.error(res, 'المهمة غير موجودة', 404);
            }
            
            ApiResponse.error(res, 'فشل في إكمال المهمة', 500);
        }
    }

    /**
     * DELETE /api/apiaries/:apiaryId/tasks/:taskId
     * Delete a task
     */
    async deleteTask(req: Request, res: Response) {
        try {
            const { taskId } = req.params;
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            await apiaryTaskService.deleteTask(taskId);

            ApiResponse.success(res, null, 'تم حذف المهمة بنجاح');
        } catch (error: any) {
            logger.error('Error deleting task:', error);
            
            if (error.message.includes('not found')) {
                return ApiResponse.error(res, 'المهمة غير موجودة', 404);
            }
            
            ApiResponse.error(res, 'فشل في حذف المهمة', 500);
        }
    }

    /**
     * GET /api/apiaries/:apiaryId/tasks/stats
     * Get task statistics for an apiary
     */
    async getTaskStats(req: Request, res: Response) {
        try {
            const { apiaryId } = req.params;
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const stats = await apiaryTaskService.getTaskStats(apiaryId);

            ApiResponse.success(res, stats);
        } catch (error) {
            logger.error('Error fetching task stats:', error);
            ApiResponse.error(res, 'فشل في جلب إحصائيات المهام', 500);
        }
    }

    /**
     * POST /api/apiaries/:apiaryId/tasks/generate-inspections
     * Auto-generate inspection tasks
     */
    async generateInspectionTasks(req: Request, res: Response) {
        try {
            const { apiaryId } = req.params;
            const userId = (req as AuthenticatedRequest).user?.id;

            if (!userId) {
                return ApiResponse.unauthorized(res);
            }

            const tasks = await apiaryTaskService.generateInspectionTasks(apiaryId);

            ApiResponse.success(res, { data: tasks, count: tasks.length }, `تم إنشاء ${tasks.length} مهمة فحص`);
        } catch (error) {
            logger.error('Error generating inspection tasks:', error);
            ApiResponse.error(res, 'فشل في إنشاء مهام الفحص', 500);
        }
    }
}

export const apiaryTaskController = new ApiaryTaskController();
