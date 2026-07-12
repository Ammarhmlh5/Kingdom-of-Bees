import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';

const prisma = new PrismaClient();

async function checkTables() {
    const result = await prisma.$queryRaw<any[]>`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns c 
                WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_name IN ('disease_library', 'disease_treatment', 'disease_record', 'treatment_plan')
        ORDER BY table_name;
    `;
    
    logger.info('\n✅ Existing disease-related tables in database:\n');
    logger.info('┌─────────────────────┬──────────────┐');
    logger.info('│ Table Name          │ Column Count │');
    logger.info('├─────────────────────┼──────────────┤');
    result.forEach((row: any) => {
        const name = row.table_name.padEnd(19);
        const cols = String(row.column_count).padEnd(12);
        logger.info(`│ ${name} │ ${cols} │`);
    });
    logger.info('└─────────────────────┴──────────────┘');
    
    const found = result.map((r: any) => r.table_name);
    const required = ['disease_library', 'disease_treatment', 'disease_record', 'treatment_plan'];
    const missing = required.filter(t => !found.includes(t));
    
    if (missing.length === 0) {
        logger.info('\n🎉 All required tables are present in the database!\n');
    } else {
        logger.info('\n❌ Missing tables:', missing, '\n');
    }
    
    await prisma.$disconnect();
}

checkTables().catch((err) => logger.error('checkTables failed:', err));
