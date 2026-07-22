import { prisma } from '../utils/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { Prisma } from '@prisma/client';

const projectInclude = {
  _count: { select: { tasks: true, members: true } },
  owner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
} satisfies Prisma.ProjectInclude;

export async function listProjects(userId: string, organizationId?: string | null) {
  const where: Prisma.ProjectWhereInput = {
    OR: [
      { ownerId: userId },
      { members: { some: { userId } } },
    ],
  };
  if (organizationId) where.organizationId = organizationId;

  return prisma.project.findMany({
    where,
    include: projectInclude,
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProject(projectId: string, _userId?: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      ...projectInclude,
      tasks: {
        select: { status: true },
        where: { status: { not: 'CANCELLED' } },
      },
    },
  });

  if (!project) throw new NotFoundError('Project');
  return project;
}

export async function createProject(data: {
  name: string;
  description?: string;
  key: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  color?: string;
  icon?: string;
  ownerId: string;
  organizationId?: string;
}) {
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      key: data.key,
      status: (data.status as 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED') || 'PLANNING',
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      color: data.color || '#6366f1',
      icon: data.icon,
      ownerId: data.ownerId,
      organizationId: data.organizationId,
    },
    include: projectInclude,
  });

  await prisma.projectMember.create({
    data: { projectId: project.id, userId: data.ownerId, role: 'ADMIN' },
  });

  return project;
}

export async function updateProject(projectId: string, userId: string, data: {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  color?: string;
  icon?: string;
}) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
  if (!project) throw new NotFoundError('Project');
  if (project.ownerId !== userId) throw new ForbiddenError('Only the project owner can update the project');

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.icon !== undefined) updateData.icon = data.icon;

  return prisma.project.update({
    where: { id: projectId },
    data: updateData,
    include: projectInclude,
  });
}

export async function deleteProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
  if (!project) throw new NotFoundError('Project');
  if (project.ownerId !== userId) throw new ForbiddenError('Only the project owner can delete the project');

  await prisma.project.delete({ where: { id: projectId } });
}

export async function addMember(projectId: string, userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER' = 'MEMBER') {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project');

  return prisma.projectMember.create({
    data: { projectId, userId, role },
    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } } },
  });
}

export async function removeMember(projectId: string, memberId: string) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: memberId } },
  });
  if (!member) throw new NotFoundError('Project member');

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: memberId } },
  });
}
