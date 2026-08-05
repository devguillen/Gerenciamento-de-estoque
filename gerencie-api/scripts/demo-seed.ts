/**
 * demo-seed.ts — popula o banco com dados fictícios ricos para capturas de tela.
 *
 * NÃO é o seed do projeto. O seed oficial continua em prisma/seed.ts.
 * Este script apaga catálogo, movimentações e logs, e reconstrói tudo com
 * ~44 produtos, ~90 dias de histórico e logs de auditoria coerentes.
 *
 * Uso:  npx tsx scripts/demo-seed.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------- utilidades

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260804);
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

const NOW = new Date();
const DAY_MS = 86_400_000;

function daysAgo(n: number, hour = 9): Date {
  const d = new Date(NOW.getTime() - n * DAY_MS);
  d.setHours(hour, randInt(0, 59), randInt(0, 59), 0);
  return d;
}

const money = (n: number) => Math.round(n * 100) / 100;

// ------------------------------------------------------------------ catálogo

type Status = 'em_falta' | 'baixo' | 'ok' | 'acima' | 'sem_meta';

interface CatalogItem {
  name: string;
  category: string;
  brand: string;
  unit: string;
  price: number;
  volume: number; // magnitude típica de giro
  status: Status;
}

const CATEGORIES = [
  { name: 'Alimentos básicos', priority: 5 },
  { name: 'Bebidas', priority: 4 },
  { name: 'Limpeza', priority: 3 },
  { name: 'Higiene/Beleza', priority: 2 },
  { name: 'Descartáveis', priority: 1 },
  { name: 'Padaria', priority: 1 },
];

// Marcas fictícias de propósito — nada de marca real em material público.
const BRANDS = [
  'Vale Verde',
  'Sol Nascente',
  'Aurora',
  'Bom Sabor',
  'Cristalina',
  'Prima',
  'BrilhaMais',
  'Naturela',
  'Campo Alto',
  'Nova Casa',
  'Dose Certa',
  'Genérico',
];

const SUPPLIERS = [
  { name: 'Distribuidora Central', address: 'Rua das Flores, 100 — São Paulo/SP' },
  { name: 'Atacado Sul', address: 'Av. Brasil, 500 — Curitiba/PR' },
  { name: 'Comercial Aurora', address: 'Rod. BR-116, km 42 — Contagem/MG' },
  { name: 'Rede Abastece', address: 'Av. das Indústrias, 2300 — Canoas/RS' },
  { name: 'Log Norte Distribuição', address: 'Rua Amazonas, 87 — Manaus/AM' },
  { name: 'Mercantil Vale', address: 'Av. Getúlio Vargas, 1450 — Campinas/SP' },
];

const CATALOG: CatalogItem[] = [
  // Alimentos básicos
  { name: 'Arroz branco tipo 1 — 5kg', category: 'Alimentos básicos', brand: 'Campo Alto', unit: 'PCT', price: 24.9, volume: 120, status: 'ok' },
  { name: 'Feijão carioca — 1kg', category: 'Alimentos básicos', brand: 'Campo Alto', unit: 'PCT', price: 8.49, volume: 90, status: 'baixo' },
  { name: 'Açúcar refinado — 1kg', category: 'Alimentos básicos', brand: 'Bom Sabor', unit: 'PCT', price: 4.79, volume: 100, status: 'ok' },
  { name: 'Óleo de soja — 900ml', category: 'Alimentos básicos', brand: 'Sol Nascente', unit: 'UN', price: 7.29, volume: 80, status: 'ok' },
  { name: 'Macarrão espaguete — 500g', category: 'Alimentos básicos', brand: 'Bom Sabor', unit: 'PCT', price: 4.15, volume: 110, status: 'acima' },
  { name: 'Sal refinado — 1kg', category: 'Alimentos básicos', brand: 'Cristalina', unit: 'PCT', price: 2.35, volume: 60, status: 'ok' },
  { name: 'Farinha de trigo — 1kg', category: 'Alimentos básicos', brand: 'Campo Alto', unit: 'PCT', price: 5.6, volume: 70, status: 'ok' },
  { name: 'Molho de tomate — 340g', category: 'Alimentos básicos', brand: 'Bom Sabor', unit: 'UN', price: 3.29, volume: 130, status: 'ok' },
  { name: 'Café torrado e moído — 500g', category: 'Alimentos básicos', brand: 'Aurora', unit: 'PCT', price: 18.9, volume: 85, status: 'baixo' },
  { name: 'Leite integral — 1L', category: 'Alimentos básicos', brand: 'Vale Verde', unit: 'CX', price: 5.49, volume: 200, status: 'ok' },
  { name: 'Biscoito recheado — 130g', category: 'Alimentos básicos', brand: 'Prima', unit: 'UN', price: 2.79, volume: 150, status: 'ok' },
  { name: 'Atum ralado em óleo — 170g', category: 'Alimentos básicos', brand: 'Sol Nascente', unit: 'UN', price: 9.9, volume: 55, status: 'em_falta' },

  // Bebidas
  { name: 'Refrigerante cola — 2L', category: 'Bebidas', brand: 'Dose Certa', unit: 'UN', price: 9.49, volume: 140, status: 'ok' },
  { name: 'Água mineral sem gás — 500ml', category: 'Bebidas', brand: 'Cristalina', unit: 'UN', price: 2.2, volume: 250, status: 'acima' },
  { name: 'Suco de laranja integral — 1L', category: 'Bebidas', brand: 'Naturela', unit: 'CX', price: 11.9, volume: 70, status: 'ok' },
  { name: 'Cerveja pilsen lata — 350ml', category: 'Bebidas', brand: 'Dose Certa', unit: 'UN', price: 3.99, volume: 220, status: 'ok' },
  { name: 'Energético — 250ml', category: 'Bebidas', brand: 'Dose Certa', unit: 'UN', price: 8.5, volume: 60, status: 'baixo' },
  { name: 'Refrigerante guaraná lata — 350ml', category: 'Bebidas', brand: 'Dose Certa', unit: 'UN', price: 3.49, volume: 180, status: 'ok' },
  { name: 'Chá gelado limão — 1,5L', category: 'Bebidas', brand: 'Naturela', unit: 'UN', price: 7.79, volume: 65, status: 'sem_meta' },

  // Limpeza
  { name: 'Detergente líquido neutro — 500ml', category: 'Limpeza', brand: 'BrilhaMais', unit: 'UN', price: 2.49, volume: 160, status: 'ok' },
  { name: 'Sabão em pó — 1kg', category: 'Limpeza', brand: 'BrilhaMais', unit: 'PCT', price: 14.9, volume: 90, status: 'ok' },
  { name: 'Desinfetante lavanda — 2L', category: 'Limpeza', brand: 'Nova Casa', unit: 'UN', price: 8.9, volume: 75, status: 'baixo' },
  { name: 'Água sanitária — 1L', category: 'Limpeza', brand: 'BrilhaMais', unit: 'UN', price: 4.29, volume: 95, status: 'ok' },
  { name: 'Amaciante de roupas — 2L', category: 'Limpeza', brand: 'Nova Casa', unit: 'UN', price: 12.5, volume: 70, status: 'ok' },
  { name: 'Esponja multiuso — 4un', category: 'Limpeza', brand: 'Nova Casa', unit: 'PCT', price: 6.9, volume: 85, status: 'ok' },
  { name: 'Limpador multiuso — 500ml', category: 'Limpeza', brand: 'BrilhaMais', unit: 'UN', price: 5.49, volume: 100, status: 'ok' },
  { name: 'Saco de lixo 50L — 30un', category: 'Limpeza', brand: 'Prima', unit: 'PCT', price: 13.9, volume: 60, status: 'em_falta' },

  // Higiene/Beleza
  { name: 'Shampoo hidratante — 400ml', category: 'Higiene/Beleza', brand: 'Naturela', unit: 'UN', price: 16.9, volume: 70, status: 'ok' },
  { name: 'Condicionador hidratante — 400ml', category: 'Higiene/Beleza', brand: 'Naturela', unit: 'UN', price: 17.5, volume: 65, status: 'ok' },
  { name: 'Sabonete em barra — 90g', category: 'Higiene/Beleza', brand: 'Aurora', unit: 'UN', price: 2.79, volume: 190, status: 'acima' },
  { name: 'Creme dental — 90g', category: 'Higiene/Beleza', brand: 'Aurora', unit: 'UN', price: 5.9, volume: 120, status: 'ok' },
  { name: 'Papel higiênico folha dupla — 4un', category: 'Higiene/Beleza', brand: 'Prima', unit: 'PCT', price: 11.9, volume: 130, status: 'ok' },
  { name: 'Desodorante aerosol — 150ml', category: 'Higiene/Beleza', brand: 'Aurora', unit: 'UN', price: 14.9, volume: 55, status: 'baixo' },
  { name: 'Escova de dentes macia', category: 'Higiene/Beleza', brand: 'Aurora', unit: 'UN', price: 7.5, volume: 80, status: 'ok' },
  { name: 'Absorvente com abas — 8un', category: 'Higiene/Beleza', brand: 'Prima', unit: 'PCT', price: 9.9, volume: 75, status: 'ok' },

  // Descartáveis
  { name: 'Copo descartável 200ml — 100un', category: 'Descartáveis', brand: 'Prima', unit: 'PCT', price: 8.9, volume: 90, status: 'ok' },
  { name: 'Guardanapo de papel — 50un', category: 'Descartáveis', brand: 'Prima', unit: 'PCT', price: 4.5, volume: 110, status: 'ok' },
  { name: 'Prato descartável 21cm — 10un', category: 'Descartáveis', brand: 'Nova Casa', unit: 'PCT', price: 6.2, volume: 70, status: 'baixo' },
  { name: 'Papel toalha — 2un', category: 'Descartáveis', brand: 'Prima', unit: 'PCT', price: 9.4, volume: 95, status: 'ok' },
  { name: 'Filme plástico — 30m', category: 'Descartáveis', brand: 'Nova Casa', unit: 'UN', price: 7.8, volume: 50, status: 'sem_meta' },

  // Padaria
  { name: 'Pão de forma tradicional — 500g', category: 'Padaria', brand: 'Bom Sabor', unit: 'UN', price: 8.9, volume: 100, status: 'ok' },
  { name: 'Bolo pronto sabor laranja — 300g', category: 'Padaria', brand: 'Bom Sabor', unit: 'UN', price: 10.5, volume: 45, status: 'em_falta' },
  { name: 'Rosquinha de coco — 300g', category: 'Padaria', brand: 'Prima', unit: 'PCT', price: 6.9, volume: 60, status: 'ok' },
  { name: 'Torrada tradicional — 160g', category: 'Padaria', brand: 'Bom Sabor', unit: 'PCT', price: 5.4, volume: 55, status: 'ok' },
];

const CONSUMPTION_NOTES = [
  'Consumo interno',
  'Saída para loja 02',
  'Reposição de gôndola',
  'Uso operacional',
  'Transferência para filial',
  'Atendimento de pedido',
];

const ADJUSTMENT_NOTES = [
  'Inventário cíclico',
  'Correção de contagem',
  'Perda por avaria',
  'Produto vencido descartado',
  'Divergência na conferência',
];

const PURCHASE_NOTES = [
  'Pedido semanal',
  'Reposição programada',
  'Compra emergencial',
  'Pedido mensal consolidado',
  null,
];

// -------------------------------------------------------------- simulação

type EventType = 'PURCHASE' | 'CONSUMPTION' | 'ADJUSTMENT';

interface SimEvent {
  type: EventType;
  delta: number;
  balanceAfter: number;
  occurredAt: Date;
  note: string | null;
  dayIndex: number;
}

interface SimResult {
  events: SimEvent[];
  finalBalance: number;
}

function simulate(item: CatalogItem): SimResult {
  const events: SimEvent[] = [];
  let balance = 0;

  const push = (type: EventType, delta: number, dayIndex: number, note: string | null) => {
    balance += delta;
    events.push({ type, delta, balanceAfter: balance, occurredAt: daysAgo(dayIndex, randInt(8, 18)), note, dayIndex });
  };

  // carga inicial
  const base = Math.round(item.volume * (0.6 + rand() * 0.5));
  push('PURCHASE', base, 88 - randInt(0, 3), null);

  for (let day = 82; day >= 3; day -= randInt(4, 9)) {
    const wanted = randInt(1, Math.max(2, Math.round(base * 0.2)));
    const consumed = Math.min(balance, wanted);
    if (consumed > 0) push('CONSUMPTION', -consumed, day, pick(CONSUMPTION_NOTES));

    if (rand() < 0.4) {
      const qty = randInt(Math.max(1, Math.round(base * 0.25)), Math.max(2, Math.round(base * 0.8)));
      push('PURCHASE', qty, Math.max(3, day - 1), null);
    }

    if (rand() < 0.07) {
      const delta = randInt(-5, 4);
      if (delta !== 0 && balance + delta >= 0) {
        push('ADJUSTMENT', delta, Math.max(3, day - 2), pick(ADJUSTMENT_NOTES));
      }
    }
  }

  if (item.status === 'em_falta') {
    // zera o saldo com uma saída final plausível
    if (balance > 0) push('CONSUMPTION', -balance, randInt(1, 5), 'Saída total do lote');
  } else if (balance === 0) {
    push('PURCHASE', randInt(Math.round(base * 0.4), base), randInt(1, 6), null);
  }

  return { events, finalBalance: balance };
}

function limitsFor(status: Status, balance: number): { min: number; max: number } {
  switch (status) {
    case 'em_falta':
      return { min: Math.max(5, Math.round(balance * 0.2) || 10), max: Math.max(40, balance * 2 || 80) };
    case 'baixo':
      return { min: balance + randInt(4, 12), max: (balance + 12) * 3 };
    case 'acima':
      return { min: Math.max(1, Math.floor(balance * 0.2)), max: Math.max(1, Math.floor(balance * 0.7)) };
    case 'sem_meta':
      return { min: 0, max: 0 };
    case 'ok':
    default:
      return { min: Math.max(1, Math.floor(balance * 0.35)), max: Math.ceil(balance * 1.8) };
  }
}

// ------------------------------------------------------------------- escrita

async function wipe() {
  await prisma.auditLog.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.purchaseItem.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.accountProduct.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.accountCategory.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.supplier.deleteMany({});
}

async function main() {
  const account = await prisma.account.findFirstOrThrow({ where: { id: 1 } });
  const admin = await prisma.user.findFirstOrThrow({ where: { email: 'admin@gerencie.com' } });

  console.log('Limpando catálogo e histórico...');
  await wipe();

  // --- marcas
  const brandIds = new Map<string, number>();
  for (const name of BRANDS) {
    const b = await prisma.brand.create({
      data: { name, ownerAccountId: account.id, createdAt: daysAgo(randInt(90, 120)) },
    });
    brandIds.set(name, b.id);
  }

  // --- categorias
  const categoryIds = new Map<string, number>();
  for (const cat of CATEGORIES) {
    const c = await prisma.category.create({
      data: {
        name: cat.name,
        prioritySort: cat.priority,
        ownerAccountId: account.id,
        createdAt: daysAgo(randInt(90, 120)),
        accountCategories: { create: { accountId: account.id, priority: cat.priority } },
      },
    });
    categoryIds.set(cat.name, c.id);
  }

  // --- fornecedores
  const supplierIds: number[] = [];
  for (const s of SUPPLIERS) {
    const sup = await prisma.supplier.create({
      data: { name: s.name, address: s.address, ownerAccountId: account.id, createdAt: daysAgo(randInt(90, 115)) },
    });
    supplierIds.push(sup.id);
  }

  // --- produtos + simulação
  interface Built {
    item: CatalogItem;
    productId: number;
    accountProductId: number;
    sim: SimResult;
  }
  const built: Built[] = [];

  for (const item of CATALOG) {
    const sim = simulate(item);
    const { min, max } = limitsFor(item.status, sim.finalBalance);
    const createdAt = daysAgo(randInt(89, 95));

    const product = await prisma.product.create({
      data: {
        name: item.name,
        brandId: brandIds.get(item.brand)!,
        unitType: item.unit,
        ownerAccountId: account.id,
        minLimit: min,
        maxLimit: max,
        currentStock: sim.finalBalance,
        createdAt,
        productCategories: { create: { categoryId: categoryIds.get(item.category)! } },
        accountProducts: {
          create: { accountId: account.id, minLimit: min, maxLimit: max, createdAt },
        },
      },
      include: { accountProducts: true },
    });

    built.push({
      item,
      productId: product.id,
      accountProductId: product.accountProducts[0].id,
      sim,
    });
  }

  // --- compras agrupadas por dia
  interface PendingLine {
    b: Built;
    ev: SimEvent;
  }
  const purchasesByDay = new Map<number, PendingLine[]>();
  for (const b of built) {
    for (const ev of b.sim.events) {
      if (ev.type !== 'PURCHASE') continue;
      const list = purchasesByDay.get(ev.dayIndex) ?? [];
      list.push({ b, ev });
      purchasesByDay.set(ev.dayIndex, list);
    }
  }

  let purchaseCount = 0;
  for (const [dayIndex, lines] of [...purchasesByDay.entries()].sort((a, b) => b[0] - a[0])) {
    // um dia pode virar mais de um pedido, com fornecedores diferentes
    const chunks: PendingLine[][] = [];
    let cursor = 0;
    while (cursor < lines.length) {
      const size = randInt(2, 5);
      chunks.push(lines.slice(cursor, cursor + size));
      cursor += size;
    }

    for (const chunk of chunks) {
      const occurredAt = daysAgo(dayIndex, randInt(8, 17));
      const total = chunk.reduce((sum, l) => sum + l.ev.delta * l.b.item.price, 0);

      const purchase = await prisma.purchase.create({
        data: {
          accountId: account.id,
          supplierId: pick(supplierIds),
          createdByUserId: admin.id,
          occurredAt,
          notes: pick(PURCHASE_NOTES),
          totalAmount: money(total),
          currency: 'BRL',
          createdAt: occurredAt,
        },
      });
      purchaseCount += 1;

      for (const l of chunk) {
        await prisma.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: l.b.productId,
            accountProductId: l.b.accountProductId,
            quantity: l.ev.delta,
            itemTotalPrice: money(l.ev.delta * l.b.item.price),
            createdAt: occurredAt,
          },
        });

        await prisma.stockMovement.create({
          data: {
            accountId: account.id,
            productId: l.b.productId,
            accountProductId: l.b.accountProductId,
            purchaseId: purchase.id,
            type: 'PURCHASE',
            note: null,
            delta: l.ev.delta,
            balanceAfter: l.ev.balanceAfter,
            occurredAt: l.ev.occurredAt,
            createdAt: l.ev.occurredAt,
          },
        });
      }
    }
  }

  // --- consumos e ajustes
  let movementCount = 0;
  for (const b of built) {
    for (const ev of b.sim.events) {
      if (ev.type === 'PURCHASE') continue;
      await prisma.stockMovement.create({
        data: {
          accountId: account.id,
          productId: b.productId,
          accountProductId: b.accountProductId,
          type: ev.type,
          note: ev.note,
          delta: ev.delta,
          balanceAfter: ev.balanceAfter,
          occurredAt: ev.occurredAt,
          createdAt: ev.occurredAt,
        },
      });
      movementCount += 1;
    }
  }

  // --- logs de auditoria
  const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
  const ip = () => `189.45.${randInt(2, 240)}.${randInt(2, 240)}`;

  const logs: Array<{
    action: string;
    entity: string;
    entityId: number | null;
    oldValues: string | null;
    newValues: string | null;
    createdAt: Date;
  }> = [];

  // logins ao longo dos 90 dias — espaçados, para não dominarem a primeira
  // página do registro de ações (que ordena por data desc)
  for (let d = 89; d >= 1; d -= randInt(3, 6)) {
    logs.push({
      action: 'LOGIN',
      entity: 'User',
      entityId: admin.id,
      oldValues: null,
      newValues: null,
      createdAt: daysAgo(d, randInt(7, 20)),
    });
  }

  // criação dos produtos
  for (const b of built) {
    logs.push({
      action: 'CREATE',
      entity: 'Product',
      entityId: b.productId,
      oldValues: null,
      newValues: JSON.stringify({ name: b.item.name, unitType: b.item.unit, brand: b.item.brand }),
      createdAt: daysAgo(randInt(85, 92), randInt(9, 18)),
    });
  }

  // edições de limites — concentradas nas últimas semanas, para o registro de
  // ações abrir com variedade em vez de uma parede de logins
  for (const b of built.filter(() => rand() < 0.55)) {
    const { min, max } = limitsFor(b.item.status, b.sim.finalBalance);
    logs.push({
      action: 'UPDATE',
      entity: 'Product',
      entityId: b.productId,
      oldValues: JSON.stringify({ minLimit: Math.max(0, min - randInt(3, 10)), maxLimit: max - randInt(5, 20) }),
      newValues: JSON.stringify({ minLimit: min, maxLimit: max }),
      createdAt: daysAgo(randInt(1, 26), randInt(9, 18)),
    });
  }

  // categorias, marcas e fornecedores
  for (const cat of CATEGORIES) {
    logs.push({
      action: 'CREATE',
      entity: 'Category',
      entityId: categoryIds.get(cat.name)!,
      oldValues: null,
      newValues: JSON.stringify({ name: cat.name, prioritySort: cat.priority }),
      createdAt: daysAgo(randInt(88, 95), randInt(9, 17)),
    });
  }
  for (const name of BRANDS.slice(0, 6)) {
    logs.push({
      action: 'CREATE',
      entity: 'Brand',
      entityId: brandIds.get(name)!,
      oldValues: null,
      newValues: JSON.stringify({ name }),
      createdAt: daysAgo(randInt(80, 94), randInt(9, 17)),
    });
  }
  for (const id of supplierIds.slice(0, 4)) {
    logs.push({
      action: 'CREATE',
      entity: 'Supplier',
      entityId: id,
      oldValues: null,
      newValues: JSON.stringify({ name: SUPPLIERS[supplierIds.indexOf(id)].name }),
      createdAt: daysAgo(randInt(75, 92), randInt(9, 17)),
    });
  }

  // ações avulsas recentes, para o log ter variedade de verbos e entidades
  logs.push({
    action: 'UPDATE',
    entity: 'Category',
    entityId: categoryIds.get('Descartáveis')!,
    oldValues: JSON.stringify({ name: 'Descartaveis', prioritySort: 0 }),
    newValues: JSON.stringify({ name: 'Descartáveis', prioritySort: 1 }),
    createdAt: daysAgo(randInt(3, 12), 14),
  });
  logs.push({
    action: 'DELETE',
    entity: 'Product',
    entityId: null,
    oldValues: JSON.stringify({ name: 'Suco em pó sabor uva — 25g', unitType: 'UN' }),
    newValues: null,
    createdAt: daysAgo(randInt(2, 9), 11),
  });
  logs.push({
    action: 'UPDATE',
    entity: 'Supplier',
    entityId: supplierIds[1],
    oldValues: JSON.stringify({ address: 'Av. Brasil, 500 — Curitiba/PR' }),
    newValues: JSON.stringify({ address: 'Av. Brasil, 512 — Curitiba/PR' }),
    createdAt: daysAgo(randInt(1, 7), 16),
  });
  logs.push({
    action: 'CREATE',
    entity: 'Brand',
    entityId: brandIds.get('Dose Certa')!,
    oldValues: null,
    newValues: JSON.stringify({ name: 'Dose Certa' }),
    createdAt: daysAgo(randInt(2, 10), 10),
  });
  logs.push({
    action: 'CREATE',
    entity: 'Supplier',
    entityId: supplierIds[5],
    oldValues: null,
    newValues: JSON.stringify({ name: SUPPLIERS[5].name, address: SUPPLIERS[5].address }),
    createdAt: daysAgo(randInt(1, 6), 15),
  });
  logs.push({
    action: 'CREATE',
    entity: 'Category',
    entityId: categoryIds.get('Padaria')!,
    oldValues: null,
    newValues: JSON.stringify({ name: 'Padaria', prioritySort: 1 }),
    createdAt: daysAgo(randInt(4, 14), 9),
  });

  logs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  for (const log of logs) {
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        accountId: account.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        oldValues: log.oldValues,
        newValues: log.newValues,
        ipAddress: ip(),
        userAgent: UA,
        createdAt: log.createdAt,
      },
    });
  }

  // --- resumo
  const byStatus = built.reduce<Record<string, number>>((acc, b) => {
    acc[b.item.status] = (acc[b.item.status] ?? 0) + 1;
    return acc;
  }, {});
  const totalItens = built.reduce((sum, b) => sum + b.sim.finalBalance, 0);

  console.log('\n=== demo-seed concluído ===');
  console.log(`Produtos:        ${built.length}`);
  console.log(`Itens em estoque:${totalItens}`);
  console.log(`Marcas:          ${BRANDS.length}`);
  console.log(`Categorias:      ${CATEGORIES.length}`);
  console.log(`Fornecedores:    ${SUPPLIERS.length}`);
  console.log(`Compras:         ${purchaseCount}`);
  console.log(`Movimentações:   ${movementCount + [...purchasesByDay.values()].flat().length}`);
  console.log(`Logs auditoria:  ${logs.length}`);
  console.log(`Status:          ${JSON.stringify(byStatus)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
