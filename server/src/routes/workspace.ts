// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.query.organizationId as string | undefined;

    const where: Record<string, unknown> = {};

    if (organizationId) {
      where.organizationId = organizationId;
    } else if (req.user!.organizationId) {
      where.organizationId = req.user!.organizationId;
    }

    const workspaces = await prisma.workspace.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        organization: { select: { id: true, name: true } },
        _count: { select: { projects: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ data: workspaces });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, organizationId } = req.body;

    if (!name) {
      throw new AppError('Workspace name is required', 400, 'VALIDATION_ERROR');
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description: description || '',
        ownerId: req.user!.userId,
        organizationId: organizationId || req.user!.organizationId || null,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ data: workspace });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        organization: { select: { id: true, name: true } },
        projects: {
          include: {
            owner: { select: { id: true, name: true, avatar: true } },
            _count: { select: { tasks: true, members: true } },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace');
    }

    res.json({ data: workspace });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;

    const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
    if (!workspace) {
      throw new NotFoundError('Workspace');
    }

    const updated = await prisma.workspace.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
    if (!workspace) {
      throw new NotFoundError('Workspace');
    }

    await prisma.workspace.delete({ where: { id: req.params.id } });

    res.json({ data: { message: 'Workspace deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as workspaceRouter };
