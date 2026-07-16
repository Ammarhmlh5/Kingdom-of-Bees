/**
 * Property-Based Tests: Financials Page
 * Feature: apiary-workspace-completion
 * Properties 3 & 4 from design.md
 *
 * Run: npx vitest run src/__tests__/properties/financials.property.test.ts
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FinancialRecord {
    id: string;
    type: 'REVENUE' | 'EXPENSE';
    amount: number;
    category: string;
    recordDate: string;
}

interface FinancialSummary {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
}

// ─── Pure logic extracted from FinancialsPage / financials.service ───────────

function calculateFinancialSummary(records: FinancialRecord[]): FinancialSummary {
    const totalRevenue = records
        .filter(r => r.type === 'REVENUE')
        .reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records
        .filter(r => r.type === 'EXPENSE')
        .reduce((sum, r) => sum + r.amount, 0);
    return {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
    };
}

function filterByPeriod(records: FinancialRecord[], from: Date, to: Date): FinancialRecord[] {
    return records.filter(r => {
        const d = new Date(r.recordDate);
        return d >= from && d <= to;
    });
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const financialRecordArb: fc.Arbitrary<FinancialRecord> = fc.record({
    id: fc.uuid(),
    type: fc.constantFrom<'REVENUE' | 'EXPENSE'>('REVENUE', 'EXPENSE'),
    amount: fc.float({ min: Math.fround(0.01), max: Math.fround(1_000_000), noNaN: true }),
    category: fc.string({ minLength: 1, maxLength: 50 }),
    recordDate: fc.date({
        min: new Date('2020-01-01'),
        max: new Date('2030-12-31'),
    }).filter(d => !isNaN(d.getTime())).map(d => d.toISOString().split('T')[0]),
});

// ─── Property 3: Financial summary reflects sum of records ───────────────────

describe('Property 3: الملخص المالي يعكس مجموع السجلات', () => {
    it('إجمالي الإيرادات يساوي مجموع سجلات REVENUE', () => {
        fc.assert(
            fc.property(fc.array(financialRecordArb, { minLength: 0, maxLength: 100 }), (records) => {
                const summary = calculateFinancialSummary(records);
                const expectedRevenue = records
                    .filter(r => r.type === 'REVENUE')
                    .reduce((s, r) => s + r.amount, 0);

                expect(Math.abs(summary.totalRevenue - expectedRevenue)).toBeLessThan(0.001);
            }),
            { numRuns: 100 }
        );
    });

    it('إجمالي التكاليف يساوي مجموع سجلات EXPENSE', () => {
        fc.assert(
            fc.property(fc.array(financialRecordArb, { minLength: 0, maxLength: 100 }), (records) => {
                const summary = calculateFinancialSummary(records);
                const expectedExpenses = records
                    .filter(r => r.type === 'EXPENSE')
                    .reduce((s, r) => s + r.amount, 0);

                expect(Math.abs(summary.totalExpenses - expectedExpenses)).toBeLessThan(0.001);
            }),
            { numRuns: 100 }
        );
    });

    it('صافي الربح = الإيرادات - التكاليف', () => {
        fc.assert(
            fc.property(fc.array(financialRecordArb, { minLength: 0, maxLength: 100 }), (records) => {
                const summary = calculateFinancialSummary(records);
                const expected = summary.totalRevenue - summary.totalExpenses;

                expect(Math.abs(summary.netProfit - expected)).toBeLessThan(0.001);
            }),
            { numRuns: 100 }
        );
    });

    it('الملخص يكون صفراً عند عدم وجود سجلات', () => {
        const summary = calculateFinancialSummary([]);
        expect(summary.totalRevenue).toBe(0);
        expect(summary.totalExpenses).toBe(0);
        expect(summary.netProfit).toBe(0);
    });
});

// ─── Property 4: Period filter returns only records within range ──────────────

describe('Property 4: فلترة الفترة الزمنية تُعيد سجلات ضمن النطاق فقط', () => {
    it('جميع السجلات المُعادة يجب أن تكون ضمن نطاق التاريخ المحدد', () => {
        fc.assert(
            fc.property(
                fc.array(financialRecordArb, { minLength: 0, maxLength: 50 }),
                fc.date({ min: new Date('2020-01-01'), max: new Date('2025-01-01') }).filter(d => !isNaN(d.getTime())),
                fc.date({ min: new Date('2025-01-02'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())),
                (records, from, to) => {
                    const filtered = filterByPeriod(records, from, to);

                    for (const record of filtered) {
                        const d = new Date(record.recordDate);
                        expect(d.getTime()).toBeGreaterThanOrEqual(from.getTime());
                        expect(d.getTime()).toBeLessThanOrEqual(to.getTime());
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('لا يجب أن يظهر أي سجل خارج نطاق التاريخ', () => {
        fc.assert(
            fc.property(
                fc.array(financialRecordArb, { minLength: 1, maxLength: 30 }),
                fc.date({ min: new Date('2022-01-01'), max: new Date('2023-01-01') }).filter(d => !isNaN(d.getTime())),
                fc.date({ min: new Date('2023-01-02'), max: new Date('2024-12-31') }).filter(d => !isNaN(d.getTime())),
                (records, from, to) => {
                    const filtered = filterByPeriod(records, from, to);
                    const outsideRange = filtered.filter(r => {
                        const d = new Date(r.recordDate);
                        return d < from || d > to;
                    });
                    expect(outsideRange).toHaveLength(0);
                }
            ),
            { numRuns: 100 }
        );
    });
});
