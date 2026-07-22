import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError, NotFoundError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const organizationId = req.query.organizationId as string | undefined;

    const projectFilter = organizationId
      ? { organizationId }
      : { OR: [{ ownerId: userId }, { members: { some: { userId } } }] };

    const [
      totalProjects,
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      recentProjects,
      recentTasks,
      totalNotes,
      totalDocuments,
    ] = await Promise.all([
      prisma.project.count({ where: projectFilter }),
      prisma.task.count({
        where: organizationId
          ? { project: { organizationId } }
          : { OR: [{ assigneeId: userId }, { project: { ownerId: userId } }] },
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: organizationId
          ? { project: { organizationId } }
          : { OR: [{ assigneeId: userId }, { project: { ownerId: userId } }] },
        _count: { id: true },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: organizationId
          ? { project: { organizationId } }
          : { OR: [{ assigneeId: userId }, { project: { ownerId: userId } }] },
        _count: { id: true },
      }),
      prisma.project.findMany({
        where: projectFilter,
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, name: true, status: true, updatedAt: true, _count: { select: { tasks: true } } },
      }),
      prisma.task.findMany({
        where: organizationId
          ? { project: { organizationId } }
          : { OR: [{ assigneeId: userId }, { project: { ownerId: userId } }] },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { project: { select: { id: true, name: true } } },
      }),
      prisma.note.count({
        where: organizationId
          ? { project: { organizationId } }
          : { userId },
      }),
      prisma.document.count({
        where: organizationId
          ? { project: { organizationId } }
          : { ownerId: userId },
      }),
    ]);

    res.json({
      data: {
        totalProjects,
        totalTasks,
        tasksByStatus: tasksByStatus.reduce((acc, s) => {
          acc[s.status] = s._count.id;
          return acc;
        }, {} as Record<string, number>),
        tasksByPriority: tasksByPriority.reduce((acc, p) => {
          acc[p.priority] = p._count.id;
          return acc;
        }, {} as Record<string, number>),
        totalNotes,
        totalDocuments,
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
    const organizationId = req.query.organizationId as string | undefined;
    const userId = req.user!.userId;

    const projects = await prisma.project.findMany({
      where: organizationId
        ? { organizationId }
        : { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
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

        return {
          ...project,
          tasksByStatus: tasksByStatus.reduce((acc, s) => {
            acc[s.status] = s._count.id;
            return acc;
          }, {} as Record<string, number>),
          overdueTasks,
          completionRate: project._count.tasks > 0
            ? Math.round(
                ((tasksByStatus.find((s) => s.status === 'DONE')?._count.id || 0) /
                  project._count.tasks) *
                  100
              )
            : 0,
        };
      })
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
      OR: [{ assigneeId: userId }, { project: { ownerId: userId } }] as Record<string, unknown>[],
    };

    const [totalTasks, completedTasks, overdueTasks, tasksByDay, topAssignees] = await Promise.all([
      prisma.task.count({ where: taskFilter }),
      prisma.task.count({ where: { ...taskFilter, status: 'DONE' } }),
      prisma.task.count({
        where: {
          dueDate: { lt: new Date() },
          status: { not: 'DONE' },
          OR: [{ assigneeId: userId }, { project: { ownerId: userId } }],
        },
      }),
      prisma.$queryRawUnsafe<Array<{ date: string; count: bigint }>>(
        `SELECT DATE(created_at) as date, COUNT(*) as count FROM tasks WHERE created_at >= $1 AND (assignee_id = $2 OR project_id IN (SELECT id FROM projects WHERE owner_id = $2)) GROUP BY DATE(created_at) ORDER BY date`,
        since,
        userId,
      ),
      prisma.task.groupBy({
        by: ['assigneeId'],
        where: { ...taskFilter, assigneeId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    let assigneeDetails: { id: string; name: string; email: string; avatar: string | null; taskCount: number }[] = [];
    if (topAssignees.length > 0) {
      const assigneeIds = topAssignees.map((a) => a.assigneeId!).filter(Boolean);
      const users = await prisma.user.findMany({
        where: { id: { in: assigneeIds } },
        select: { id: true, name: true, email: true, avatar: true },
      });

      assigneeDetails = topAssignees.map((a) => {
        const user = users.find((u) => u.id === a.assigneeId);
        return {
          id: a.assigneeId!,
          name: user?.name || 'Unknown',
          email: user?.email || '',
          avatar: user?.avatar || null,
          taskCount: a._count.id,
        };
      });
    }

    res.json({
      data: {
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        tasksByDay: tasksByDay.map((d) => ({ date: d.date, count: Number(d.count) })),
        topAssignees: assigneeDetails,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/team', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = req.query.teamId as string | undefined;
    const organizationId = req.query.organizationId as string | undefined;

    const teamFilter: Record<string, unknown> = {};
    if (teamId) {
      teamFilter.id = teamId;
    }
    if (organizationId) {
      teamFilter.organizationId = organizationId;
    }

    const teams = await prisma.team.findMany({
      where: Object.keys(teamFilter).length > 0 ? teamFilter : undefined,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: { select: { members: true } },
      },
    });

    const teamPerformance = await Promise.all(
      teams.map(async (team) => {
        const memberIds = team.members.map((m) => m.user.id);

        const [totalTasks, completedTasks, pendingTasks] = await Promise.all([
          prisma.task.count({
            where: { assigneeId: { in: memberIds } },
          }),
          prisma.task.count({
            where: { assigneeId: { in: memberIds }, status: 'DONE' },
          }),
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
          members: team.members,
          totalTasks,
          completedTasks,
          pendingTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
      })
    );

    res.json({ data: teamPerformance });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as analyticsRouter };
