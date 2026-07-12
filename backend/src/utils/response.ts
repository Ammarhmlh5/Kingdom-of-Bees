import { Response } from 'express';

export class ApiResponse {
    static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    static error(res: Response, message: string, statusCode = 500, errors?: any) {
        return res.status(statusCode).json({
            success: false,
            error: message,
            message,
            errors,
        });
    }

    static created<T>(res: Response, data: T, message = 'Resource created') {
        return this.success(res, data, message, 201);
    }

    static unauthorized(res: Response, message = 'Unauthorized') {
        return this.error(res, message, 401);
    }

    static forbidden(res: Response, message = 'Forbidden') {
        return this.error(res, message, 403);
    }

    static noContent(res: Response) {
        return res.status(204).send();
    }

    static badRequest(res: Response, message = 'Bad Request', errors?: any) {
        return this.error(res, message, 400, errors);
    }
}
