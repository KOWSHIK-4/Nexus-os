import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError, ConflictError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let organization = null;
    if (req.user!.organizationId) {
      organization = await prisma.organization.findUnique({
        where: { id: req.user!.organizationId },
        include: {
          _count: { select: { users: true, projects: true, workspaces: true } },
        },
      });
      if (!organization) throw new NotFoundError('Organization');
    }
    res.json({ data: organization });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user!.organizationId) throw new AppError('You are not part of an organization', 400, 'NO_ORGANIZATION');

    const { name } = req.body;
    const organization = await prisma.organization.findUnique({ where: { id: req.user!.organizationId } });
    if (!organization) throw new NotFoundError('Organization');

    const updated = await prisma.organization.update({
      where: { id: req.user!.organizationId },
      data: { ...(name !== undefined && { name }) },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.post('/invite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user!.organizationId) throw new AppError('You are not part of an organization', 400, 'NO_ORGANIZATION');

    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400, 'VALIDATION_ERROR');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundError('User with this email');

    if (user.organizationId) throw new ConflictError('User is already in an organization');

    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: req.user!.organizationId },
    });

    res.json({ data: { message: 'User invited successfully' } });
  } catch (error) {
    next(error);
  }
});

router.delete('/members/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user!.organizationId) throw new AppError('You are not part of an organization', 400, 'NO_ORGANIZATION');

    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) throw new NotFoundError('User');

    if (user.id === req.user!.userId) throw new AppError('Cannot remove yourself from the organization', 400, 'SELF_REMOVE');

    await prisma.user.update({
      where: { id: req.params.userId },
      data: { organizationId: null },
    });

    res.json({ data: { message: 'Member removed from organization successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as organizationsRouter };