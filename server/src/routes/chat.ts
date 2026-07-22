import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/channels', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.query.projectId as string | undefined;

    const where: Record<string, unknown> = {};

    if (projectId) {
      where.projectId = projectId;
    }

    const channels = await prisma.channel.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ data: channels });
  } catch (error) {
    next(error);
  }
});

router.post('/channels', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, type, projectId } = req.body;

    if (!name) {
      throw new AppError('Channel name is required', 400, 'VALIDATION_ERROR');
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        description: description || '',
        type: type || 'PUBLIC',
        projectId: projectId || null,
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ data: channel });
  } catch (error) {
    next(error);
  }
});

router.get('/messages/:channelId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { channelId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) {
      throw new NotFoundError('Channel');
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { channelId },
        include: {
          author: { select: { id: true, name: true, email: true, avatar: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.message.count({ where: { channelId } }),
    ]);

    res.json({
      data: messages.reverse(),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, channelId } = req.body;

    if (!content || !channelId) {
      throw new AppError('Content and channelId are required', 400, 'VALIDATION_ERROR');
    }

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel) {
      throw new NotFoundError('Channel');
    }

    const message = await prisma.message.create({
      data: {
        content,
        channelId,
        authorId: req.user!.userId,
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    await prisma.channel.update({
      where: { id: channelId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ data: message });
  } catch (error) {
    next(error);
  }
});

router.delete('/messages/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      throw new NotFoundError('Message');
    }

    if (message.authorId !== req.user!.userId && req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
      throw new AppError('You can only delete your own messages', 403, 'FORBIDDEN');
    }

    await prisma.message.delete({ where: { id: req.params.id } });

    res.json({ data: { message: 'Message deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as chatRouter };
