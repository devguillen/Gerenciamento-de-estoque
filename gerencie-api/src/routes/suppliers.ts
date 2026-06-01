import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma, paginate, parseIntParam, parseScope, parseSortDir, toTimestamp } from '../lib/prisma';
import { ownerScopeWhere, canModifyResource } from '../lib/scope';
import { authMiddleware, AuthRequest, getAccountId } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

function mapSupplier(supplier: {
  id: number;
  name: string;
  address: string | null;
  deleted: boolean;
  ownerAccountId: number;
  createdAt: Date;
}) {
  return {
    id: supplier.id,
    created_at: toTimestamp(supplier.createdAt),
    name: supplier.name,
    address: supplier.address,
    deleted: supplier.deleted,
    owner_account_id: supplier.ownerAccountId,
  };
}

router.get('/account/suppliers', async (req: AuthRequest, res: Response) => {
  const accountId = getAccountId(req);
  const page = parseIntParam(req.query.page, 1);
  const perPage = parseIntParam(req.query.per_page, 10);
  const search = String(req.query.search || '').trim();
  const scope = parseScope(req.query.scope);
  const sortBy = String(req.query.sort_by || 'created_at');
  const sortDir = parseSortDir(req.query.sort_dir);

  const where: Record<string, unknown> = {
    deleted: false,
    ownerAccountId: ownerScopeWhere(accountId, scope),
  };
  if (search) where.name = { contains: search };

  const orderBy =
    sortBy === 'name'
      ? { name: sortDir }
      : { createdAt: sortDir };

  const total = await prisma.supplier.count({ where });
  const suppliers = await prisma.supplier.findMany({
    where,
    orderBy,
    skip: (page - 1) * perPage,
    take: perPage,
  });

  return res.json(paginate(suppliers.map(mapSupplier), page, perPage, total));
});

const supplierSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional().nullable(),
  adress: z.string().optional().nullable(),
});

router.post('/suppliers', async (req: AuthRequest, res: Response) => {
  const parsed = supplierSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid supplier data.' });

  const address = parsed.data.address ?? parsed.data.adress ?? null;
  const supplier = await prisma.supplier.create({
    data: {
      name: parsed.data.name,
      address: address || null,
      ownerAccountId: getAccountId(req),
    },
  });

  return res.status(201).json(mapSupplier(supplier));
});

router.patch('/suppliers', async (req: AuthRequest, res: Response) => {
  const schema = supplierSchema.extend({
    suppliers_id: z.coerce.number().int().positive(),
    id: z.coerce.number().int().positive().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid supplier data.' });

  const id = parsed.data.suppliers_id ?? parsed.data.id;
  const address = parsed.data.address ?? parsed.data.adress ?? null;

  const accountId = getAccountId(req);
  const existing = await prisma.supplier.findFirst({ where: { id, deleted: false } });
  if (!existing) return res.status(404).json({ message: 'Supplier not found.' });
  if (!canModifyResource(existing.ownerAccountId, accountId)) {
    return res.status(403).json({ message: 'Forbidden.' });
  }

  const supplier = await prisma.supplier.update({
    where: { id },
    data: { name: parsed.data.name, address: address || null },
  });

  return res.json(mapSupplier(supplier));
});

router.delete('/suppliers', async (req: AuthRequest, res: Response) => {
  const id = Number(req.body?.suppliers_id);
  if (!id) return res.status(400).json({ message: 'suppliers_id is required.' });

  const accountId = getAccountId(req);
  const existing = await prisma.supplier.findFirst({ where: { id, deleted: false } });
  if (!existing) return res.status(404).json({ message: 'Supplier not found.' });
  if (!canModifyResource(existing.ownerAccountId, accountId)) {
    return res.status(403).json({ message: 'Forbidden.' });
  }

  await prisma.supplier.update({ where: { id }, data: { deleted: true } });
  return res.status(204).send();
});

export default router;
