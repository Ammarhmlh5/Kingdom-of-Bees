
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.userProfile.findMany({
    where: { email: { startsWith: 'alhomely' } }
  });
  console.log('Users:', users.map(u => u.email));

  const hiveTypes = await prisma.hiveType.findMany();
  console.log('HiveTypes:', hiveTypes.map(ht => ({ id: ht.id, name: ht.nameAr })));

  const beeBreeds = await prisma.beeBreed.findMany();
  console.log('BeeBreeds:', beeBreeds.map(bb => ({ id: bb.id, name: bb.nameAr })));
}

check()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
