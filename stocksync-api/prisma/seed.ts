import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const account = await prisma.account.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Conta Principal' },
  });

  const password = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gerencie.com' },
    update: { password, name: 'Administrador', role: 'admin' },
    create: {
      email: 'admin@gerencie.com',
      password,
      name: 'Administrador',
      role: 'admin',
      accountId: account.id,
    },
  });

  const brands = await Promise.all(
    ['Genérico', 'Nestlé', 'Unilever', 'Coca-Cola'].map(async (name, index) =>
      prisma.brand.upsert({
        where: { id: index + 1 },
        update: { name },
        create: { name, ownerAccountId: account.id },
      })
    )
  );

  const categoryData = [
    { name: 'Alimentos básicos', priority: 3 },
    { name: 'Bebidas', priority: 2 },
    { name: 'Limpeza', priority: 1 },
    { name: 'Higiene/Beleza', priority: 2 },
  ];

  const categories = [];
  for (const cat of categoryData) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, ownerAccountId: account.id },
    });
    if (existing) {
      categories.push(existing);
      continue;
    }
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        prioritySort: cat.priority,
        ownerAccountId: account.id,
        accountCategories: {
          create: { accountId: account.id, priority: cat.priority },
        },
      },
    });
    categories.push(created);
  }

  const brandMap = Object.fromEntries(brands.map((b) => [b.name, b.id]));

  const productSamples = [
    { name: 'Arroz 5kg', brandName: 'Genérico', unit: 'UN', min: 10, max: 100, stock: 45, cats: [0] },
    { name: 'Feijão 1kg', brandName: 'Genérico', unit: 'UN', min: 15, max: 80, stock: 8, cats: [0] },
    { name: 'Refrigerante 2L', brandName: 'Coca-Cola', unit: 'UN', min: 20, max: 120, stock: 55, cats: [1] },
    { name: 'Detergente líquido', brandName: 'Unilever', unit: 'UN', min: 5, max: 50, stock: 3, cats: [2] },
    { name: 'Shampoo 400ml', brandName: 'Unilever', unit: 'UN', min: 8, max: 40, stock: 22, cats: [3] },
  ];

  for (const sample of productSamples) {
    const exists = await prisma.product.findFirst({
      where: { name: sample.name, ownerAccountId: account.id },
    });
    if (exists) continue;

    const product = await prisma.product.create({
      data: {
        name: sample.name,
        brandId: brandMap[sample.brandName],
        unitType: sample.unit,
        ownerAccountId: account.id,
        minLimit: sample.min,
        maxLimit: sample.max,
        currentStock: sample.stock,
        productCategories: {
          create: sample.cats.map((i) => ({ categoryId: categories[i].id })),
        },
        accountProducts: {
          create: {
            accountId: account.id,
            minLimit: sample.min,
            maxLimit: sample.max,
          },
        },
      },
    });
    console.log(`Produto criado: ${product.name}`);
  }

  const suppliers = [
    { name: 'Distribuidora Central', address: 'Rua das Flores, 100 - São Paulo' },
    { name: 'Atacado Sul', address: 'Av. Brasil, 500 - Curitiba' },
  ];

  for (const s of suppliers) {
    const exists = await prisma.supplier.findFirst({
      where: { name: s.name, ownerAccountId: account.id },
    });
    if (exists) continue;
    await prisma.supplier.create({
      data: { ...s, ownerAccountId: account.id },
    });
  }

  console.log('\n=== Seed concluído ===');
  console.log(`Admin: ${admin.email} / Admin@123`);
  console.log(`Conta: ${account.name} (id: ${account.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
