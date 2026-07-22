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
    const isArchived = req.query.isArchived as string | undefined;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (userId) where.userId = userId;
    if (isArchived !== undefined) where.isArchived = isArchived === 'true';

    const documents = await prisma.document.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ data: documents });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, icon } = req.body;
    if (!title) throw new AppError('Title is required', 400, 'VALIDATION_ERROR');

    const document = await prisma.document.create({
      data: {
        title,
        content: content || '',
        icon: icon || null,
        userId: req.user!.userId,
      },
    });

    res.status(201).json({ data: document });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) throw new NotFoundError('Document');
    res.json({ data: document });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, icon, isPinned, isArchived } = req.body;

    const document = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!document) throw new NotFoundError('Document');

    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(icon !== undefined && { icon }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isArchived !== undefined && { isArchived }),
        version: { increment: 1 },
      },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!document) throw new NotFoundError('Document');

    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ data: { message: 'Document deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as documentsRouter };