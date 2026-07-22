// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError, ConflictError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const projectId = req.query.projectId as string | undefined;
    const ownerId = req.query.ownerId as string | undefined;

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

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { collaborators: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ data: documents });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, projectId } = req.body;

    if (!title) {
      throw new AppError('Title is required', 400, 'VALIDATION_ERROR');
    }

    const document = await prisma.document.create({
      data: {
        title,
        content: content || '',
        version: 1,
        ownerId: req.user!.userId,
        projectId: projectId || null,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        project: { select: { id: true, name: true } },
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
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        project: { select: { id: true, name: true } },
        collaborators: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundError('Document');
    }

    res.json({ data: document });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content } = req.body;

    const document = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!document) {
      throw new NotFoundError('Document');
    }

    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        version: { increment: 1 },
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
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
    const document = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!document) {
      throw new NotFoundError('Document');
    }

    await prisma.document.delete({ where: { id: req.params.id } });

    res.json({ data: { message: 'Document deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/collaborators', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.body;

    if (!userId) {
      throw new AppError('userId is required', 400, 'VALIDATION_ERROR');
    }

    const document = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!document) {
      throw new NotFoundError('Document');
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundError('User');
    }

    const existing = await prisma.documentCollaborator.findUnique({
      where: { documentId_userId: { documentId: req.params.id, userId } },
    });

    if (existing) {
      throw new ConflictError('User is already a collaborator on this document');
    }

    const collaborator = await prisma.documentCollaborator.create({
      data: {
        documentId: req.params.id,
        userId,
        role: role || 'EDITOR',
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    res.status(201).json({ data: collaborator });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as documentsRouter };
