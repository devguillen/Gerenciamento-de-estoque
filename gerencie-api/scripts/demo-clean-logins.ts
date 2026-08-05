/**
 * Remove os logs de LOGIN gerados hoje pelas rodadas de captura automatizada.
 * O demo-seed só cria logins de 1 dia atrás para trás, então isto apaga
 * exclusivamente o ruído da ferramenta de screenshot.
 *
 * Uso:  npx tsx scripts/demo-clean-logins.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { count } = await prisma.auditLog.deleteMany({
    where: { action: 'LOGIN', createdAt: { gte: startOfToday } },
  });

  const restantes = await prisma.auditLog.count();
  console.log(`Logins de hoje removidos: ${count}`);
  console.log(`Logs restantes: ${restantes}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
