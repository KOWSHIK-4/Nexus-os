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
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    if (!query || query.trim().length === 0) {
      throw new AppError('Search query is required', 400, 'VALIDATION_ERROR');
    }

    const searchTerm = query.trim();
    const userId = req.user!.userId;
    const searchFilter = { contains: searchTerm, mode: 'insensitive' as const };
    const results: Record<string, unknown[]> = {};

    const allowedTypes = ['projects', 'tasks', 'notes', 'documents', 'files'];
    const typesToSearch = type
      ? type.split(',').filter((t) => allowedTypes.includes(t))
      : allowedTypes;

    const promises: Promise<void>[] = [];

    if (typesToSearch.includes('projects')) {
      promises.push(
        (async () => {
          results.projects = await prisma.project.findMany({
            where: {
              OR: [
                { name: searchFilter },
                { description: searchFilter },
                { ownerId: userId },
                { members: { some: { userId } } },
              ],
            },
            select: {
              id: true, name: true, description: true, status: true, updatedAt: true,
              owner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
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
          results.tasks = await prisma.task.findMany({
            where: {
              OR: [
                { title: searchFilter },
                { description: searchFilter },
              ],
              ...(req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN'
                ? { OR: [{ assigneeId: userId }, { project: { ownerId: userId } }, { project: { members: { some: { userId } } } }] }
                : {}),
            },
            select: {
              id: true, title: true, description: true, status: true, priority: true,
              dueDate: true, updatedAt: true,
              project: { select: { id: true, name: true } },
              assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
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
          results.notes = await prisma.note.findMany({
            where: {
              userId: req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN' ? undefined : userId,
              OR: [{ title: searchFilter }, { content: searchFilter }],
            },
            select: { id: true, title: true, content: true, tags: true, color: true, updatedAt: true },
            take: limit,
            orderBy: { updatedAt: 'desc' },
          });
        })()
      );
    }

    if (typesToSearch.includes('documents')) {
      promises.push(
        (async () => {
          results.documents = await prisma.document.findMany({
            where: {
              OR: [{ title: searchFilter }, { content: searchFilter }],
            },
            select: { id: true, title: true, icon: true, version: true, updatedAt: true },
            take: limit,
            orderBy: { updatedAt: 'desc' },
          });
        })()
      );
    }

    if (typesToSearch.includes('files')) {
      promises.push(
        (async () => {
          results.files = await prisma.file.findMany({
            where: {
              OR: [{ name: searchFilter }, { originalName: searchFilter }],
            },
            select: { id: true, name: true, originalName: true, mimeType: true, size: true, url: true, createdAt: true },
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
      meta: { query: searchTerm, totalResults, types: Object.keys(results).filter((k) => results[k].length > 0) },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as searchRouter };