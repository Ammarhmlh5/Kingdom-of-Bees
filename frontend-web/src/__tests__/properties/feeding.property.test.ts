/**
 * Property-Based Tests: Feeding Page
 * Feature: apiary-workspace-completion
 * Property 7 from design.md
 *
 * Run: npx vitest run src/__tests__/properties/feeding.property.test.ts
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ─── Types ───────────────────────────────────────────────────────────────────

type FeedingLocation = 'INTERNAL' | 'EXTERNAL';
type ContentType = 'SUGAR_SYRUP' | 'PROTEIN' | 'POLLEN_SUBSTITUTE' | 'FONDANT' | 'MEDICINAL' | 'SUPPLEMENT' | 'OTHER';

interface FeedingRecord {
    id: string;
    feedingLocation: FeedingLocation;
    contentType: ContentType;
    quantityKg: number;
    feedingDate: string;
    hiveId?: string;
}

// ─── Pure logic extracted from FeedingPage ───────────────────────────────────

function filterByLocation(records: FeedingRecord[], location: FeedingLocation): FeedingRecord[] {
    return records.filter(r => r.feedingLocation === location);
}

function computeFeedingStats(records: FeedingRecord[], month: number, year: number) {
    const thisMonth = records.filter(r => {
        const d = new Date(r.feedingDate);
        return d.getMonth() === month && d.getFullYear() === year;
    });

    const totalSugar = thisMonth
        .filter(r => r.contentType === 'SUGAR_SYRUP')
        .reduce((s, r) => s + Number(r.quantityKg), 0);

    const totalProtein = thisMonth
        .filter(r => r.contentType === 'PROTEIN')
        .reduce((s, r) => s + Number(r.quantityKg), 0);

    return { totalSugar, totalProtein, count: thisMonth.length };
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const feedingLocationArb = fc.constantFrom<FeedingLocation>('INTERNAL', 'EXTERNAL');
const contentTypeArb = fc.constantFrom<ContentType>(
    'SUGAR_SYRUP', 'PROTEIN', 'POLLEN_SUBSTITUTE', 'FONDANT', 'MEDICINAL', 'SUPPLEMENT', 'OTHER'
);

const feedingRecordArb: fc.Arbitrary<FeedingRecord> = fc.record({
    id: fc.uuid(),
    feedingLocation: feedingLocationArb,
    contentType: contentTypeArb,
    quantityKg: fc.float({ min: 0.01, max: 1000, noNaN: true }),
    feedingDate: fc.date({
        min: new Date('2023-01-01'),
        max: new Date('2026-12-31'),
    }).map(d => d.toISOString()),
    hiveId: fc.option(fc.uuid(), { nil: undefined }),
});

// ─── Property 7: Feeding location filter returns only matching records ────────

describe('Property 7: فلترة نوع الغذاء تُعيد سجلات من النوع المحدد فقط', () => {
    it('جميع السجلات المُعادة يجب أن تكون من الموقع المحدد (داخلي/خارجي)', () => {
        fc.assert(
            fc.property(
                fc.array(feedingRecordArb, { minLength: 0, maxLength: 50 }),
                feedingLocationArb,
                (records, location) => {
                    const filtered = filterByLocation(records, location);

                    for (const record of filtered) {
                        expect(record.feedingLocation).toBe(location);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('لا يجب أن يظهر أي سجل من موقع مختلف', () => {
        fc.assert(
            fc.property(
                fc.array(feedingRecordArb, { minLength: 1, maxLength: 30 }),
                feedingLocationArb,
                (records, location) => {
                    const filtered = filterByLocation(records, location);
                    const wrongLocation = filtered.filter(r => r.feedingLocation !== location);
                    expect(wrongLocation).toHaveLength(0);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('مجموع السجلات الداخلية والخارجية يساوي الإجمالي', () => {
        fc.assert(
            fc.property(
                fc.array(feedingRecordArb, { minLength: 0, maxLength: 50 }),
                (records) => {
                    const internal = filterByLocation(records, 'INTERNAL');
                    const external = filterByLocation(records, 'EXTERNAL');
                    expect(internal.length + external.length).toBe(records.length);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('إحصائيات السكر تساوي مجموع كميات SUGAR_SYRUP في الشهر المحدد', () => {
        fc.assert(
            fc.property(
                fc.array(feedingRecordArb, { minLength: 0, maxLength: 50 }),
                fc.integer({ min: 0, max: 11 }),
                fc.integer({ min: 2023, max: 2026 }),
                (records, month, year) => {
                    const stats = computeFeedingStats(records, month, year);
                    const expected = records
                        .filter(r => {
                            const d = new Date(r.feedingDate);
                            return d.getMonth() === month && d.getFullYear() === year && r.contentType === 'SUGAR_SYRUP';
                        })
                        .reduce((s, r) => s + Number(r.quantityKg), 0);

                    expect(Math.abs(stats.totalSugar - expected)).toBeLessThan(0.001);
                }
            ),
            { numRuns: 100 }
        );
    });
});
