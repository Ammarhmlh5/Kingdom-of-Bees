import request from 'supertest';
import app from '../../src/index';
import { prisma } from '../../src/config/prisma';

describe('Auth API Integration', () => {
    let testEmail: string;

    describe('POST /api/auth/register', () => {

        it('should register a new user successfully', async () => {
            testEmail = `test-${Date.now()}@example.com`;
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: testEmail,
                    password: 'password123',
                    fullName: 'Test User',
                    userType: 'OWNER'
                });

            if (res.status !== 200) {
                throw new Error(`Registration failed: ${JSON.stringify(res.body, null, 2)}`);
            }
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data.user.email).toBe(testEmail);
            expect(res.body.data).toHaveProperty('accessToken');
        });

        it('should fail significantly with duplicate email', async () => {
            await prisma.userProfile.deleteMany({ where: { email: 'test@example.com' } });

            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    fullName: 'Test User',
                    userType: 'OWNER'
                });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    fullName: 'Test User',
                    userType: 'OWNER'
                });

            expect(res.status).toBe(400);
        });
    });

    afterAll(async () => {
        if (testEmail) {
            await prisma.userProfile.deleteMany({ where: { email: testEmail } });
        }
        await prisma.userProfile.deleteMany({ where: { email: 'login@example.com' } });
        await prisma.userProfile.deleteMany({ where: { email: 'test@example.com' } });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await prisma.userProfile.deleteMany({ where: { email: 'login@example.com' } });
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'login@example.com',
                    password: 'password123',
                    fullName: 'Login User',
                    userType: 'OWNER'
                });
            // Ensure testEmail is set from the registration test or register a new one if not
            if (!testEmail) {
                testEmail = `login-${Date.now()}@example.com`;
                await request(app)
                    .post('/api/auth/register')
                    .send({
                        email: testEmail,
                        password: 'password123',
                        fullName: 'Login User',
                        userType: 'OWNER'
                    });
            } else {
                // If testEmail was set by the register test, ensure it's registered
                // This might be redundant if register test always runs first, but good for isolation
                const existingUser = await prisma.userProfile.findUnique({ where: { email: testEmail } });
                if (!existingUser) {
                    await request(app)
                        .post('/api/auth/register')
                        .send({
                            email: testEmail,
                            password: 'password123',
                            fullName: 'Login User',
                            userType: 'OWNER'
                        });
                }
            }
        });

        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testEmail,
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('accessToken');
        });

        it('should fail with invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
        });
    });
});
