import { Router, Response } from 'express';
import { z } from 'zod';
import {
  prisma,
  paginate,
  parseIntParam,
  parseScope,
  parseSortDir,
  parseCategories,
  toTimestamp,
} from '../lib/prisma';
import { ownerScopeWhere, canModifyResource } from '../lib/scope';
import { authMiddleware, AuthRequest, getAccountId } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

type ProductWithRelations = Awaited<ReturnType<typeof fetchProduct>>;

async function fetchProduct(id: number, accountId: number) {
  return prisma.product.findFirst({
    where: { id, deleted: false },
    include: {
      brand: true,
      productCategories: { include: { category: true } },
      accountProducts: { where: { accountId } },
    },
  });
}

function mapProduct(product: NonNullable<ProductWithRelations>, accountId: number) {
  const accountProduct = product.accountProducts[0];
  return {
    id: product.id,
    created_at: toTimestamp(product.createdAt),
    name: product.name,
    brand_id: product.brandId,
    unit_type: product.unitType,
    owner_account_id: product.ownerAccountId,
    min_limit: accountProduct?.minLimit ?? product.minLimit,
    max_limit: accountProduct?.maxLimit ?? product.maxLimit,
    brand: {
      id: product.brand.id,
      created_at: toTimestamp(product.brand.createdAt),
      name: product.brand.name,
      owner_account_id: product.brand.ownerAccountId,
    },
    product_categories: product.productCategories.map((pc) => ({
      id: pc.id,
      created_at: toTimestamp(pc.createdAt),
      product_id: pc.productId,
      category_id: pc.categoryId,
      category: {
        id: pc.category.id,
        created_at: toTimestamp(pc.category.createdAt),
        name: pc.category.name,
        owner_account_id: pc.category.ownerAccountId,
        priority_sort: pc.category.prioritySort,
      },
    })),
    ...(accountProduct
      ? {
          account_product: {
            id: accountProduct.id,
            created_at: toTimestamp(accountProduct.createdAt),
            account_id: accountProduct.accountId,
            product_id: accountProduct.productId,
            custom_name: accountProduct.customName,
            min_limit: accountProduct.minLimit,
            max_limit: accountProduct.maxLimit,
            is_favorite: accountProduct.isFavorite,
            is_archived: accountProduct.isArchived,
          },
        }
      : {}),
  };
}

router.get('/account/products', async (req: AuthRequest, res: Response) => {
  const accountId = getAccountId(req);
  const page = parseIntParam(req.query.page, 1);
  const perPage = parseIntParam(req.query.per_page, 10);
  const search = String(req.query.search || '').trim();
  const scope = parseScope(req.query.scope);
  const sortBy = String(req.query.sort_by || 'product.name');
  const sortDir = parseSortDir(req.query.sort_dir);
  const categoryIds = parseCategories(req.query.categories);
  const brandFilter = String(req.query.brand || '').trim();

  const where: Record<string, unknown> = {
    deleted: false,
    ownerAccountId: ownerScopeWhere(accountId, scope),
  };
  if (search) where.name = { contains: search };
  if (brandFilter) {
    where.brand = {
      OR: [{ name: { contains: brandFilter } }, ...(Number.isFinite(Number(brandFilter)) ? [{ id: Number(brandFilter) }] : [])],
    };
  }
  if (categoryIds.length > 0) {
    where.productCategories = { some: { categoryId: { in: categoryIds } } };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      brand: true,
      productCategories: { include: { category: true } },
      accountProducts: { where: { accountId } },
    },
  });

  const effectiveMin = (p: (typeof products)[0]) =>
    p.accountProducts[0]?.minLimit ?? p.minLimit;
  const effectiveMax = (p: (typeof products)[0]) =>
    p.accountProducts[0]?.maxLimit ?? p.maxLimit;

  products.sort((a, b) => {
    let cmp = 0;
    if (sortBy.includes('brand')) cmp = a.brand.name.localeCompare(b.brand.name);
    else if (sortBy.includes('owner_account_id')) cmp = a.ownerAccountId - b.ownerAccountId;
    else if (sortBy.includes('min_limit')) cmp = effectiveMin(a) - effectiveMin(b);
    else if (sortBy.includes('max_limit')) cmp = effectiveMax(a) - effectiveMax(b);
    else cmp = a.name.localeCompare(b.name);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const total = products.length;
  const offset = (page - 1) * perPage;
  const pageItems = products.slice(offset, offset + perPage).map((p) => mapProduct(p, accountId));

  return res.json(paginate(pageItems, page, perPage, total));
});

const productSchema = z
  .object({
    name: z.string().min(1),
    brand_id: z.coerce.number().int().positive(),
    unit_type: z.string().min(1),
    category_ids: z.array(z.coerce.number().int().positive()),
    min_limit: z.coerce.number().int().min(0),
    max_limit: z.coerce.number().int().min(0),
  })
  .refine((d) => d.max_limit >= d.min_limit, {
    message: 'max_limit must be >= min_limit',
  });

async function upsertAccountProduct(
  accountId: number,
  productId: number,
  minLimit: number,
  maxLimit: number
) {
  await prisma.accountProduct.upsert({
    where: { accountId_productId: { accountId, productId } },
    create: { accountId, productId, minLimit, maxLimit },
    update: { minLimit, maxLimit },
  });
}

router.post('/product', async (req: AuthRequest, res: Response) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid product data.' });

  const accountId = getAccountId(req);
  const { name, brand_id, unit_type, category_ids, min_limit, max_limit } = parsed.data;

  const brand = await prisma.brand.findFirst({ where: { id: brand_id } });
  if (!brand) return res.status(400).json({ message: 'Brand not found.' });

  const product = await prisma.product.create({
    data: {
      name,
      brandId: brand_id,
      unitType: unit_type,
      ownerAccountId: accountId,
      minLimit: min_limit,
      maxLimit: max_limit,
      productCategories: {
        create: category_ids.map((categoryId) => ({ categoryId })),
      },
    },
  });

  await upsertAccountProduct(accountId, product.id, min_limit, max_limit);

  const full = await fetchProduct(product.id, accountId);
  return res.status(201).json(mapProduct(full!, accountId));
});

router.patch('/product/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid product data.' });

  const accountId = getAccountId(req);
  const existing = await prisma.product.findFirst({ where: { id, deleted: false } });
  if (!existing) return res.status(404).json({ message: 'Product not found.' });
  if (!canModifyResource(existing.ownerAccountId, accountId)) {
    return res.status(403).json({ message: 'Forbidden.' });
  }

  const { name, brand_id, unit_type, category_ids, min_limit, max_limit } = parsed.data;

  const brand = await prisma.brand.findFirst({ where: { id: brand_id } });
  if (!brand) return res.status(400).json({ message: 'Brand not found.' });

  await prisma.productCategory.deleteMany({ where: { productId: id } });
  await prisma.product.update({
    where: { id },
    data: {
      name,
      brandId: brand_id,
      unitType: unit_type,
      minLimit: min_limit,
      maxLimit: max_limit,
      productCategories: {
        create: category_ids.map((categoryId) => ({ categoryId })),
      },
    },
  });

  await upsertAccountProduct(accountId, id, min_limit, max_limit);

  const full = await fetchProduct(id, accountId);
  return res.json(mapProduct(full!, accountId));
});

router.delete('/product/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const accountId = getAccountId(req);
  const existing = await prisma.product.findFirst({ where: { id, deleted: false } });
  if (!existing) return res.status(404).json({ message: 'Product not found.' });
  if (!canModifyResource(existing.ownerAccountId, accountId)) {
    return res.status(403).json({ message: 'Forbidden.' });
  }

  await prisma.product.update({ where: { id }, data: { deleted: true } });
  return res.status(204).send();
});

export default router;
