import { financialsRepository } from '../repositories/financials.repository';

export class FinancialsService {
    async getFinancials(apiaryId: string, period: string = 'month') {
        const [records, summary] = await Promise.all([
            financialsRepository.getFinancials(apiaryId, period),
            financialsRepository.getFinancialSummary(apiaryId, period)
        ]);
        return { records, summary };
    }

    async createRecord(apiaryId: string, userId: string, data: {
        type: 'REVENUE' | 'EXPENSE';
        amount: number;
        category: string;
        description?: string;
        recordDate: string;
    }) {
        if (!data.type || !data.amount || !data.category || !data.recordDate) {
            throw new Error('النوع والمبلغ والفئة والتاريخ مطلوبة');
        }
        if (data.amount <= 0) {
            throw new Error('المبلغ يجب أن يكون أكبر من صفر');
        }
        return financialsRepository.createFinancialRecord(apiaryId, userId, data);
    }

    async deleteRecord(recordId: string, apiaryId: string) {
        const result = await financialsRepository.deleteFinancialRecord(recordId, apiaryId);
        if (!result) throw new Error('السجل المالي غير موجود');
        return result;
    }
}

export const financialsService = new FinancialsService();
