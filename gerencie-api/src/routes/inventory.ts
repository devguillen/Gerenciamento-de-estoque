import { Prisma } from '@prisma/client';
import { Router, Response } from 'express';
import { z } from 'zod';
import {
  prisma,
  paginate,
  parseIntParam,
  parseSortDir,
  parseCategories,
  toTimestamp,
} from '../lib/prisma';
import { authMiddleware, AuthRequest, getAccountId, getUserId } from '../middleware/auth';
import { ownerScopeWhere } from '../lib/scope';

const router = Router();
router.use(authMiddleware);

type InventoryStatus = 'em_falta' | 'baixo' | 'ok' | 'acima' | 'sem_meta';

type SortBy = 'name' | 'urgency' | 'quantity' | 'last_movement';

type StockMovementSortBy = 'date' | 'type' | 'product_name';

type AccountProductWithProduct = Prisma.AccountProductGetPayload<{
  include: {
    product: {
      include: {
        brand: true;
        productCategories: {
          include: {
            category: true;
          };
        };
      };
    };
  };
}>;

const STATUS_RANK: Record<InventoryStatus, number> = {
  em_falta: 0,
  baixo: 1,
  ok: 2,
  acima: 3,
  sem_meta: 4,
};

function resolveStatus(quantity: number, minLimit: number | null, maxLimit: number | null): InventoryStatus {
  const minValue = minLimit ?? 0;
  const maxValue = maxLimit ?? 0;
  if (quantity <= 0) return 'em_falta';
  if (minValue > 0 && quantity <= minValue) return 'baixo';
  if (maxValue > 0 && quantity > maxValue) return 'acima';
  if (minValue > 0 || maxValue > 0) return 'ok';
  return 'sem_meta';
}

function resolveUrgencyRank(status: InventoryStatus): number {
  return STATUS_RANK[status] ?? 4;
}

function buildInventoryItem(
  accountProduct: AccountProductWithProduct,
  lastMovement: { id: number; type: string; occurredAt: Date; delta: number } | null
) {
  const product = accountProduct.product;
  const brand = product.brand;
  const categories = product.productCategories.map((pc) => ({ id: pc.category.id, name: pc.category.name }));
  const minLimit = accountProduct.minLimit ?? product.minLimit ?? 0;
  const maxLimit = accountProduct.maxLimit ?? product.maxLimit ?? 0;
  const quantity = product.currentStock;
  const status = resolveStatus(quantity, minLimit, maxLimit);
  const displayName = accountProduct.customName?.trim() ? accountProduct.customName : product.name;

  return {
    id: accountProduct.id,
    account_id: accountProduct.accountId,
    account_product_id: accountProduct.id,
    quantity,
    updated_at: lastMovement ? lastMovement.occurredAt.toISOString() : accountProduct.createdAt.toISOString(),
    last_movement_type: lastMovement?.type ?? null,
    last_movement_occurred_at: lastMovement ? lastMovement.occurredAt.toISOString() : null,
    last_movement_source: lastMovement?.type ?? null,
    last_movement_id: lastMovement?.id ?? null,
    last_movement_delta: lastMovement?.delta ?? null,
    product_id: product.id,
    custom_name: accountProduct.customName || null,
    min_limit: minLimit > 0 ? minLimit : null,
    max_limit: maxLimit > 0 ? maxLimit : null,
    product_name: product.name,
    unit_type: product.unitType,
    brand_name: brand.name,
    display_name: displayName,
    categories,
    status,
    urgency_rank: resolveUrgencyRank(status),
  };
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter((s) => s.length > 0);
  }
  if (typeof value === 'string' && value.length > 0) {
    return value.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  }
  return [];
}

const inventoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).default(10),
  search: z.string().optional().nullable(),
  sort_by: z.enum(['name', 'urgency', 'quantity', 'last_movement']).optional().default('name'),
  sort_dir: z.enum(['asc', 'desc']).optional().default('desc'),
  categories: z.preprocess((val) => (val === undefined ? undefined : parseCategories(val)), z.array(z.number().int().positive()).optional()),
  status: z.enum(['todos', 'em_falta', 'baixo', 'ok', 'acima', 'sem_meta']).optional(),
});

const stockMovementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).default(10),
  search: z.string().optional().nullable(),
  sort_by: z.enum(['date', 'type', 'product_name']).default('date'),
  sort_dir: z.enum(['asc', 'desc']).default('desc'),
  types: z.preprocess((val) => (val === undefined ? undefined : parseStringArray(val)), z.array(z.string()).optional()),
  date_filter_type: z.enum(['today', 'last_7', 'last_30', 'last_15', 'custom']),
  start_date: z.coerce.number().optional().nullable(),
  end_date: z.coerce.number().optional().nullable(),
  product_id: z.coerce.number().int().positive().optional(),
  category_ids: z.preprocess((val) => (val === undefined ? undefined : parseCategories(val)), z.array(z.number().int().positive()).optional()),
});

const purchaseSchema = z.object({
  occurred_at: z.string().min(1),
  supplier_id: z.number().int().positive().nullable(),
  notes: z.string().optional(),
  currency: z.string().min(1),
  total_amount: z.number().nullable(),
  items: z.array(
    z.object({
      account_product_id: z.number().int().nonnegative(),
      product_id: z.number().int().positive().optional(),
      quantity: z.number().int().positive(),
      item_total_price: z.number().min(0),
    })
  ),
});

const adjustmentSchema = z.object({
  account_product_id: z.coerce.number().int().positive(),
  quantity: z.coerce.number().min(0),
  motive: z.string().min(1),
});

const consumptionSchema = z.object({
  account_product_id: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  motive: z.string().optional(),
});

function applyInventoryFilters(items: any[], search?: string | null, status?: string, categories?: number[]) {
  return items.filter((item) => {
    if (search) {
      const query = search.toLowerCase();
      const found = [item.display_name, item.product_name, item.brand_name].some((value) => value?.toLowerCase().includes(query));
      if (!found) return false;
    }
    if (status && status !== 'todos' && item.status !== status) return false;
    if (categories && categories.length > 0) {
      const categoryIds = item.categories.map((category: any) => category.id);
      if (!categories.every((category) => categoryIds.includes(category))) return false;
    }
    return true;
  });
}

function sortInventory(items: any[], sortBy: SortBy, sortDir: 'asc' | 'desc') {
  return items.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') cmp = a.display_name.localeCompare(b.display_name);
    if (sortBy === 'urgency') cmp = a.urgency_rank - b.urgency_rank;
    if (sortBy === 'quantity') cmp = a.quantity - b.quantity;
    if (sortBy === 'last_movement') cmp = (a.last_movement_occurred_at ? new Date(a.last_movement_occurred_at).getTime() : 0) - (b.last_movement_occurred_at ? new Date(b.last_movement_occurred_at).getTime() : 0);
    return sortDir === 'asc' ? cmp : -cmp;
  });
}

function getRangeForDateFilter(type: string, startDate?: number | null, endDate?: number | null) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (type === 'today') {
    return { gte: today, lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
  }
  if (type === 'last_7') {
    return { gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
  }
  if (type === 'last_15') {
    return { gte: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
  }
  if (type === 'last_30') {
    return { gte: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000), lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
  }
  if (type === 'custom' && startDate && endDate) {
    return { gte: new Date(startDate * 1000), lte: new Date(endDate * 1000) };
  }
  return undefined;
}

router.get('/account/inventory', async (req: AuthRequest, res: Response) => {
  const parsed = inventoryQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid query.' });

  const accountId = getAccountId(req);
  const { page, per_page, search, sort_by, sort_dir, categories, status } = parsed.data;

  const accountProducts = await prisma.accountProduct.findMany({
    where: { accountId, isArchived: false, product: { deleted: false } },
    include: {
      product: { include: { brand: true, productCategories: { include: { category: true } } } },
    },
  });

  const productIds = accountProducts.map((item) => item.productId);
  const movements = await prisma.stockMovement.findMany({
    where: { accountId, accountProductId: { in: accountProducts.map((item) => item.id) } },
    orderBy: [{ accountProductId: 'asc' }, { occurredAt: 'desc' }],
  });

  const latestMovementMap = new Map<number, typeof movements[number]>();
  for (const movement of movements) {
    if (!latestMovementMap.has(movement.accountProductId)) {
      latestMovementMap.set(movement.accountProductId, movement);
    }
  }

  const inventoryItems = accountProducts
    .filter((item): item is AccountProductWithProduct => item.product !== null)
    .map((item) => buildInventoryItem(item, latestMovementMap.get(item.id) ?? null));

  const filtered = applyInventoryFilters(inventoryItems, search, status, categories);
  const sorted = sortInventory(filtered, sort_by as SortBy, sort_dir);
  const paginated = paginate(sorted.slice((page - 1) * per_page, page * per_page), page, per_page, filtered.length);

  res.json(paginated);
});

router.get('/inventory/summary', async (req: AuthRequest, res: Response) => {
  const accountId = getAccountId(req);
  const accountProducts = await prisma.accountProduct.findMany({
    where: { accountId, isArchived: false, product: { deleted: false } },
    include: {
      product: { include: { brand: true } },
    },
  });

  const movements = await prisma.stockMovement.findFirst({
    where: { accountId },
    orderBy: { occurredAt: 'desc' },
  });

  const summary = accountProducts.reduce(
    (acc, item) => {
      const minLimit = item.minLimit ?? item.product.minLimit ?? 0;
      const maxLimit = item.maxLimit ?? item.product.maxLimit ?? 0;
      const status = resolveStatus(item.product.currentStock, minLimit, maxLimit);
      acc[status] += 1;
      acc.total_itens += 1;
      return acc;
    },
    {
      em_falta: 0,
      baixo: 0,
      ok: 0,
      acima: 0,
      sem_meta: 0,
      total_itens: 0,
      ultima_atualizacao: movements ? movements.occurredAt.toISOString() : null,
    }
  );

  res.json(summary);
});

router.get('/account/stock_movements', async (req: AuthRequest, res: Response) => {
  const parsed = stockMovementsQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid query.' });

  const accountId = getAccountId(req);
  const { page, per_page, search, sort_by, sort_dir, types, date_filter_type, start_date, end_date, product_id, category_ids } = parsed.data;

  const where: any = { accountId };
  if (types && types.length > 0) where.type = { in: types };
  if (product_id) where.productId = product_id;
  if (search) {
    where.OR = [
      { product: { name: { contains: search, mode: 'insensitive' } } },
      { product: { brand: { name: { contains: search, mode: 'insensitive' } } } },
      { note: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category_ids && category_ids.length > 0) {
    where.product = {
      productCategories: { some: { categoryId: { in: category_ids } } },
    };
  }

  const range = getRangeForDateFilter(date_filter_type, start_date, end_date);
  if (range) where.occurredAt = range;

  const total = await prisma.stockMovement.count({ where });
  const orderBy =
    sort_by === 'product_name'
      ? [{ product: { name: sort_dir } }]
      : sort_by === 'type'
      ? [{ type: sort_dir }]
      : [{ occurredAt: sort_dir }];

  const items = await prisma.stockMovement.findMany({
    where,
    include: {
      product: { include: { brand: true, productCategories: { include: { category: true } } } },
      purchase: { include: { supplier: true } },
    },
    orderBy,
    skip: (page - 1) * per_page,
    take: per_page,
  });

  const mapped = items.map((item) => ({
    id: item.id,
    occurred_at: toTimestamp(item.occurredAt),
    movement_type: item.type,
    delta: item.delta,
    balance_after: item.balanceAfter,
    note: item.note,
    product_name: item.product.name,
    unit_type: item.product.unitType,
    brand_name: item.product.brand.name,
    supplier_name: item.purchase?.supplier?.name ?? null,
    categories: item.product.productCategories.map((pc) => ({
      id: pc.category.id,
      name: pc.category.name,
    })),
  }));

  res.json({
    curPage: page,
    itemsReceived: mapped.length,
    items: mapped,
    totalItems: total,
    totalPages: Math.max(1, Math.ceil(total / per_page)),
    nextPage: page * per_page < total ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  });
});

router.post('/purchase', async (req: AuthRequest, res: Response) => {
  const parsed = purchaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid purchase data.' });

  const accountId = getAccountId(req);
  const createdByUserId = getUserId(req);
  const { occurred_at, supplier_id, notes, currency, total_amount, items } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const supplier = supplier_id
        ? await tx.supplier.findFirst({ where: { id: supplier_id, deleted: false, ownerAccountId: ownerScopeWhere(accountId, 'all') } })
        : null;
      if (supplier_id && !supplier) {
        throw new Error('Supplier not found.');
      }

      const purchase = await tx.purchase.create({
        data: {
          accountId,
          supplierId: supplier?.id ?? null,
          createdByUserId,
          occurredAt: new Date(occurred_at),
          notes: notes || null,
          currency,
          totalAmount: total_amount ?? items.reduce((sum, item) => sum + item.item_total_price, 0),
        },
      });

      const updatedItems: Array<{ account_product_id: number; delta: number; qty_after: number }> = [];

      for (const line of items) {
        const productId = line.product_id ?? 0;
        let accountProduct = line.account_product_id
          ? await tx.accountProduct.findFirst({ where: { id: line.account_product_id, accountId } })
          : null;

        if (!accountProduct) {
          if (!productId) throw new Error('Product information missing.');
          const product = await tx.product.findFirst({ where: { id: productId, deleted: false } });
          if (!product) throw new Error('Product not found.');
          accountProduct = await tx.accountProduct.upsert({
            where: { accountId_productId: { accountId, productId } },
            create: { accountId, productId, customName: '', minLimit: product.minLimit, maxLimit: product.maxLimit },
            update: {},
          });
        }

        const product = await tx.product.findFirst({ where: { id: accountProduct.productId, deleted: false } });
        if (!product) throw new Error('Product not found.');

        const newBalance = product.currentStock + line.quantity;

        await tx.product.update({ where: { id: product.id }, data: { currentStock: newBalance } });

        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: product.id,
            accountProductId: accountProduct.id,
            quantity: line.quantity,
            itemTotalPrice: line.item_total_price,
          },
        });

        await tx.stockMovement.create({
          data: {
            accountId,
            productId: product.id,
            accountProductId: accountProduct.id,
            purchaseId: purchase.id,
            type: 'PURCHASE',
            note: null,
            delta: line.quantity,
            balanceAfter: newBalance,
            occurredAt: new Date(occurred_at),
          },
        });

        updatedItems.push({
          account_product_id: accountProduct.id,
          delta: line.quantity,
          qty_after: newBalance,
        });
      }

      return { purchase, updatedItems };
    });

    return res.status(201).json({
      purchase: {
        id: result.purchase.id,
        created_at: toTimestamp(result.purchase.createdAt),
        account_id: result.purchase.accountId,
        occurred_at: toTimestamp(result.purchase.occurredAt),
        supplier_id: result.purchase.supplierId ?? 0,
        notes: result.purchase.notes ?? '',
        total_amount: result.purchase.totalAmount,
        currency: result.purchase.currency,
        created_by_user_id: result.purchase.createdByUserId,
      },
      updated_items: result.updatedItems,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Invalid purchase data.' });
  }
});

router.post('/adjustment', async (req: AuthRequest, res: Response) => {
  const parsed = adjustmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid adjustment data.' });

  const accountId = getAccountId(req);
  const { account_product_id, quantity, motive } = parsed.data;

  const accountProduct = await prisma.accountProduct.findFirst({ where: { id: account_product_id, accountId } });
  if (!accountProduct) return res.status(404).json({ message: 'Account product not found.' });

  const product = await prisma.product.findFirst({ where: { id: accountProduct.productId, deleted: false } });
  if (!product) return res.status(404).json({ message: 'Product not found.' });

  const delta = quantity - product.currentStock;

  await prisma.product.update({ where: { id: product.id }, data: { currentStock: quantity } });

  await prisma.stockMovement.create({
    data: {
      accountId,
      productId: product.id,
      accountProductId: accountProduct.id,
      type: 'ADJUSTMENT',
      note: motive,
      delta,
      balanceAfter: quantity,
      occurredAt: new Date(),
    },
  });

  res.status(204).send();
});

router.post('/consumption', async (req: AuthRequest, res: Response) => {
  const parsed = consumptionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid consumption data.' });

  const accountId = getAccountId(req);
  const { account_product_id, quantity, motive } = parsed.data;

  const accountProduct = await prisma.accountProduct.findFirst({ where: { id: account_product_id, accountId } });
  if (!accountProduct) return res.status(404).json({ message: 'Account product not found.' });

  const product = await prisma.product.findFirst({ where: { id: accountProduct.productId, deleted: false } });
  if (!product) return res.status(404).json({ message: 'Product not found.' });

  if (quantity > product.currentStock) {
    return res.status(400).json({ message: 'Not enough stock.' });
  }

  const newBalance = product.currentStock - quantity;

  await prisma.product.update({ where: { id: product.id }, data: { currentStock: newBalance } });

  await prisma.stockMovement.create({
    data: {
      accountId,
      productId: product.id,
      accountProductId: accountProduct.id,
      type: 'CONSUMPTION',
      note: motive ?? null,
      delta: -quantity,
      balanceAfter: newBalance,
      occurredAt: new Date(),
    },
  });

  res.status(204).send();
});

export default router;
