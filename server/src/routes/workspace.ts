import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.query.organizationId as string | undefined;
    const where: Record<string, unknown> = {};
    if (organizationId) where.organizationId = organizationId;
    else if (req.user!.organizationId) where.organizationId = req.user!.organizationId;

    const workspaces = await prisma.workspace.findMany({
      where,
      include: { organization: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ data: workspaces });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, icon } = req.body;
    if (!name) throw new AppError('Workspace name is required', 400, 'VALIDATION_ERROR');

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        icon: icon || null,
        organizationId: req.user!.organizationId || null,
      },
      include: { organization: { select: { id: true, name: true } } },
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
      include: { organization: { select: { id: true, name: true } } },
    });

    if (!workspace) throw new NotFoundError('Workspace');
    res.json({ data: workspace });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, icon } = req.body;
    const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
    if (!workspace) throw new NotFoundError('Workspace');

    const updated = await prisma.workspace.update({
      where: { id: req.params.id },
      data: { ...(name !== undefined && { name }), ...(icon !== undefined && { icon }) },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
    if (!workspace) throw new NotFoundError('Workspace');

    await prisma.workspace.delete({ where: { id: req.params.id } });
    res.json({ data: { message: 'Workspace deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as workspaceRouter };