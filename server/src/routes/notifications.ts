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
    const read = req.query.read as string | undefined;
    const type = req.query.type as string | undefined;

    const where: Record<string, unknown> = { userId: req.user!.userId };

    if (read === 'true') {
      where.read = true;
    } else if (read === 'false') {
      where.read = false;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: req.user!.userId, read: false } }),
    ]);

    res.json({
      data: notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      meta: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, read: false },
      data: { read: true },
    });

    res.json({ data: { message: 'All notifications marked as read' } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    if (notification.userId !== req.user!.userId) {
      throw new AppError('You can only mark your own notifications as read', 403, 'FORBIDDEN');
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as notificationsRouter };
