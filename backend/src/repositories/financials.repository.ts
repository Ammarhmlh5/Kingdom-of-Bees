import prisma from '../config/prisma';

function getPeriodDates(period: string): { from: Date; to: Date } {
    const now = new Date();
    const to = new Date(now);
    let from: Date;

    if (period === 'quarter') {
        from = new Date(now);
        from.setMonth(from.getMonth() - 3);
    } else if (period === 'year') {
        from = new Date(now);
        from.setFullYear(from.getFullYear() - 1);
    } else {
        // default: month
        from = new Date(now);
        from.setMonth(from.getMonth() - 1);
    }
    return { from, to };
}

export class FinancialsRepository {
    async getFinancials(apiaryId: string, period: string = 'month') {
        const { from, to } = getPeriodDates(period);
        return prisma.financialRecord.findMany({
            where: {
                apiaryId,
                recordDate: { gte: from, lte: to }
            },
            orderBy: { recordDate: 'desc' }
        });
    }

    async getFinancialSummary(apiaryId: string, period: string = 'month') {
        const { from, to } = getPeriodDates(period);
        const records = await prisma.financialRecord.findMany({
            where: {
                apiaryId,
                recordDate: { gte: from, lte: to }
            }
        });

        const totalRevenue = records
            .filter(r => r.type === 'REVENUE')
            .reduce((sum, r) => sum + Number(r.amount), 0);
        const totalExpenses = records
            .filter(r => r.type === 'EXPENSE')
            .reduce((sum, r) => sum + Number(r.amount), 0);

        return {
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            period: { from: from.toISOString(), to: to.toISOString() }
        };
    }

    async createFinancialRecord(apiaryId: string, userId: string, data: {
        type: 'REVENUE' | 'EXPENSE';
        amount: number;
        category: string;
        description?: string;
        recordDate: string;
    }) {
        return prisma.$transaction(async (tx) => {
            const financialRecord = await tx.financialRecord.create({
                data: {
                    apiaryId,
                    type: data.type,
                    amount: data.amount,
                    category: data.category,
                    description: data.description,
                    recordDate: new Date(data.recordDate)
                }
            });

            const typeLabel = data.type === 'REVENUE' ? 'إيراد' : 'مصروف';
            await tx.apiaryOperation.create({
                data: {
                    apiaryId,
                    operationType: 'TREATMENT',
                    description: `تسجيل معاملة مالية (${typeLabel}): ${data.category} - ${data.amount} SAR`,
                    performedBy: userId,
                    operationDate: new Date(data.recordDate),
                    data: {
                        financialRecordId: financialRecord.id,
                        type: data.type,
                        amount: data.amount,
                        category: data.category,
                        description: data.description
                    }
                }
            });

            return financialRecord;
        });
    }

    async deleteFinancialRecord(recordId: string, apiaryId: string) {
        const record = await prisma.financialRecord.findFirst({
            where: { id: recordId, apiaryId }
        });
        if (!record) return null;
        return prisma.financialRecord.delete({ where: { id: recordId } });
    }
}

export const financialsRepository = new FinancialsRepository();
