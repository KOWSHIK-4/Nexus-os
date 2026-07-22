// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    const type = req.query.type as string | undefined;
    const projectId = req.query.projectId as string | undefined;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    if (!query || query.trim().length === 0) {
      throw new AppError('Search query is required', 400, 'VALIDATION_ERROR');
    }

    const searchTerm = query.trim();
    const userId = req.user!.userId;

    const searchFilter = {
      contains: searchTerm,
      mode: 'insensitive' as const,
    };

    const results: Record<string, unknown[]> = {};

    const allowedTypes = ['projects', 'tasks', 'notes', 'documents', 'files'];
    const typesToSearch = type
      ? type.split(',').filter((t) => allowedTypes.includes(t))
      : allowedTypes;

    if (typesToSearch.length === 0) {
      throw new AppError('Invalid search type. Valid types: projects, tasks, notes, documents, files', 400, 'VALIDATION_ERROR');
    }

    const promises: Promise<unknown>[] = [];

    const projectFilter = {
      OR: [
        { name: searchFilter },
        { description: searchFilter },
      ],
    };

    if (typesToSearch.includes('projects')) {
      promises.push(
        (async () => {
          results.projects = await prisma.project.findMany({
            where: {
              ...projectFilter,
              OR: [
                ...(projectFilter.OR as Record<string, unknown>[]),
                { ownerId: userId },
                { members: { some: { userId } } },
              ],
            },
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              updatedAt: true,
              owner: { select: { id: true, name: true, avatar: true } },
              _count: { select: { tasks: true, members: true } },
            },
            take: limit,
            orderBy: { updatedAt: 'desc' },
          });
        })()
      );
    }

    if (typesToSearch.includes('tasks')) {
      promises.push(
        (async () => {
          const taskWhere: Record<string, unknown> = {
            OR: [
              { title: searchFilter },
              { description: searchFilter },
            ],
          };

          if (projectId) {
            taskWhere.projectId = projectId;
          }

          if (req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
            taskWhere.OR = [
              ...(taskWhere.OR as Record<string, unknown>[]),
              { assigneeId: userId },
              { project: { ownerId: userId } },
              { project: { members: { some: { userId } } } },
            ];
          }

          results.tasks = await prisma.task.findMany({
            where: taskWhere,
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              priority: true,
              dueDate: true,
              updatedAt: true,
              project: { select: { id: true, name: true } },
              assignee: { select: { id: true, name: true, avatar: true } },
            },
            take: limit,
            orderBy: { updatedAt: 'desc' },
          });
        })()
      );
    }

    if (typesToSearch.includes('notes')) {
      promises.push(
        (async () => {
          const noteWhere: Record<string, unknown> = {
            OR: [
              { title: searchFilter },
              { content: searchFilter },
            ],
          };

          if (projectId) {
            noteWhere.projectId = projectId;
          }

          if (req.user!.role !== 'ADMIN' && req.user!.role !== 'OWNER') {
            noteWhere.userId = userId;
          }

          results.notes = await prisma.note.findMany({
            where: noteWhere,
            select: {
              id: true,
              title: true,
              content: true,
              tags: true,
              updatedAt: true,
              user: { select: { id: true, name: true, avatar: true } },
              project: { select: { id: true, name: true } },
            },
            take: limit,
            orderBy: { updatedAt: 'desc' },
          });
        })()
      );
    }

    if (typesToSearch.includes('documents')) {
      promises.push(
        (async () => {
          const docWhere: Record<string, unknown> = {
            OR: [
              { title: searchFilter },
              { content: searchFilter },
            ],
          };

          if (projectId) {
            docWhere.projectId = projectId;
          }

          results.documents = await prisma.document.findMany({
            where: docWhere,
            select: {
              id: true,
              title: true,
              version: true,
              updatedAt: true,
              owner: { select: { id: true, name: true, avatar: true } },
              project: { select: { id: true, name: true } },
              _count: { select: { collaborators: true } },
            },
            take: limit,
            orderBy: { updatedAt: 'desc' },
          });
        })()
      );
    }

    if (typesToSearch.includes('files')) {
      promises.push(
        (async () => {
          const fileWhere: Record<string, unknown> = {
            OR: [
              { name: searchFilter },
              { originalName: searchFilter },
            ],
          };

          if (projectId) {
            fileWhere.projectId = projectId;
          }

          results.files = await prisma.file.findMany({
            where: fileWhere,
            select: {
              id: true,
              name: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              createdAt: true,
              uploadedBy: { select: { id: true, name: true, avatar: true } },
              project: { select: { id: true, name: true } },
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
          });
        })()
      );
    }

    await Promise.all(promises);

    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    res.json({
      data: results,
      meta: {
        query: searchTerm,
        totalResults,
        types: Object.keys(results).filter((k) => results[k].length > 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as searchRouter };
