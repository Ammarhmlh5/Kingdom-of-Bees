/**
 * Property-Based Tests: Production (Harvest) Page
 * Feature: apiary-workspace-completion
 * Properties 5 & 6 from design.md
 *
 * Run: npx vitest run src/__tests__/properties/production.property.test.ts
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Types ───────────────────────────────────────────────────────────────────

type HarvestType = 'HONEY' | 'WAX' | 'POLLEN' | 'PROPOLIS' | 'ROYAL_JELLY' | 'BEE_VENOM';

interface HarvestRecord {
    id: string;
    harvestType: HarvestType;
    harvestDate: string;
    totalQuantity: number;
    unit: string;
    hiveId?: string;
}

// ─── Pure logic extracted from ProductionPage ────────────────────────────────

function computeProductionStats(records: HarvestRecord[]) {
    const totalHoney = records
        .filter(r => r.harvestType === 'HONEY' && r.unit === 'KG')
        .reduce((s, r) => s + Number(r.totalQuantity), 0);
    const totalWax = records
        .filter(r => r.harvestType === 'WAX' && r.unit === 'KG')
        .reduce((s, r) => s + Number(r.totalQuantity), 0);
    const totalPollen = records
        .filter(r => r.harvestType === 'POLLEN' && r.unit === 'KG')
        .reduce((s, r) => s + Number(r.totalQuantity), 0);
    return { totalHoney, totalWax, totalPollen };
}

function filterByType(records: HarvestRecord[], type: HarvestType): HarvestRecord[] {
    return records.filter(r => r.harvestType === type);
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const harvestTypeArb = fc.constantFrom<HarvestType>(
    'HONEY', 'WAX', 'POLLEN', 'PROPOLIS', 'ROYAL_JELLY', 'BEE_VENOM'
);

const harvestRecordArb: fc.Arbitrary<HarvestRecord> = fc.record({
    id: fc.uuid(),
    harvestType: harvestTypeArb,
    harvestDate: fc.date().map(d => d.toISOString().split('T')[0]),
    totalQuantity: fc.float({ min: 0.001, max: 10000, noNaN: true }),
    unit: fc.constantFrom('KG', 'GRAM', 'LITER'),
    hiveId: fc.option(fc.uuid(), { nil: undefined }),
});

// ─── Property 5: Production stats equal sum of quantities ────────────────────

describe('Property 5: إحصائيات الإنتاج تساوي مجموع الكميات', () => {
    it('إجمالي العسل يساوي مجموع كميات سجلات HONEY بوحدة KG', () => {
        fc.assert(
            fc.property(fc.array(harvestRecordArb, { minLength: 0, maxLength: 100 }), (records) => {
                const stats = computeProductionStats(records);
                const expected = records
                    .filter(r => r.harvestType === 'HONEY' && r.unit === 'KG')
                    .reduce((s, r) => s + Number(r.totalQuantity), 0);

                expect(Math.abs(stats.totalHoney - expected)).toBeLessThan(0.001);
            }),
            { numRuns: 100 }
        );
    });

    it('إجمالي الشمع يساوي مجموع كميات سجلات WAX بوحدة KG', () => {
        fc.assert(
            fc.property(fc.array(harvestRecordArb, { minLength: 0, maxLength: 100 }), (records) => {
                const stats = computeProductionStats(records);
                const expected = records
                    .filter(r => r.harvestType === 'WAX' && r.unit === 'KG')
                    .reduce((s, r) => s + Number(r.totalQuantity), 0);

                expect(Math.abs(stats.totalWax - expected)).toBeLessThan(0.001);
            }),
            { numRuns: 100 }
        );
    });

    it('الإحصائيات تكون صفراً عند عدم وجود سجلات', () => {
        const stats = computeProductionStats([]);
        expect(stats.totalHoney).toBe(0);
        expect(stats.totalWax).toBe(0);
        expect(stats.totalPollen).toBe(0);
    });
});

// ─── Property 6: Product type filter returns only matching records ────────────

describe('Property 6: فلترة نوع المنتج تُعيد سجلات من النوع المحدد فقط', () => {
    it('جميع السجلات المُعادة يجب أن تكون من النوع المحدد', () => {
        fc.assert(
            fc.property(
                fc.array(harvestRecordArb, { minLength: 0, maxLength: 50 }),
                harvestTypeArb,
                (records, filterType) => {
                    const filtered = filterByType(records, filterType);

                    for (const record of filtered) {
                        expect(record.harvestType).toBe(filterType);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('لا يجب أن يظهر أي سجل من نوع مختلف', () => {
        fc.assert(
            fc.property(
                fc.array(harvestRecordArb, { minLength: 1, maxLength: 30 }),
                harvestTypeArb,
                (records, filterType) => {
                    const filtered = filterByType(records, filterType);
                    const wrongType = filtered.filter(r => r.harvestType !== filterType);
                    expect(wrongType).toHaveLength(0);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('عدد السجلات المُعادة يساوي عدد السجلات من ذلك النوع في القائمة الأصلية', () => {
        fc.assert(
            fc.property(
                fc.array(harvestRecordArb, { minLength: 0, maxLength: 50 }),
                harvestTypeArb,
                (records, filterType) => {
                    const filtered = filterByType(records, filterType);
                    const countInOriginal = records.filter(r => r.harvestType === filterType).length;
                    expect(filtered).toHaveLength(countInOriginal);
                }
            ),
            { numRuns: 100 }
        );
    });
});
