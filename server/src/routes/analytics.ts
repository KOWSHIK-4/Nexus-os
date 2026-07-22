import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

router.use(authenticate);

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const [totalProjects, totalTasks, tasksByStatus, tasksByPriority, recentProjects, recentTasks] =
      await Promise.all([
        prisma.project.count({
          where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
        }),
        prisma.task.count({
          where: { OR: [{ assigneeId: userId }, { reporterId: userId }] },
        }),
        prisma.task.groupBy({
          by: ['status'],
          where: { OR: [{ assigneeId: userId }, { reporterId: userId }] },
          _count: { id: true },
        }),
        prisma.task.groupBy({
          by: ['priority'],
          where: { OR: [{ assigneeId: userId }, { reporterId: userId }] },
          _count: { id: true },
        }),
        prisma.project.findMany({
          where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: { id: true, name: true, status: true, updatedAt: true },
        }),
        prisma.task.findMany({
          where: { OR: [{ assigneeId: userId }, { reporterId: userId }] },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          include: { project: { select: { id: true, name: true } } },
        }),
      ]);

    res.json({
      data: {
        totalProjects,
        totalTasks,
        tasksByStatus: tasksByStatus.reduce(
          (acc, s) => {
            acc[s.status] = s._count.id;
            return acc;
          },
          {} as Record<string, number>,
        ),
        tasksByPriority: tasksByPriority.reduce(
          (acc, p) => {
            acc[p.priority] = p._count.id;
            return acc;
          },
          {} as Record<string, number>,
        ),
        recentProjects,
        recentTasks,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/projects', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const projects = await prisma.project.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const projectAnalytics = await Promise.all(
      projects.map(async (project) => {
        const tasksByStatus = await prisma.task.groupBy({
          by: ['status'],
          where: { projectId: project.id },
          _count: { id: true },
        });

        const overdueTasks = await prisma.task.count({
          where: {
            projectId: project.id,
            dueDate: { lt: new Date() },
            status: { not: 'DONE' },
          },
        });

        const doneCount = tasksByStatus.find((s) => s.status === 'DONE')?._count.id || 0;

        return {
          id: project.id,
          name: project.name,
          status: project.status,
          ownerId: project.ownerId,
          owner: project.owner,
          tasksByStatus: tasksByStatus.reduce(
            (acc, s) => {
              acc[s.status] = s._count.id;
              return acc;
            },
            {} as Record<string, number>,
          ),
          overdueTasks,
          totalTasks: project._count.tasks,
          totalMembers: project._count.members,
          completionRate: project._count.tasks > 0 ? Math.round((doneCount / project._count.tasks) * 100) : 0,
        };
      }),
    );

    res.json({ data: projectAnalytics });
  } catch (error) {
    next(error);
  }
});

router.get('/tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const taskFilter = {
      createdAt: { gte: since },
      OR: [{ assigneeId: userId }, { reporterId: userId }],
    };

    const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
      prisma.task.count({ where: taskFilter }),
      prisma.task.count({ where: { ...taskFilter, status: 'DONE' } }),
      prisma.task.count({
        where: {
          dueDate: { lt: new Date() },
          status: { not: 'DONE' },
          OR: [{ assigneeId: userId }, { reporterId: userId }],
        },
      }),
    ]);

    res.json({
      data: {
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/team', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: { select: { members: true } },
      },
    });

    const teamPerformance = await Promise.all(
      teams.map(async (team) => {
        const teamWithMembers = await prisma.team.findUnique({
          where: { id: team.id },
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
                },
              },
            },
          },
        });

        const memberIds = teamWithMembers?.members.map((m) => m.user.id) || [];

        const [totalTasks, completedTasks, pendingTasks] = await Promise.all([
          prisma.task.count({ where: { assigneeId: { in: memberIds } } }),
          prisma.task.count({ where: { assigneeId: { in: memberIds }, status: 'DONE' } }),
          prisma.task.count({
            where: {
              assigneeId: { in: memberIds },
              status: { not: 'DONE' },
              dueDate: { lt: new Date() },
            },
          }),
        ]);

        return {
          id: team.id,
          name: team.name,
          description: team.description,
          memberCount: team._count.members,
          totalTasks,
          completedTasks,
          pendingTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
      }),
    );

    res.json({ data: teamPerformance });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as analyticsRouter };
