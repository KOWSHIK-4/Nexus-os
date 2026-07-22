import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/boards/:projectId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) throw new NotFoundError('Project');

    const boards = await prisma.kanbanBoard.findMany({
      where: { projectId: req.params.projectId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              include: {
                assignee: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ data: boards });
  } catch (error) {
    next(error);
  }
});

router.post('/boards', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, projectId } = req.body;
    if (!name || !projectId) throw new AppError('Name and projectId are required', 400, 'VALIDATION_ERROR');

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project');

    const board = await prisma.kanbanBoard.create({
      data: { name, projectId },
      include: { columns: true },
    });

    const defaultColumns = ['To Do', 'In Progress', 'Review', 'Done'];
    for (let i = 0; i < defaultColumns.length; i++) {
      await prisma.kanbanColumn.create({
        data: { name: defaultColumns[i], boardId: board.id, order: i * 1000 },
      });
    }

    const fullBoard = await prisma.kanbanBoard.findUnique({
      where: { id: board.id },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              include: {
                assignee: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
              },
            },
          },
        },
      },
    });

    res.status(201).json({ data: fullBoard });
  } catch (error) {
    next(error);
  }
});

router.put('/boards/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const board = await prisma.kanbanBoard.findUnique({ where: { id: req.params.id } });
    if (!board) throw new NotFoundError('Board');

    const updated = await prisma.kanbanBoard.update({
      where: { id: req.params.id },
      data: { ...(name !== undefined && { name }) },
      include: { columns: { orderBy: { order: 'asc' } } },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/boards/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const board = await prisma.kanbanBoard.findUnique({ where: { id: req.params.id } });
    if (!board) throw new NotFoundError('Board');

    await prisma.kanbanBoard.delete({ where: { id: req.params.id } });
    res.json({ data: { message: 'Board deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

router.post('/columns', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, boardId, order } = req.body;
    if (!name || !boardId) throw new AppError('Name and boardId are required', 400, 'VALIDATION_ERROR');

    const board = await prisma.kanbanBoard.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundError('Board');

    let targetOrder = order;
    if (targetOrder === undefined) {
      const maxOrder = await prisma.kanbanColumn.aggregate({
        where: { boardId }, _max: { order: true },
      });
      targetOrder = (maxOrder._max.order || 0) + 1000;
    }

    const column = await prisma.kanbanColumn.create({
      data: { name, boardId, order: targetOrder },
    });

    res.status(201).json({ data: column });
  } catch (error) {
    next(error);
  }
});

router.put('/columns/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, order } = req.body;
    const column = await prisma.kanbanColumn.findUnique({ where: { id: req.params.id } });
    if (!column) throw new NotFoundError('Column');

    const updated = await prisma.kanbanColumn.update({
      where: { id: req.params.id },
      data: { ...(name !== undefined && { name }), ...(order !== undefined && { order }) },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/columns/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: req.params.id },
      include: { tasks: true },
    });
    if (!column) throw new NotFoundError('Column');

    if (column.tasks.length > 0) {
      await prisma.task.updateMany({
        where: { boardColumnId: req.params.id },
        data: { boardColumnId: null },
      });
    }

    await prisma.kanbanColumn.delete({ where: { id: req.params.id } });
    res.json({ data: { message: 'Column deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

router.put('/tasks/:id/move', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { columnId, order } = req.body;
    if (!columnId) throw new AppError('columnId is required', 400, 'VALIDATION_ERROR');

    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) throw new NotFoundError('Task');

    const column = await prisma.kanbanColumn.findUnique({ where: { id: columnId } });
    if (!column) throw new NotFoundError('Column');

    let targetOrder = order;
    if (targetOrder === undefined) {
      const maxOrder = await prisma.task.aggregate({
        where: { boardColumnId: columnId }, _max: { order: true },
      });
      targetOrder = (maxOrder._max.order || 0) + 1000;
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        boardColumnId: columnId,
        order: targetOrder,
        status: column.name === 'Done' ? 'DONE' : task.status === 'DONE' ? 'TODO' : task.status,
      },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        boardColumn: { select: { id: true, name: true } },
      },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as kanbanRouter };