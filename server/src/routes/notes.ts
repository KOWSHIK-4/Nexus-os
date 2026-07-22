import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const projectId = req.query.projectId as string | undefined;
    const userId = req.query.userId as string | undefined;
    const tags = req.query.tags as string | undefined;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (userId) {
      where.userId = userId;
    } else if (req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
      where.userId = req.user!.userId;
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim());
      where.tags = { hasSome: tagList };
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ data: notes });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, tags, projectId } = req.body;

    if (!title) {
      throw new AppError('Title is required', 400, 'VALIDATION_ERROR');
    }

    const note = await prisma.note.create({
      data: {
        title,
        content: content || '',
        tags: tags || [],
        userId: req.user!.userId,
        projectId: projectId || null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ data: note });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!note) {
      throw new NotFoundError('Note');
    }

    res.json({ data: note });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, tags, projectId } = req.body;

    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) {
      throw new NotFoundError('Note');
    }

    const updated = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        ...(projectId !== undefined && { projectId: projectId || null }),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) {
      throw new NotFoundError('Note');
    }

    await prisma.note.delete({ where: { id: req.params.id } });

    res.json({ data: { message: 'Note deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as notesRouter };
