// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await prisma.userSettings.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: req.user!.userId,
          theme: 'LIGHT',
          preferences: {},
        },
      });
    }

    res.json({ data: settings });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { preferences, notifications, privacy } = req.body;

    let settings = await prisma.userSettings.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: req.user!.userId,
          theme: 'LIGHT',
          preferences: preferences || {},
        },
      });
    }

    const updated = await prisma.userSettings.update({
      where: { userId: req.user!.userId },
      data: {
        ...(preferences !== undefined && { preferences }),
        ...(notifications !== undefined && { notifications }),
        ...(privacy !== undefined && { privacy }),
      },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.put('/appearance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { theme, sidebarCollapsed, fontSize, compactMode } = req.body;

    let settings = await prisma.userSettings.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: req.user!.userId,
          theme: theme || 'LIGHT',
          preferences: { sidebarCollapsed, fontSize, compactMode },
        },
      });
    }

    const currentPreferences = (settings.preferences as Record<string, unknown>) || {};

    const updated = await prisma.userSettings.update({
      where: { userId: req.user!.userId },
      data: {
        ...(theme !== undefined && { theme }),
        ...((sidebarCollapsed !== undefined || fontSize !== undefined || compactMode !== undefined) && {
          preferences: {
            ...currentPreferences,
            ...(sidebarCollapsed !== undefined && { sidebarCollapsed }),
            ...(fontSize !== undefined && { fontSize }),
            ...(compactMode !== undefined && { compactMode }),
          },
        }),
      },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as settingsRouter };
