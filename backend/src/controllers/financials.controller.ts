import { Request, Response } from 'express';
import { financialsService } from '../services/financials.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../utils/response';

function isOwnerOrAdmin(req: Request): boolean {
    const user = (req as AuthenticatedRequest).user;
    return user?.role === 'OWNER' || user?.role === 'ADMIN';
}

export class FinancialsController {
    async getFinancials(req: Request, res: Response) {
        try {
            if (!isOwnerOrAdmin(req)) {
                return ApiResponse.forbidden(res, 'غير مصرح: هذه الصفحة للمالك فقط');
            }
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const period = (req.query.period as string) || 'month';
            const data = await financialsService.getFinancials(apiaryId, period);
            ApiResponse.success(res, data);
        } catch (error) {
            ApiResponse.error(res, 'فشل في جلب السجلات المالية', 500);
        }
    }

    async createRecord(req: Request, res: Response) {
        try {
            if (!isOwnerOrAdmin(req)) {
                return ApiResponse.forbidden(res, 'غير مصرح: هذه الصفحة للمالك فقط');
            }
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const user = (req as AuthenticatedRequest).user!;
            const { type, amount, category, description, recordDate } = req.body;

            if (!type || !amount || !category || !recordDate) {
                return ApiResponse.error(res, 'النوع والمبلغ والفئة والتاريخ مطلوبة', 400);
            }

            const record = await financialsService.createRecord(apiaryId, user.id, {
                type, amount: Number(amount), category, description, recordDate
            });
            ApiResponse.created(res, record);
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 500);
        }
    }

    async deleteRecord(req: Request, res: Response) {
        try {
            if (!isOwnerOrAdmin(req)) {
                return ApiResponse.forbidden(res, 'غير مصرح: هذه الصفحة للمالك فقط');
            }
            const apiaryId = (req as AuthenticatedRequest).apiaryId!;
            const recordId = req.params.recordId as string;
            await financialsService.deleteRecord(recordId, apiaryId);
            ApiResponse.success(res, null, 'تم حذف السجل المالي بنجاح');
        } catch (error) {
            ApiResponse.error(res, (error as Error).message, 404);
        }
    }
}

export const financialsController = new FinancialsController();
