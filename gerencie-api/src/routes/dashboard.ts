import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest, getAccountId } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const CHART_COLORS = [
  '#f43f5e', '#3b82f6', '#2dd4bf', '#f97316', '#a855f7',
  '#eab308', '#14b8a6', '#1f2937', '#ef4444', '#4f46e5',
];

router.get('/dashboard/stats', async (req: AuthRequest, res: Response) => {
  const accountId = getAccountId(req);

  const products = await prisma.product.findMany({
    where: {
      deleted: false,
      OR: [{ ownerAccountId: 0 }, { ownerAccountId: accountId }],
    },
    include: {
      accountProducts: { where: { accountId } },
    },
  });

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => {
    const minLimit = p.accountProducts[0]?.minLimit ?? p.minLimit;
    return p.currentStock <= minLimit;
  }).length;

  return res.json({ totalProducts, lowStockProducts });
});

router.get('/dashboard/stock-by-category', async (req: AuthRequest, res: Response) => {
  const accountId = getAccountId(req);

  const products = await prisma.product.findMany({
    where: {
      deleted: false,
      OR: [{ ownerAccountId: 0 }, { ownerAccountId: accountId }],
      currentStock: { gt: 0 },
    },
    include: {
      productCategories: { include: { category: true } },
    },
  });

  const categoryMap: Record<string, number> = {};

  for (const product of products) {
    if (product.productCategories.length === 0) {
      categoryMap['Sem categoria'] = (categoryMap['Sem categoria'] || 0) + product.currentStock;
    } else {
      for (const pc of product.productCategories) {
        const name = pc.category.name;
        categoryMap[name] = (categoryMap[name] || 0) + product.currentStock;
      }
    }
  }

  const total = Object.values(categoryMap).reduce((sum, v) => sum + v, 0);

  const data = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, qty], i) => ({
      name,
      value: total > 0 ? Math.round((qty / total) * 100) : 0,
      rawValue: qty,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  return res.json({ data, total });
});

export default router;
