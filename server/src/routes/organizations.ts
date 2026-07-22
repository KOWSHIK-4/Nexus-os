import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let organization;

    if (req.user!.organizationId) {
      organization = await prisma.organization.findUnique({
        where: { id: req.user!.organizationId },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
            },
          },
          _count: { select: { projects: true, workspaces: true } },
        },
      });

      if (!organization) {
        throw new NotFoundError('Organization');
      }
    }

    res.json({ data: organization || null });
  } catch (error) {
    next(error);
  }
});

router.put('/', authorize('ADMIN', 'OWNER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user!.organizationId) {
      throw new AppError('You are not part of an organization', 400, 'NO_ORGANIZATION');
    }

    const { name, description, logo } = req.body;

    const organization = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
    });

    if (!organization) {
      throw new NotFoundError('Organization');
    }

    const updated = await prisma.organization.update({
      where: { id: req.user!.organizationId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(logo !== undefined && { logo }),
      },
      include: {
        _count: { select: { members: true, projects: true } },
      },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.post('/invite', authorize('ADMIN', 'OWNER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user!.organizationId) {
      throw new AppError('You are not part of an organization', 400, 'NO_ORGANIZATION');
    }

    const { email, role } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400, 'VALIDATION_ERROR');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundError('User with this email');
    }

    const existing = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: req.user!.organizationId, userId: user.id } },
    });

    if (existing) {
      throw new ConflictError('User is already a member of this organization');
    }

    const member = await prisma.organizationMember.create({
      data: {
        organizationId: req.user!.organizationId,
        userId: user.id,
        role: role || 'MEMBER',
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: req.user!.organizationId },
    });

    res.status(201).json({ data: member });
  } catch (error) {
    next(error);
  }
});

router.delete('/members/:userId', authorize('ADMIN', 'OWNER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user!.organizationId) {
      throw new AppError('You are not part of an organization', 400, 'NO_ORGANIZATION');
    }

    const member = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: req.user!.organizationId, userId: req.params.userId } },
      include: { organization: true },
    });

    if (!member) {
      throw new NotFoundError('Member');
    }

    if (member.role === 'OWNER') {
      throw new AppError('Cannot remove an owner from the organization', 400, 'CANNOT_REMOVE_OWNER');
    }

    if (req.params.userId === req.user!.userId) {
      throw new AppError('Cannot remove yourself from the organization', 400, 'SELF_REMOVE');
    }

    await prisma.organizationMember.delete({
      where: { organizationId_userId: { organizationId: req.user!.organizationId, userId: req.params.userId } },
    });

    const otherOrgs = await prisma.organizationMember.count({
      where: { userId: req.params.userId },
    });

    if (otherOrgs === 0) {
      await prisma.user.update({
        where: { id: req.params.userId },
        data: { organizationId: null },
      });
    }

    res.json({ data: { message: 'Member removed from organization successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as organizationsRouter };
