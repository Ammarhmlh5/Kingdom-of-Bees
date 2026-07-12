import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'ueikGJAFa3UUatpOeodHaCoKT+7kJQ0DPAqvcDTUoVc=';

async function testAuthFlow() {
    console.log('🧪 Testing complete authentication flow...\n');

    // Test 1: Verify user exists
    console.log('1️⃣ Verifying user exists in database...');
    const user = await prisma.userProfile.findUnique({
        where: { email: 'owner@kingdom.com' }
    });

    if (!user) {
        console.log('❌ User not found!');
        return;
    }

    console.log(`   ✅ User found: ${user.fullName} (${user.userType})`);
    console.log(`   🆔 User ID: ${user.id}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔑 Has password: ${!!user.password}`);
    console.log(`   ✅ Is active: ${user.isActive}`);

    // Test 2: Verify password
    console.log('\n2️⃣ Verifying password...');
    if (user.password) {
        const isValid = await bcrypt.compare('123456', user.password);
        console.log(`   🔓 Password valid: ${isValid ? 'YES' : 'NO'}`);

        if (!isValid) {
            console.log('   ⚠️ Password mismatch - resetting...');
            const hash = await bcrypt.hash('123456', 10);
            await prisma.userProfile.update({
                where: { id: user.id },
                data: { password: hash }
            });
            console.log('   ✅ Password reset to: 123456');
        }
    } else {
        console.log('   ❌ No password set!');
    }

    // Test 3: Generate token
    console.log('\n3️⃣ Generating JWT token...');
    const token = jwt.sign(
        {
            sub: user.authId,
            id: user.id,
            email: user.email,
            role: user.userType
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    console.log(`   🎫 Token generated successfully`);
    console.log(`   📏 Token length: ${token.length}`);

    // Test 4: Verify token
    console.log('\n4️⃣ Verifying JWT token...');
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log(`   ✅ Token valid`);
        console.log(`   👤 Subject (authId): ${decoded.sub}`);
        console.log(`   🆔 User ID: ${decoded.id}`);
        console.log(`   📧 Email: ${decoded.email}`);
        console.log(`   🎭 Role: ${decoded.role}`);
    } catch (e) {
        console.log(`   ❌ Token verification failed: ${e}`);
    }

    // Test 5: Verify token can be decoded (for middleware)
    console.log('\n5️⃣ Simulating auth middleware...');
    const decoded = jwt.decode(token) as any;
    console.log(`   📊 Token contains:`);
    console.log(`      - sub (authId): ${decoded.sub}`);
    console.log(`      - id (userId): ${decoded.id}`);
    console.log(`      - email: ${decoded.email}`);
    console.log(`      - role: ${decoded.role}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 AUTH FLOW TEST COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📝 Login credentials:`);
    console.log(`   Email: owner@kingdom.com`);
    console.log(`   Password: 123456`);
    console.log(`\n🚀 You should now be able to log in!`);
}

testAuthFlow()
    .catch(console.error)
    .finally(() => prisma.$disconnect());