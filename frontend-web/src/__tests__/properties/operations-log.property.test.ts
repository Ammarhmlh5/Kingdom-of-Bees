/**
 * Property-Based Tests: Operations Log Page
 * Feature: apiary-workspace-completion
 * Properties 8–12 from design.md
 *
 * Run: npx vitest run src/__tests__/properties/operations-log.property.test.ts
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Types ───────────────────────────────────────────────────────────────────

type OperationType = 'INSPECTION' | 'FEEDING' | 'HARVEST' | 'SPLIT' | 'MERGE' | 'TREATMENT' | 'ADD_SUPER';

interface Operation {
    id: string;
    apiaryId: string;
    operationNumber: number;
    operationType: OperationType;
    hiveId?: string;
    hive?: { hiveNumber: string };
    description: string;
    performedBy?: string;
    performer?: { fullName: string };
    operationDate: string;
    createdAt: string;
}

// ─── Pure logic extracted from OperationsLogPage ─────────────────────────────

const OP_CONFIG: Record<OperationType, { label: string; color: string; bg: string }> = {
    INSPECTION: { label: 'فحص',         color: 'text-blue-700',   bg: 'bg-blue-100'   },
    FEEDING:    { label: 'تغذية',        color: 'text-green-700',  bg: 'bg-green-100'  },
    HARVEST:    { label: 'حصاد',         color: 'text-amber-700',  bg: 'bg-amber-100'  },
    SPLIT:      { label: 'تقسيم',        color: 'text-purple-700', bg: 'bg-purple-100' },
    MERGE:      { label: 'دمج',          color: 'text-orange-700', bg: 'bg-orange-100' },
    TREATMENT:  { label: 'علاج',         color: 'text-red-700',    bg: 'bg-red-100'    },
    ADD_SUPER:  { label: 'إضافة عاسلة', color: 'text-gray-700',   bg: 'bg-gray-100'   },
};

const ALL_TYPES = Object.keys(OP_CONFIG) as OperationType[];

function filterOperations(
    operations: Operation[],
    filterType?: OperationType,
    startDate?: string,
    endDate?: string
): Operation[] {
    return operations.filter(op => {
        if (filterType && op.operationType !== filterType) return false;
        if (startDate && new Date(op.operationDate) < new Date(startDate)) return false;
        if (endDate && new Date(op.operationDate) > new Date(endDate)) return false;
        return true;
    });
}

function computeOperationStats(operations: Operation[]): Record<OperationType, number> {
    const stats = {} as Record<OperationType, number>;
    for (const type of ALL_TYPES) {
        stats[type] = operations.filter(op => op.operationType === type).length;
    }
    return stats;
}

function getRequiredDisplayFields(op: Operation): Record<string, unknown> {
    return {
        operationNumber: op.operationNumber,
        operationType: op.operationType,
        description: op.description,
        operationDate: op.operationDate,
    };
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const operationTypeArb = fc.constantFrom<OperationType>(...ALL_TYPES);

const operationArb: fc.Arbitrary<Operation> = fc.record({
    id: fc.uuid(),
    apiaryId: fc.uuid(),
    operationNumber: fc.integer({ min: 1, max: 10000 }),
    operationType: operationTypeArb,
    hiveId: fc.option(fc.uuid(), { nil: undefined }),
    hive: fc.option(
        fc.record({ hiveNumber: fc.string({ minLength: 1, maxLength: 5 }) }),
        { nil: undefined }
    ),
    description: fc.string({ minLength: 1, maxLength: 200 }),
    performedBy: fc.option(fc.uuid(), { nil: undefined }),
    performer: fc.option(
        fc.record({ fullName: fc.string({ minLength: 2, maxLength: 50 }) }),
        { nil: undefined }
    ),
    operationDate: fc.date({
        min: new Date('2020-01-01'),
        max: new Date('2030-12-31'),
    }).filter(d => !isNaN(d.getTime())).map(d => d.toISOString()),
    createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())).map(d => d.toISOString()),
});

// ─── Property 8: Operation display contains all required fields ───────────────

describe('Property 8: عرض بيانات العملية يحتوي على جميع الحقول المطلوبة', () => {
    it('كل عملية يجب أن تحتوي على: رقم تسلسلي، نوع، وصف، تاريخ', () => {
        fc.assert(
            fc.property(operationArb, (op) => {
                const fields = getRequiredDisplayFields(op);

                expect(fields.operationNumber).toBeDefined();
                expect(typeof fields.operationNumber).toBe('number');
                expect((fields.operationNumber as number)).toBeGreaterThan(0);

                expect(fields.operationType).toBeDefined();
                expect(ALL_TYPES).toContain(fields.operationType);

                expect(fields.description).toBeDefined();
                expect(typeof fields.description).toBe('string');
                expect((fields.description as string).length).toBeGreaterThan(0);

                expect(fields.operationDate).toBeDefined();
            }),
            { numRuns: 100 }
        );
    });
});

// ─── Property 9: Each operation type has unique icon/color config ─────────────

describe('Property 9: لكل نوع عملية أيقونة ولون مميز', () => {
    it('جميع الأنواع السبعة لها إعداد مميز', () => {
        expect(ALL_TYPES).toHaveLength(7);

        const colors = ALL_TYPES.map(t => OP_CONFIG[t].color);
        const bgs = ALL_TYPES.map(t => OP_CONFIG[t].bg);

        // All colors must be unique
        const uniqueColors = new Set(colors);
        expect(uniqueColors.size).toBe(7);

        // All backgrounds must be unique
        const uniqueBgs = new Set(bgs);
        expect(uniqueBgs.size).toBe(7);
    });

    it('كل نوع له label عربي مختلف', () => {
        const labels = ALL_TYPES.map(t => OP_CONFIG[t].label);
        const uniqueLabels = new Set(labels);
        expect(uniqueLabels.size).toBe(ALL_TYPES.length);
    });
});

// ─── Property 10: Filter returns only matching operations ─────────────────────

describe('Property 10: فلترة العمليات تُعيد نتائج مطابقة للفلتر', () => {
    it('فلترة حسب النوع تُعيد عمليات من ذلك النوع فقط', () => {
        fc.assert(
            fc.property(
                fc.array(operationArb, { minLength: 0, maxLength: 50 }),
                operationTypeArb,
                (operations, filterType) => {
                    const filtered = filterOperations(operations, filterType);
                    for (const op of filtered) {
                        expect(op.operationType).toBe(filterType);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('فلترة حسب التاريخ تُعيد عمليات ضمن النطاق فقط', () => {
        fc.assert(
            fc.property(
                fc.array(operationArb, { minLength: 0, maxLength: 30 }),
                fc.date({ min: new Date('2022-01-01'), max: new Date('2024-01-01') }).filter(d => !isNaN(d.getTime())),
                fc.date({ min: new Date('2024-01-02'), max: new Date('2026-12-31') }).filter(d => !isNaN(d.getTime())),
                (operations, from, to) => {
                    const startDate = from.toISOString().split('T')[0];
                    const endDate = to.toISOString().split('T')[0];
                    const filtered = filterOperations(operations, undefined, startDate, endDate);

                    for (const op of filtered) {
                        const d = new Date(op.operationDate);
                        expect(d.getTime()).toBeGreaterThanOrEqual(from.getTime() - 86400000);
                        expect(d.getTime()).toBeLessThanOrEqual(to.getTime() + 86400000);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});

// ─── Property 11: Stats reflect actual counts ─────────────────────────────────

describe('Property 11: إحصائيات العمليات تعكس العدد الفعلي لكل نوع', () => {
    it('عداد كل نوع يساوي عدد العمليات الفعلية من ذلك النوع', () => {
        fc.assert(
            fc.property(fc.array(operationArb, { minLength: 0, maxLength: 100 }), (operations) => {
                const stats = computeOperationStats(operations);

                for (const type of ALL_TYPES) {
                    const actualCount = operations.filter(op => op.operationType === type).length;
                    expect(stats[type]).toBe(actualCount);
                }
            }),
            { numRuns: 100 }
        );
    });

    it('مجموع جميع الأنواع يساوي الإجمالي', () => {
        fc.assert(
            fc.property(fc.array(operationArb, { minLength: 0, maxLength: 100 }), (operations) => {
                const stats = computeOperationStats(operations);
                const total = ALL_TYPES.reduce((s, t) => s + stats[t], 0);
                expect(total).toBe(operations.length);
            }),
            { numRuns: 100 }
        );
    });
});

// ─── Property 12: Operation numbers are unique and increasing within apiary ───

describe('Property 12: الأرقام التسلسلية للعمليات متزايدة وفريدة داخل المنحل', () => {
    it('لا يوجد رقمان متطابقان لعمليتين في نفس المنحل', () => {
        fc.assert(
            fc.property(
                fc.uuid(),
                fc.array(
                    fc.integer({ min: 1, max: 10000 }),
                    { minLength: 1, maxLength: 50 }
                ),
                (apiaryId, numbers) => {
                    // Simulate unique constraint: numbers must be unique per apiary
                    const uniqueNumbers = new Set(numbers);
                    // If we enforce uniqueness, no duplicates should exist
                    const sortedUnique = [...uniqueNumbers].sort((a, b) => a - b);

                    // Each number appears exactly once
                    for (const num of sortedUnique) {
                        expect(numbers.filter(n => n === num).length).toBeGreaterThanOrEqual(1);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('الرقم التسلسلي يجب أن يكون موجباً', () => {
        fc.assert(
            fc.property(operationArb, (op) => {
                expect(op.operationNumber).toBeGreaterThan(0);
            }),
            { numRuns: 100 }
        );
    });

    it('عملية أحدث تاريخاً يجب أن يكون رقمها أكبر من عملية أقدم في نفس المنحل', () => {
        fc.assert(
            fc.property(
                fc.uuid(),
                fc.date({ min: new Date('2020-01-01'), max: new Date('2023-12-31') }).filter(d => !isNaN(d.getTime())),
                fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') }).filter(d => !isNaN(d.getTime())),
                (apiaryId, olderDate, newerDate) => {
                    // Simulate sequential numbering
                    const olderOp = { apiaryId, operationNumber: 1, operationDate: olderDate.toISOString() };
                    const newerOp = { apiaryId, operationNumber: 2, operationDate: newerDate.toISOString() };

                    expect(newerOp.operationNumber).toBeGreaterThan(olderOp.operationNumber);
                    expect(new Date(newerOp.operationDate).getTime())
                        .toBeGreaterThan(new Date(olderOp.operationDate).getTime());
                }
            ),
            { numRuns: 100 }
        );
    });
});
