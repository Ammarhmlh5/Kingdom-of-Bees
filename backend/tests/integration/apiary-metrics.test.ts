import request from 'supertest';
import app from '../../src/index';
import { prisma } from '../../src/config/prisma';
import { apiaryMetricsService } from '../../src/services/apiary-metrics.service';

describe('Apiary Metrics Integration Tests', () => {
    let authToken: string;
    let userId: string;
    let apiaryId: string;
    let hiveIds: string[] = [];

    beforeAll(async () => {
        // Register and login a test user
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                email: `metrics-test-${Date.now()}@example.com`,
                password: 'password123',
                fullName: 'Metrics Test User',
                userType: 'OWNER'
            });

        authToken = registerRes.body.data.accessToken;
        userId = registerRes.body.data.user.id;

        // Create a test apiary
        const apiaryRes = await request(app)
            .post('/api/apiaries')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Test Metrics Apiary',
                location: 'Test Location',
                latitude: 30.0,
                longitude: 31.0
            });

        apiaryId = apiaryRes.body.data.id;
    });

    afterAll(async () => {
        // Clean up test data
        if (hiveIds.length > 0) {
            await prisma.hive.deleteMany({
                where: { id: { in: hiveIds } }
            });
        }
        if (apiaryId) {
            await prisma.apiaryMetrics.deleteMany({ where: { apiaryId } });
            await prisma.apiary.delete({ where: { id: apiaryId } });
        }
        if (userId) {
            await prisma.userProfile.delete({ where: { id: userId } });
        }
        await prisma.$disconnect();
    });

    describe('12.1 Test metrics calculation', () => {
        
        it('should calculate metrics for apiary with multiple hives', async () => {
            // Create test hives with different conditions
            // Create a HiveType first
            const hiveType = await prisma.hiveType.create({
                data: { id: '550e8400-e29b-41d4-a716-446655440001', nameAr: 'test', nameEn: 'test', updatedAt: new Date() }
            });

            const hive1 = await prisma.hive.create({
                data: {
                    apiaryId,
                    hiveNumber: '1',
                    name: 'Excellent Hive',
                    condition: 'EXCELLENT',
                    status: 'ACTIVE',
                    hiveTypeId: hiveType.id
                }
            });
            hiveIds.push(hive1.id);

            const hive2 = await prisma.hive.create({
                data: {
                    apiaryId,
                    hiveNumber: '2',
                    name: 'Very Good Hive',
                    condition: 'VERY_GOOD',
                    status: 'ACTIVE',
                    hiveTypeId: hiveType.id
                }
            });
            hiveIds.push(hive2.id);

            const hive3 = await prisma.hive.create({
                data: {
                    apiaryId,
                    hiveNumber: '3',
                    name: 'Good Hive',
                    condition: 'GOOD',
                    status: 'ACTIVE',
                    hiveTypeId: hiveType.id
                }
            });
            hiveIds.push(hive3.id);

            const hive4 = await prisma.hive.create({
                data: {
                    apiaryId,
                    hiveNumber: '4',
                    name: 'Weak Hive',
                    condition: 'WEAK',
                    status: 'ACTIVE',
                    hiveTypeId: hiveType.id
                }
            });
            hiveIds.push(hive4.id);

            // Calculate metrics
            const metrics = await apiaryMetricsService.calculateMetrics(apiaryId);

            // Verify metrics
            expect(metrics).toBeDefined();
            expect(metrics.totalHives).toBe(4);
            expect(metrics.excellentHives).toBe(2); // EXCELLENT + VERY_GOOD
            expect(metrics.goodHives).toBe(1); // GOOD
            expect(metrics.weakHives).toBe(1); // WEAK
            expect(metrics.overallStrength).toBeGreaterThan(0);
            expect(metrics.overallStrength).toBeLessThanOrEqual(100);
            expect(metrics.strengthRating).toBeDefined();
            expect(['EXCELLENT', 'GOOD', 'FAIR', 'WEAK']).toContain(metrics.strengthRating);
        });

        it('should calculate correct percentages', async () => {
            const metrics = await apiaryMetricsService.getLatestMetrics(apiaryId);

            expect(metrics).toBeDefined();
            expect(metrics.excellentPercent).toBe(50); // 2/4 = 50%
            expect(metrics.goodPercent).toBe(25); // 1/4 = 25%
            expect(metrics.weakPercent).toBe(25); // 1/4 = 25%
            
            // Total should be 100%
            const total = metrics.excellentPercent + metrics.goodPercent + metrics.weakPercent;
            expect(total).toBe(100);
        });

        it('should calculate trends when previous metrics exist', async () => {
            // Calculate metrics again (this will create a second metrics entry)
            const newMetrics = await apiaryMetricsService.calculateMetrics(apiaryId);

            // Trends should be 0 since hive counts haven't changed
            expect(newMetrics.excellentTrend).toBe(0);
            expect(newMetrics.goodTrend).toBe(0);
            expect(newMetrics.weakTrend).toBe(0);
        });

        it('should return null for apiary with no active hives', async () => {
            // Create apiary with no hives
            const emptyApiaryRes = await request(app)
                .post('/api/apiaries')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Empty Apiary',
                    location: 'Test Location',
                    latitude: 30.0,
                    longitude: 31.0
                });

            const emptyApiaryId = emptyApiaryRes.body.data.id;

            const metrics = await apiaryMetricsService.calculateMetrics(emptyApiaryId);

            expect(metrics).toBeNull();

            // Clean up
            await prisma.apiary.delete({ where: { id: emptyApiaryId } });
        });

        it('should get metrics via API endpoint', async () => {
            const res = await request(app)
                .get(`/api/apiaries/${apiaryId}/metrics`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.totalHives).toBe(4);
        });

        it('should calculate metrics via API endpoint', async () => {
            const res = await request(app)
                .post(`/api/apiaries/${apiaryId}/metrics/calculate`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.totalHives).toBe(4);
        });

        it('should get metrics history', async () => {
            const res = await request(app)
                .get(`/api/apiaries/${apiaryId}/metrics/history?days=7`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
});
