import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    logger.error('Error occurred:', err);

    if (err instanceof AppError) {
        return ApiResponse.error(res, err.message, err.statusCode);
    }

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        return ApiResponse.error(res, 'Database error occurred', 400);
    }

    // Validation errors (Zod)
    if (err.name === 'ZodError') {
        const zodError = err as any;
        const formattedErrors = zodError.errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message
        }));
        const firstError = zodError.errors[0];
        const message = firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Validation failed';
        return ApiResponse.error(res, message, 400, formattedErrors);
    }

    // Default error
    logger.error('ERROR 💥', err);
    return ApiResponse.error(res, 'Internal server error', 500);
};

export const notFoundHandler = (req: Request, res: Response) => {
    ApiResponse.error(res, `Route ${req.originalUrl} not found`, 404);
};
