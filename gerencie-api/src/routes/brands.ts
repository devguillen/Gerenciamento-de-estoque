import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma, paginate, parseIntParam, toTimestamp } from '../lib/prisma';
import { authMiddleware, AuthRequest, getAccountId } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

function mapBrand(brand: { id: number; name: string; ownerAccountId: number; createdAt: Date }) {
  return {
    id: brand.id,
    created_at: toTimestamp(brand.createdAt),
    name: brand.name,
    owner_account_id: brand.ownerAccountId,
  };
}

router.get('/brand', async (req: AuthRequest, res: Response) => {
  const accountId = getAccountId(req);
  const page = parseIntParam(req.query.page, 1);
  const perPage = parseIntParam(req.query.per_page, 20);
  const search = String(req.query.search || '').trim();

  const where = {
    OR: [{ ownerAccountId: 0 }, { ownerAccountId: accountId }],
    ...(search ? { name: { contains: search } } : {}),
  };

  const total = await prisma.brand.count({ where });
  const brands = await prisma.brand.findMany({
    where,
    orderBy: { name: 'asc' },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  return res.json(paginate(brands.map(mapBrand), page, perPage, total));
});

router.post('/brand', async (req: AuthRequest, res: Response) => {
  const parsed = z.object({ name: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid brand data.' });

  try {
    const brand = await prisma.brand.create({
      data: {
        name: parsed.data.name,
        ownerAccountId: getAccountId(req),
      },
    });
    return res.status(201).json(mapBrand(brand));
  } catch {
    return res.status(409).json({ message: 'Brand already exists for this account.' });
  }
});

router.patch('/brand/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const accountId = getAccountId(req);
  const parsed = z.object({ name: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid brand data.' });

  const existing = await prisma.brand.findFirst({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Brand not found.' });
  if (existing.ownerAccountId !== accountId) return res.status(403).json({ message: 'Forbidden.' });

  try {
    const updated = await prisma.brand.update({
      where: { id },
      data: { name: parsed.data.name },
    });
    return res.json(mapBrand(updated));
  } catch {
    return res.status(409).json({ message: 'Brand already exists for this account.' });
  }
});

router.delete('/brand/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const accountId = getAccountId(req);

  const existing = await prisma.brand.findFirst({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Brand not found.' });
  if (existing.ownerAccountId !== accountId) return res.status(403).json({ message: 'Forbidden.' });

  const productsCount = await prisma.product.count({ where: { brandId: id, deleted: false } });
  if (productsCount > 0) {
    return res.status(409).json({ message: 'Cannot delete brand with associated products.' });
  }

  await prisma.brand.delete({ where: { id } });
  return res.status(204).send();
});

export default router;
