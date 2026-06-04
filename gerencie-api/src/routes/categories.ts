import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma, paginate, parseIntParam, parseScope, parseSortDir, toTimestamp } from '../lib/prisma';
import { ownerScopeWhere, canModifyResource } from '../lib/scope';
import { authMiddleware, AuthRequest, getAccountId } from '../middleware/auth';
import { createAuditLog } from '../lib/auditLog';

const router = Router();
router.use(authMiddleware);

function mapCategory(category: {
  id: number;
  name: string;
  ownerAccountId: number;
  prioritySort: number;
  createdAt: Date;
  accountCategories?: Array<{
    id: number;
    accountId: number;
    categoryId: number;
    priority: number;
    createdAt: Date;
  }>;
}) {
  const accountCategory = category.accountCategories?.[0];
  return {
    id: category.id,
    created_at: toTimestamp(category.createdAt),
    name: category.name,
    owner_account_id: category.ownerAccountId,
    priority_sort: category.prioritySort,
    ...(accountCategory
      ? {
          account_category: {
            id: accountCategory.id,
            created_at: toTimestamp(accountCategory.createdAt),
            account_id: accountCategory.accountId,
            category_id: accountCategory.categoryId,
            priority: accountCategory.priority,
          },
        }
      : {}),
  };
}

router.get('/account/categories', async (req: AuthRequest, res: Response) => {
  const accountId = getAccountId(req);
  const page = parseIntParam(req.query.page, 1);
  const perPage = parseIntParam(req.query.per_page, 10);
  const search = String(req.query.search || '').trim();
  const priority = req.query.priority != null && req.query.priority !== '' ? Number(req.query.priority) : null;
  const scope = parseScope(req.query.scope);
  const sortBy = String(req.query.sort_by || 'category.priority_sort');
  const sortDir = parseSortDir(req.query.sort_dir);

  const where: Record<string, unknown> = {
    deleted: false,
    ownerAccountId: ownerScopeWhere(accountId, scope),
  };
  if (search.length >= 1) where.name = { contains: search };

  const categories = await prisma.category.findMany({
    where,
    include: {
      accountCategories: { where: { accountId } },
    },
  });

  let filtered = categories;
  if (priority != null && !Number.isNaN(priority)) {
    filtered = categories.filter((c) => {
      const ac = c.accountCategories[0];
      const p = ac?.priority ?? c.prioritySort;
      return p === priority;
    });
  }

  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortBy.includes('name')) cmp = a.name.localeCompare(b.name);
    else if (sortBy.includes('owner_account_id')) cmp = a.ownerAccountId - b.ownerAccountId;
    else {
      const pa = a.accountCategories[0]?.priority ?? a.prioritySort;
      const pb = b.accountCategories[0]?.priority ?? b.prioritySort;
      cmp = pa - pb;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const total = filtered.length;
  const offset = (page - 1) * perPage;
  const pageItems = filtered.slice(offset, offset + perPage).map(mapCategory);

  return res.json(paginate(pageItems, page, perPage, total));
});

const categorySchema = z.object({
  name: z.string().min(1),
  priority: z.coerce.number().int().min(0).max(5),
});

router.post('/category', async (req: AuthRequest, res: Response) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid category data.' });

  const accountId = getAccountId(req);
  const userId = req.user?.userId || 0;
  const { name, priority } = parsed.data;

  const category = await prisma.category.create({
    data: {
      name,
      prioritySort: priority,
      ownerAccountId: accountId,
      accountCategories: {
        create: { accountId, priority },
      },
    },
    include: { accountCategories: { where: { accountId } } },
  });

  // Registrar log de criação de categoria
  await createAuditLog({
    userId,
    accountId,
    action: 'CREATE',
    entity: 'Category',
    entityId: category.id,
    newValues: { name, priority },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.status(201).json(mapCategory(category));
});

router.patch('/category/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid category data.' });

  const accountId = getAccountId(req);
  const userId = req.user?.userId || 0;
  const existing = await prisma.category.findFirst({ where: { id, deleted: false } });
  if (!existing) return res.status(404).json({ message: 'Category not found.' });
  if (!canModifyResource(existing.ownerAccountId, accountId)) {
    return res.status(403).json({ message: 'Forbidden.' });
  }

  const { name, priority } = parsed.data;

  const oldValues = {
    name: existing.name,
    prioritySort: existing.prioritySort,
  };

  await prisma.category.update({
    where: { id },
    data: { name, prioritySort: priority },
  });

  await prisma.accountCategory.upsert({
    where: { accountId_categoryId: { accountId, categoryId: id } },
    create: { accountId, categoryId: id, priority },
    update: { priority },
  });

  // Registrar log de atualização de categoria
  await createAuditLog({
    userId,
    accountId,
    action: 'UPDATE',
    entity: 'Category',
    entityId: id,
    oldValues,
    newValues: { name, priority },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  const refreshed = await prisma.category.findUniqueOrThrow({
    where: { id },
    include: { accountCategories: { where: { accountId } } },
  });

  return res.json(mapCategory(refreshed));
});

router.delete('/category/:id', async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const accountId = getAccountId(req);
  const userId = req.user?.userId || 0;
  const existing = await prisma.category.findFirst({ where: { id, deleted: false } });
  if (!existing) return res.status(404).json({ message: 'Category not found.' });
  if (!canModifyResource(existing.ownerAccountId, accountId)) {
    return res.status(403).json({ message: 'Forbidden.' });
  }

  const oldValues = {
    name: existing.name,
    prioritySort: existing.prioritySort,
  };

  await prisma.category.update({ where: { id }, data: { deleted: true } });

  // Registrar log de exclusão de categoria
  await createAuditLog({
    userId,
    accountId,
    action: 'DELETE',
    entity: 'Category',
    entityId: id,
    oldValues,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.status(204).send();
});

export default router;
