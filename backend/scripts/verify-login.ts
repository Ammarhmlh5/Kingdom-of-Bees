import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'ueikGJAFa3UUatpOeodHaCoKT+7kJQ0DPAqvcDTUoVc=';

async function verifyLogin() {
    console.log('🔐 Testing full login flow...\n');

    const testCases = [
        { email: 'owner@kingdom.com', password: '123456', expectedRole: 'OWNER' },
        { email: 'admin@kingdom.com', password: '123456', expectedRole: 'ADMIN' },
        { email: 'dev@test.com', password: '123456', expectedRole: 'ADMIN' },
    ];

    for (const testCase of testCases) {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📧 Testing: ${testCase.email}`);
        console.log(`🔑 Password: ${testCase.password}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

        // 1. Find user
        const user = await prisma.userProfile.findUnique({ where: { email: testCase.email } });

        if (!user) {
            console.log(`❌ User not found!\n`);
            continue;
        }

        console.log(`✅ User found: ${user.fullName}`);
        console.log(`   Type: ${user.userType}`);

        // 2. Verify password
        if (user.password && testCase.password) {
            const isValid = await bcrypt.compare(testCase.password, user.password);
            console.log(`🔓 Password valid: ${isValid ? 'YES' : 'NO'}`);

            if (isValid) {
                // 3. Generate token
                const token = jwt.sign(
                    { sub: user.authId, id: user.id, email: user.email, role: user.userType },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                console.log(`🎫 Token generated: ${token.substring(0, 50)}...`);

                // 4. Verify token
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    console.log(`✅ Token verified: role=${(decoded as any).role}`);
                } catch (e) {
                    console.log(`❌ Token verification failed: ${e}`);
                }
            }
        }

        console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Login verification complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

verifyLogin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());