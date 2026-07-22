import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.start as string | undefined;
    const endDate = req.query.end as string | undefined;
    const projectId = req.query.projectId as string | undefined;
    const userId = req.user!.userId;

    const where: Record<string, unknown> = {
      dueDate: { not: null },
    };

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) {
        (where.dueDate as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.dueDate as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
      where.OR = [
        { assigneeId: userId },
        { project: { ownerId: userId } },
        { project: { members: { some: { userId } } } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        projectId: true,
        assigneeId: true,
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const events = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      date: task.dueDate,
      type: 'TASK',
      status: task.status,
      priority: task.priority,
      project: task.project,
      assignee: task.assignee,
    }));

    res.json({ data: events });
  } catch (error) {
    next(error);
  }
});

router.get('/tasks/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateParam = req.params.date;
    const date = new Date(dateParam);

    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date format. Use YYYY-MM-DD', 400, 'INVALID_DATE');
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const userId = req.user!.userId;

    const where: Record<string, unknown> = {
      dueDate: { gte: startOfDay, lte: endOfDay },
    };

    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
      where.OR = [
        { assigneeId: userId },
        { project: { ownerId: userId } },
        { project: { members: { some: { userId } } } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    res.json({ data: tasks });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as calendarRouter };
