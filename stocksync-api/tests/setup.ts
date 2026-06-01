import { after } from 'node:test';
import { prisma } from '../src/lib/prisma';

after(async () => {
  await prisma.$disconnect();
});
