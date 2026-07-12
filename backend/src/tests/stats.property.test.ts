/**
 * Property-Based Tests for updateDashboardStats
 * Feature: kingdom-bees-v2-integration
 * Properties 9 & 10
 */

import * as fc from 'fast-check';

// Capture the upsert call to verify computed values
const mockUpsert = jest.fn().mockResolvedValue({});

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    apiary: { count: jest.fn() },
    hive: { count: jest.fn() },
    honeyHarvest: {
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    pollenHarvest: { count: jest.fn() },
    royalJellyProduction: { count: jest.fn() },
    alert: { count: jest.fn() },
    inspection: { findFirst: jest.fn() },
    // dashboardStats is mocked here even if not yet in generated client
    dashboardStats: { upsert: mockUpsert },
  },
}));

import prisma from '../config/prisma';
import { updateDashboardStats } from '../lib/stats';

const mockApiary = prisma.apiary.count as jest.Mock;
const mockHive = prisma.hive.count as jest.Mock;
const mockHoneyAgg = prisma.honeyHarvest.aggregate as jest.Mock;
const mockHoneyCount = prisma.honeyHarvest.count as jest.Mock;
const mockPollenCount = prisma.pollenHarvest.count as jest.Mock;
const mockRoyalCount = prisma.royalJellyProduction.count as jest.Mock;
const mockAlertCount = prisma.alert.count as jest.Mock;
const mockInspection = prisma.inspection.findFirst as jest.Mock;

beforeEach(() => jest.clearAllMocks());

// Feature: kingdom-bees-v2-integration, Property 9: صحة حساب updateDashboardStats
describe('Property 9: updateDashboardStats computes correct values', () => {
  it('upsert is called with values matching the mocked data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 50 }),  // totalApiaries
        fc.integer({ min: 0, max: 200 }), // totalHives
        fc.float({ min: 0, max: 1000, noNaN: true }), // totalHoneyKg
        fc.integer({ min: 0, max: 100 }), // honeyCount
        fc.integer({ min: 0, max: 100 }), // pollenCount
        fc.integer({ min: 0, max: 100 }), // royalJellyCount
        fc.integer({ min: 0, max: 20 }),  // activeAlerts
        async (apiaryCount, hiveCount, honeyKg, honeyC, pollenC, royalC, alertCount) => {
          mockApiary.mockResolvedValue(apiaryCount);
          mockHive.mockResolvedValue(hiveCount);
          mockHoneyAgg.mockResolvedValue({ _sum: { quantityKg: honeyKg } });
          mockHoneyCount.mockResolvedValue(honeyC);
          mockPollenCount.mockResolvedValue(pollenC);
          mockRoyalCount.mockResolvedValue(royalC);
          mockAlertCount.mockResolvedValue(alertCount);
          mockInspection.mockResolvedValue(null);
          mockUpsert.mockResolvedValue({});

          await updateDashboardStats('user-1');

          const upsertCall = mockUpsert.mock.calls[mockUpsert.mock.calls.length - 1][0];
          const data = upsertCall.update;

          return (
            data.totalApiaries === apiaryCount &&
            data.totalHives === hiveCount &&
            Math.abs(data.totalHoneyKg - honeyKg) < 0.001 &&
            data.totalProductionEntries === honeyC + pollenC + royalC &&
            data.activeAlerts === alertCount
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: kingdom-bees-v2-integration, Property 10: idempotence لـ updateDashboardStats
describe('Property 10: updateDashboardStats is idempotent', () => {
  it('two consecutive calls with same data produce same upsert values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 0, max: 200 }),
        fc.float({ min: 0, max: 1000, noNaN: true }),
        fc.integer({ min: 0, max: 20 }),
        async (apiaryCount, hiveCount, honeyKg, alertCount) => {
          // Setup same data for both calls
          const setupMocks = () => {
            mockApiary.mockResolvedValue(apiaryCount);
            mockHive.mockResolvedValue(hiveCount);
            mockHoneyAgg.mockResolvedValue({ _sum: { quantityKg: honeyKg } });
            mockHoneyCount.mockResolvedValue(0);
            mockPollenCount.mockResolvedValue(0);
            mockRoyalCount.mockResolvedValue(0);
            mockAlertCount.mockResolvedValue(alertCount);
            mockInspection.mockResolvedValue(null);
            mockUpsert.mockResolvedValue({});
          };

          setupMocks();
          await updateDashboardStats('user-1');
          const call1 = { ...mockUpsert.mock.calls[mockUpsert.mock.calls.length - 1][0].update };

          setupMocks();
          await updateDashboardStats('user-1');
          const call2 = { ...mockUpsert.mock.calls[mockUpsert.mock.calls.length - 1][0].update };

          return (
            call1.totalApiaries === call2.totalApiaries &&
            call1.totalHives === call2.totalHives &&
            call1.activeAlerts === call2.activeAlerts &&
            call1.totalProductionEntries === call2.totalProductionEntries
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
