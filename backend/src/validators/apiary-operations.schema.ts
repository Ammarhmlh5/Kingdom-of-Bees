import { z } from 'zod';

export const updateOperationSchema = z.object({
    description: z.string().optional(),
    operationDate: z.string().optional(),
    data: z.any().optional(),
});
