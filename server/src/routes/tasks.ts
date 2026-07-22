import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const projectId = req.query.projectId as string | undefined;
    const assigneeId = req.query.assigneeId as string | undefined;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
          reporter: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
          _count: { select: { comments: true } },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      data: tasks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assigneeId } = req.body;

    if (!title || !projectId) {
      throw new AppError('Title and projectId are required', 400, 'VALIDATION_ERROR');
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project');

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        reporterId: req.user!.userId,
        assigneeId: assigneeId || null,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        reporter: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
      },
    });

    res.status(201).json({ data: task });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: { select: { id: true, name: true, ownerId: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        reporter: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        comments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) throw new NotFoundError('Task');

    res.json({ data: task });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) throw new NotFoundError('Task');

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        reporter: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
      },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) throw new NotFoundError('Task');

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ data: { message: 'Task deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    if (!content) throw new AppError('Content is required', 400, 'VALIDATION_ERROR');

    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) throw new NotFoundError('Task');

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: req.params.id,
        userId: req.user!.userId,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
      },
    });

    res.status(201).json({ data: comment });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as tasksRouter };