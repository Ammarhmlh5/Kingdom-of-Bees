
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verify() {
  console.log('📊 Verification Summary:');
  
  const users = await prisma.userProfile.count({ where: { email: { contains: 'alhomely' } } });
  console.log(`- Users (alhomely): ${users}`);

  const apiaries = await prisma.apiary.count({ where: { name: { contains: 'منحل' } } });
  console.log(`- Total Apiaries: ${apiaries}`);

  const hives = await prisma.hive.count();
  console.log(`- Total Hives: ${hives}`);

  const inspections = await prisma.inspection.count();
  console.log(`- Total Inspections: ${inspections}`);

  const weather = await prisma.weatherData.count();
  console.log(`- Total Weather Records: ${weather}`);

  const harvests = await prisma.harvestRecord.count();
  console.log(`- Total Harvest Records: ${harvests}`);

  const ops = await prisma.apiaryOperation.count();
  console.log(`- Total Apiary Operations: ${ops}`);

  const findings = await prisma.inspectionFinding.count();
  console.log(`- Total Inspection Findings: ${findings}`);

  const actions = await prisma.inspectionAction.count();
  console.log(`- Total Inspection Actions: ${actions}`);
}

verify()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
