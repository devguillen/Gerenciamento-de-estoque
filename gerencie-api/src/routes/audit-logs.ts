import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Aplicar middleware de autenticação
router.use(authMiddleware);

// Listar logs de auditoria do usuário
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const accountId = (req as any).user.accountId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          accountId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.auditLog.count({
        where: {
          accountId,
        },
      }),
    ]);

    res.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    res.status(500).json({ error: 'Erro ao buscar logs de auditoria' });
  }
});

// Buscar detalhes de um log específico
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const accountId = (req as any).user.accountId;
    const logId = parseInt(req.params.id);

    const log = await prisma.auditLog.findFirst({
      where: {
        id: logId,
        accountId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!log) {
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    res.json(log);
  } catch (error) {
    console.error('Erro ao buscar detalhes do log:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do log' });
  }
});

export default router;
