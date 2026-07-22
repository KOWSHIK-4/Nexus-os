import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const organizationId = req.query.organizationId as string | undefined;
    const ownerId = req.query.ownerId as string | undefined;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
      where.OR = [
        ...(where.OR || []),
        { ownerId: req.user!.userId },
        { members: { some: { userId: req.user!.userId } } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true, avatar: true } },
          _count: { select: { members: true, tasks: true } },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      data: projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status, organizationId } = req.body;

    if (!name) {
      throw new AppError('Project name is required', 400, 'VALIDATION_ERROR');
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'ACTIVE',
        ownerId: req.user!.userId,
        organizationId: organizationId || req.user!.organizationId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: req.user!.userId,
        role: 'OWNER',
      },
    });

    res.status(201).json({ data: project });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
          },
        },
        _count: { select: { tasks: true, documents: true, notes: true } },
      },
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    res.json({ data: project });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, status } = req.body;

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      throw new NotFoundError('Project');
    }

    if (project.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
      throw new ForbiddenError('You do not have permission to update this project');
    }

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      throw new NotFoundError('Project');
    }

    if (project.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
      throw new ForbiddenError('You do not have permission to delete this project');
    }

    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({ data: { message: 'Project deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/members', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.body;

    if (!userId) {
      throw new AppError('userId is required', 400, 'VALIDATION_ERROR');
    }

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      throw new NotFoundError('Project');
    }

    if (project.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
      throw new ForbiddenError('You do not have permission to add members');
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundError('User');
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id, userId } },
    });

    if (existing) {
      throw new ConflictError('User is already a member of this project');
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: req.params.id,
        userId,
        role: role || 'MEMBER',
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    res.status(201).json({ data: member });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/members/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      throw new NotFoundError('Project');
    }

    if (project.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
      throw new ForbiddenError('You do not have permission to remove members');
    }

    if (req.params.userId === project.ownerId) {
      throw new AppError('Cannot remove the project owner', 400, 'CANNOT_REMOVE_OWNER');
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } },
    });

    if (!member) {
      throw new NotFoundError('Member');
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } },
    });

    res.json({ data: { message: 'Member removed successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as projectsRouter };
