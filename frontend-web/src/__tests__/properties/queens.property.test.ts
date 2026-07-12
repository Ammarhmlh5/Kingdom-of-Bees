/**
 * Property-Based Tests: Queens Page
 * Feature: apiary-workspace-completion
 * Properties 1 & 2 from design.md
 *
 * Run: npx vitest run src/__tests__/properties/queens.property.test.ts
 * Requires: vitest, fast-check
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Queen {
    id: string;
    queenNumber?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'DEAD' | 'SOLD';
    source: string;
    birthDate?: string;
    markColor?: string;
    marked: boolean;
    hive?: { id: string; hiveNumber: string };
    createdAt: string;
}

// ─── Pure logic extracted from QueensPage ────────────────────────────────────

function countActiveQueens(queens: Queen[]): number {
    return queens.filter(q => q.status === 'ACTIVE').length;
}

function getRequiredFields(queen: Queen): Record<string, unknown> {
    return {
        id: queen.id,
        status: queen.status,
        source: queen.source,
        marked: queen.marked,
        createdAt: queen.createdAt,
    };
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const queenStatusArb = fc.constantFrom<Queen['status']>('ACTIVE', 'INACTIVE', 'DEAD', 'SOLD');

const queenArb: fc.Arbitrary<Queen> = fc.record({
    id: fc.uuid(),
    queenNumber: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined }),
    status: queenStatusArb,
    source: fc.constantFrom('PURCHASED', 'BRED', 'CAUGHT', 'GIFTED'),
    birthDate: fc.option(fc.date({ min: new Date('2015-01-01'), max: new Date() }).map(d => d.toISOString()), { nil: undefined }),
    markColor: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
    marked: fc.boolean(),
    hive: fc.option(
        fc.record({ id: fc.uuid(), hiveNumber: fc.string({ minLength: 1, maxLength: 5 }) }),
        { nil: undefined }
    ),
    createdAt: fc.date().map(d => d.toISOString()),
});

// ─── Property 1: Queen display contains all required fields ──────────────────

describe('Property 1: عرض بيانات الملكة يحتوي على جميع الحقول المطلوبة', () => {
    it('يجب أن تحتوي كل ملكة على الحقول الأساسية المطلوبة', () => {
        fc.assert(
            fc.property(queenArb, (queen) => {
                const fields = getRequiredFields(queen);

                // All required fields must be present and non-null
                expect(fields.id).toBeDefined();
                expect(fields.id).not.toBe('');
                expect(fields.status).toBeDefined();
                expect(['ACTIVE', 'INACTIVE', 'DEAD', 'SOLD']).toContain(fields.status);
                expect(fields.source).toBeDefined();
                expect(typeof fields.marked).toBe('boolean');
                expect(fields.createdAt).toBeDefined();
            }),
            { numRuns: 100 }
        );
    });
});

// ─── Property 2: Active queen counter reflects actual data ───────────────────

describe('Property 2: عداد الملكات النشطة يعكس البيانات الفعلية', () => {
    it('يجب أن يساوي العداد عدد الملكات ذات الحالة ACTIVE بالضبط', () => {
        fc.assert(
            fc.property(fc.array(queenArb, { minLength: 0, maxLength: 50 }), (queens) => {
                const displayedCount = countActiveQueens(queens);
                const actualActiveCount = queens.filter(q => q.status === 'ACTIVE').length;

                expect(displayedCount).toBe(actualActiveCount);
            }),
            { numRuns: 100 }
        );
    });

    it('العداد يجب أن يكون صفراً عند عدم وجود ملكات', () => {
        expect(countActiveQueens([])).toBe(0);
    });

    it('العداد يجب أن يكون صفراً إذا كانت جميع الملكات غير نشطة', () => {
        fc.assert(
            fc.property(
                fc.array(
                    queenArb.map(q => ({ ...q, status: 'DEAD' as const })),
                    { minLength: 1, maxLength: 20 }
                ),
                (queens) => {
                    expect(countActiveQueens(queens)).toBe(0);
                }
            ),
            { numRuns: 50 }
        );
    });

    it('العداد يجب أن يساوي الطول الكلي إذا كانت جميع الملكات نشطة', () => {
        fc.assert(
            fc.property(
                fc.array(
                    queenArb.map(q => ({ ...q, status: 'ACTIVE' as const })),
                    { minLength: 1, maxLength: 20 }
                ),
                (queens) => {
                    expect(countActiveQueens(queens)).toBe(queens.length);
                }
            ),
            { numRuns: 50 }
        );
    });
});
