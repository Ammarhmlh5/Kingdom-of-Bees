import { prisma } from '../config/database';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';

export class ReportsService {
    /**
     * Get comprehensive apiary report for a specific period
     */
    static async getApiaryReport(apiaryId: string, startDate: Date, endDate: Date) {
        const hives = await prisma.hive.findMany({
            where: { apiaryId },
            include: {
                honeyHarvests: {
                    where: {
                        createdAt: { gte: startDate, lte: endDate }
                    }
                },
                inspections: {
                    where: {
                        inspectionDate: { gte: startDate, lte: endDate }
                    }
                },
                financialRecords: {
                    where: {
                        date: { gte: startDate, lte: endDate }
                    }
                }
            } as any
        });

        const apiary = await prisma.apiary.findUnique({
            where: { id: apiaryId },
            include: {
                financialRecords: {
                    where: {
                        date: { gte: startDate, lte: endDate }
                    }
                }
            } as any
        });

        if (!apiary) throw new Error("Apiary not found");

        // Aggregate Data
        let totalHoneyKg = 0;
        let totalExpenses = 0;
        let totalIncome = 0;
        let inspectionsCount = 0;

        // Hive level stats
        hives.forEach((hive: any) => {
            hive.honeyHarvests.forEach((h: any) => totalHoneyKg += Number(h.quantityKg));
            inspectionsCount += hive.inspections.length;
            hive.financialRecords.forEach((f: any) => {
                if (f.type === 'EXPENSE') totalExpenses += Number(f.amount);
                if (f.type === 'INCOME') totalIncome += Number(f.amount);
            });
        });

        // Apiary level financial stats
        (apiary as any).financialRecords.forEach((f: any) => {
            if (f.type === 'EXPENSE') totalExpenses += Number(f.amount);
            if (f.type === 'INCOME') totalIncome += Number(f.amount);
        });

        return {
            apiaryName: apiary.name,
            period: { start: startDate, end: endDate },
            totalHives: hives.length,
            inspections: inspectionsCount,
            production: {
                honeyKg: totalHoneyKg,
            },
            financials: {
                income: totalIncome,
                expenses: totalExpenses,
                netProfit: totalIncome - totalExpenses
            }
        };
    }

    /**
     * Get production aggregated by month for the current year
     */
    static async getProductionStats(userId: string) {
        const yearStart = startOfYear(new Date());
        const yearEnd = endOfYear(new Date());

        const harvests = await prisma.honeyHarvest.findMany({
            where: {
                hive: {
                    apiary: { ownerId: userId }
                },
                createdAt: { gte: yearStart, lte: yearEnd }
            }
        });

        const monthlyData = new Array(12).fill(0);

        harvests.forEach(h => {
            const month = h.createdAt.getMonth();
            monthlyData[month] += Number(h.quantityKg);
        });

        return {
            year: new Date().getFullYear(),
            monthlyHoneyKg: monthlyData
        };
    }

    /**
     * Get financial summary for user (Owner only)
     */
    static async getFinancialSummary(userId: string) {
        const records = await (prisma as any).financialRecord.findMany({
            where: { userId }
        });

        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryBreakdown: Record<string, number> = {};

        records.forEach((r: any) => {
            const amount = Number(r.amount);
            if (r.type === 'INCOME') totalIncome += amount;
            if (r.type === 'EXPENSE') totalExpenses += amount;

            if (!categoryBreakdown[r.category]) categoryBreakdown[r.category] = 0;
            categoryBreakdown[r.category] += amount;
        });

        return {
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            breakdown: categoryBreakdown
        };
    }

    /**
     * Export data to CSV/JSON
     */
    static async exportReport(userId: string, type: 'production' | 'financial', format: 'csv' | 'json') {
        let data: any[] = [];

        if (type === 'production') {
            const harvests = await prisma.honeyHarvest.findMany({
                where: { hive: { apiary: { ownerId: userId } } },
                include: { hive: { include: { apiary: true } } },
                orderBy: { createdAt: 'desc' }
            });

            data = harvests.map(h => ({
                date: h.createdAt.toISOString().split('T')[0],
                apiary: h.hive.apiary.name,
                hive: h.hive.hiveNumber,
                quantityKg: h.quantityKg,
                type: 'Honey'
            }));
        } else if (type === 'financial') {
            // Strict Owner check should be in controller/middleware, but service fetches by userId so it's scoped.
            const records = await (prisma as any).financialRecord.findMany({
                where: { userId },
                orderBy: { date: 'desc' }
            });

            data = records.map((r: any) => ({
                date: new Date(r.date).toISOString().split('T')[0],
                type: r.type,
                category: r.category,
                amount: r.amount,
                currency: r.currency,
                description: r.description || ''
            }));
        }

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else {
            // CSV conversion
            if (data.length === 0) return '';
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(',')).join('\n');
            return `${headers}\n${rows}`;
        }
    }
}
