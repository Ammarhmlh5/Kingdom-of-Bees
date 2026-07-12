import { z } from 'zod';

export const createTaskSchema = z.object({
    taskType: z.string().min(1, 'نوع المهمة مطلوب'),
    title: z.string().min(1, 'عنوان المهمة مطلوب'),
    description: z.string().optional(),
    assignedToId: z.string().uuid('معرف المستخدم غير صالح').optional(),
    hiveId: z.string().uuid('معرف الخلية غير صالح').optional(),
    scheduledDate: z.string().optional(),
    dueDate: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    status: z.string().optional(),
});

export const updateTaskSchema = z.object({
    taskType: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    assignedToId: z.string().uuid('معرف المستخدم غير صالح').optional(),
    hiveId: z.string().uuid('معرف الخلية غير صالح').optional(),
    scheduledDate: z.string().optional(),
    dueDate: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    status: z.string().optional(),
});

export const completeTaskSchema = z.object({});
