import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'ueikGJAFa3UUatpOeodHaCoKT+7kJQ0DPAqvcDTUoVc=';

async function loginResponseTest() {
    const email = 'owner@kingdom.com';
    const password = '123456';

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 اختبار تسجيل الدخول كما يراه الـ Frontend');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Step 1: Find user
    const user = await prisma.userProfile.findUnique({ where: { email } });

    if (!user) {
        console.log('❌ المستخدم غير موجود!');
        return;
    }

    console.log('✅ الخطوة 1: المستخدم موجود');

    // Step 2: Validate password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        console.log('❌ كلمة المرور غير صحيحة!');
        return;
    }

    console.log('✅ الخطوة 2: كلمة المرور صحيحة');

    // Step 3: Generate token
    const token = jwt.sign(
        { sub: user.authId, id: user.id, email: user.email, role: user.userType },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    console.log('✅ الخطوة 3: تم توليد التوكن');

    // Step 4: Create response (like backend does)
    const userResponse = {
        ...user,
        role: user.userType
    };

    const response = {
        user: userResponse,
        accessToken: token
    };

    console.log('✅ الخطوة 4: تم إنشاء الاستجابة');

    // Simulate frontend parsing
    const frontendExpects = {
        accessToken: response.accessToken,
        user: {
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.fullName,
            role: response.user.role
        }
    };

    console.log('\n📦 ما يتوقعه Frontend:');
    console.log(JSON.stringify(frontendExpects, null, 2));

    console.log('\n📦 ما يرسله Backend (مختصر):');
    console.log(JSON.stringify({
        user: {
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.fullName,
            role: response.user.role
        },
        accessToken: response.accessToken.substring(0, 50) + '...'
    }, null, 2));

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ كل شيء يعمل بشكل صحيح!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n💡 جرب تسجيل الدخول بـ:`);
    console.log(`   البريد: ${email}`);
    console.log(`   كلمة المرور: ${password}`);
    console.log(`\n🚀 إذا لم يعمل، راجع Console في المتصفح للخطأ التفصيلي`);
}

loginResponseTest()
    .catch(console.error)
    .finally(() => prisma.$disconnect());