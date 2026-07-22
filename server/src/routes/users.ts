import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError, ConflictError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, organizationId: true, createdAt: true, updatedAt: true },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, title: true, organizationId: true, createdAt: true, updatedAt: true },
    });

    if (!user) throw new NotFoundError('User');
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, avatar, title } = req.body;

    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('User');

    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) throw new ConflictError('Email is already in use');
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(avatar !== undefined && { avatar }),
        ...(title !== undefined && { title }),
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, title: true, organizationId: true, createdAt: true, updatedAt: true },
    });

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new NotFoundError('User');
    if (user.id === req.user!.userId) throw new AppError('Cannot delete yourself', 400, 'SELF_DELETE');

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ data: { message: 'User deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as usersRouter };