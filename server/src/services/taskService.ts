import { prisma } from '../utils/prisma';
import { NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

const taskInclude = {
  project: { select: { id: true, name: true, key: true, color: true } },
  assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
  reporter: { select: { id: true, firstName: true, lastName: true, avatar: true } },
  labels: true,
  _count: { select: { comments: true } },
} as const;

export async function listTasks(params: {
  userId: string;
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {};

  if (params.projectId) where.projectId = params.projectId;
  if (params.status) where.status = params.status;
  if (params.priority) where.priority = params.priority;
  if (params.assigneeId) where.assigneeId = params.assigneeId;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  return prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      ...taskInclude,
      comments: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          replies: {
            include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!task) throw new NotFoundError('Task');
  return task;
}

export async function createTask(data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  assigneeId?: string;
  reporterId: string;
  parentId?: string;
  boardColumnId?: string;
  dueDate?: string;
  storyPoints?: number;
  estimatedHours?: number;
  tags?: string[];
}) {
  const taskData: Prisma.TaskUncheckedCreateInput = {
    title: data.title,
    description: data.description || '',
    reporterId: data.reporterId,
    projectId: data.projectId || null,
  };

  if (data.status) taskData.status = data.status as 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  if (data.priority) taskData.priority = data.priority as 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  if (data.assigneeId) taskData.assigneeId = data.assigneeId;
  if (data.parentId) taskData.parentId = data.parentId;
  if (data.boardColumnId) taskData.boardColumnId = data.boardColumnId;
  if (data.dueDate) taskData.dueDate = new Date(data.dueDate);
  if (data.storyPoints !== undefined) taskData.storyPoints = data.storyPoints;
  if (data.estimatedHours !== undefined) taskData.estimatedHours = data.estimatedHours;
  if (data.tags) taskData.tags = data.tags;

  return prisma.task.create({
    data: taskData,
    include: taskInclude,
  });
}

export async function updateTask(taskId: string, data: Record<string, unknown>) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task');

  if (data.dueDate) data.dueDate = new Date(data.dueDate as string);

  return prisma.task.update({
    where: { id: taskId },
    data,
    include: taskInclude,
  });
}

export async function deleteTask(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task');

  await prisma.task.delete({ where: { id: taskId } });
}

export async function addComment(taskId: string, userId: string, content: string, parentId?: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task');

  return prisma.comment.create({
    data: { content, taskId, userId, parentId },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
}
