import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../utils/response';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req[target]);
            req[target] = parsed;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const messages = (error as ZodError).issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                return ApiResponse.badRequest(res, 'بيانات غير صالحة', messages);
            }
            next(error);
        }
    };
};
