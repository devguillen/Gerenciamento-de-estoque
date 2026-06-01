import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest, getAccountId } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

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

export default router;
