import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError, ConflictError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const teams = await prisma.team.findMany({
      where,
      include: { _count: { select: { members: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ data: teams });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    if (!name) throw new AppError('Team name is required', 400, 'VALIDATION_ERROR');

    const team = await prisma.team.create({
      data: { name, description: description || '' },
    });

    await prisma.teamMember.create({
      data: { teamId: team.id, userId: req.user!.userId, role: 'ADMIN' },
    });

    const fullTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
          },
        },
      },
    });

    res.status(201).json({ data: fullTeam });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, role: true } },
          },
        },
      },
    });

    if (!team) throw new NotFoundError('Team');
    res.json({ data: team });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const team = await prisma.team.findUnique({ where: { id: req.params.id } });
    if (!team) throw new NotFoundError('Team');

    const updated = await prisma.team.update({
      where: { id: req.params.id },
      data: { ...(name !== undefined && { name }), ...(description !== undefined && { description }) },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const team = await prisma.team.findUnique({ where: { id: req.params.id } });
    if (!team) throw new NotFoundError('Team');

    await prisma.team.delete({ where: { id: req.params.id } });
    res.json({ data: { message: 'Team deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/members', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.body;
    if (!userId) throw new AppError('userId is required', 400, 'VALIDATION_ERROR');

    const team = await prisma.team.findUnique({ where: { id: req.params.id } });
    if (!team) throw new NotFoundError('Team');

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw new NotFoundError('User');

    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: req.params.id, userId } },
    });
    if (existing) throw new ConflictError('User is already a member of this team');

    const member = await prisma.teamMember.create({
      data: { teamId: req.params.id, userId, role: role || 'MEMBER' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
      },
    });

    res.status(201).json({ data: member });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/members/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const member = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: req.params.id, userId: req.params.userId } },
    });
    if (!member) throw new NotFoundError('Member');

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId: req.params.id, userId: req.params.userId } },
    });

    res.json({ data: { message: 'Member removed successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as teamsRouter };