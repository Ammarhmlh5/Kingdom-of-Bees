import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './utils/logger';

const prisma = new PrismaClient();

async function main() {
    logger.info('🔍 Checking for existing admin user...');

    const existing = await prisma.userProfile.findFirst({
        where: { email: 'admin@kingdom.com' }
    });

    if (existing) {
        logger.info('✅ Admin user already exists:', existing.email);
        logger.info('   Resetting password to: Admin@123');
        const adminPassword = await bcrypt.hash('Admin@123', 10);
        await prisma.userProfile.update({
            where: { id: existing.id },
            data: { password: adminPassword, userType: 'ADMIN', isActive: true, isVerified: true }
        });
        logger.info('✅ Admin password reset successfully!');
        return;
    }

    logger.info('👤 Creating new admin user...');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.userProfile.create({
        data: {
            authId: uuidv4(),
            email: 'admin@kingdom.com',
            fullName: 'مدير النظام',
            userType: 'ADMIN',
            password: adminPassword,
            phone: '+966500000000',
            country: 'Saudi Arabia',
            region: 'Riyadh',
            city: 'Riyadh',
            language: 'ar',
            timezone: 'Asia/Riyadh',
            isActive: true,
            isVerified: true,
        },
    });
    logger.info('✅ Admin user created successfully:', admin.email);
    logger.info('📧 Email:    admin@kingdom.com');
    logger.info('🔑 Password: Admin@123');
}

main()
    .catch((e) => {
        logger.error('❌ Error:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
