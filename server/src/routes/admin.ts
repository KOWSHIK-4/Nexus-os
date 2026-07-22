import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'OWNER'));

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;
    const isActive = req.query.isActive as string | undefined;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive === 'true') {
      where.isActive = true;
    } else if (isActive === 'false') {
      where.isActive = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isActive: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              projects: true,
              tasks: true,
              ownedProjects: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id/role', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;

    if (!role) {
      throw new AppError('Role is required', 400, 'VALIDATION_ERROR');
    }

    const validRoles = ['USER', 'ADMIN', 'OWNER'];
    if (!validRoles.includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400, 'VALIDATION_ERROR');
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.id === req.user!.userId) {
      throw new AppError('Cannot change your own role', 400, 'SELF_ROLE_CHANGE');
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

router.get('/analytics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalProjects,
      totalTasks,
      totalOrganizations,
      recentRegistrations,
      usersByRole,
      projectsByStatus,
      tasksByStatus,
      storageUsed,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { updatedAt: { gte: since } } }),
      prisma.project.count(),
      prisma.task.count(),
      prisma.organization.count(),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      prisma.project.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.task.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.file.aggregate({ _sum: { size: true } }),
    ]);

    res.json({
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalProjects,
          totalTasks,
          totalOrganizations,
          recentRegistrations,
          storageUsed: storageUsed._sum.size || 0,
        },
        usersByRole: usersByRole.reduce((acc, r) => {
          acc[r.role] = r._count.id;
          return acc;
        }, {} as Record<string, number>),
        projectsByStatus: projectsByStatus.reduce((acc, s) => {
          acc[s.status] = s._count.id;
          return acc;
        }, {} as Record<string, number>),
        tasksByStatus: tasksByStatus.reduce((acc, s) => {
          acc[s.status] = s._count.id;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;
    const action = req.query.action as string | undefined;
    const entity = req.query.entity as string | undefined;
    const userId = req.query.userId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const where: Record<string, unknown> = {};

    if (action) {
      where.action = action;
    }

    if (entity) {
      where.entity = entity;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as adminRouter };
