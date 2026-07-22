import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { preferences: true },
    });

    res.json({ data: user?.preferences || {} });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { preferences } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const currentPrefs = (user.preferences as Record<string, unknown>) || {};

    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        preferences: {
          ...currentPrefs,
          ...(preferences !== undefined ? preferences : {}),
        },
      },
      select: { preferences: true },
    });

    res.json({ data: updated.preferences });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as settingsRouter };