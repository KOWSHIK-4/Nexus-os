import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const userId = req.query.userId as string | undefined;
    const tags = req.query.tags as string | undefined;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (userId) where.userId = userId;
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
      where.userId = req.user!.userId;
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim());
      where.tags = { hasSome: tagList };
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ data: notes });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, tags, color } = req.body;
    if (!title) throw new AppError('Title is required', 400, 'VALIDATION_ERROR');

    const note = await prisma.note.create({
      data: {
        title,
        content: content || '',
        tags: tags || [],
        color: color || null,
        userId: req.user!.userId,
      },
    });

    res.status(201).json({ data: note });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) throw new NotFoundError('Note');
    res.json({ data: note });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, tags, color, isPinned } = req.body;

    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) throw new NotFoundError('Note');

    const updated = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        ...(color !== undefined && { color }),
        ...(isPinned !== undefined && { isPinned }),
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
    if (!note) throw new NotFoundError('Note');

    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ data: { message: 'Note deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as notesRouter };