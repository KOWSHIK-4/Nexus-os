import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export const setupSocketHandlers = (io: SocketIOServer): void => {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token as string;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; email: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.userEmail = user.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    logger.info(`User connected: ${socket.userEmail} (${userId})`);

    socket.join(`user:${userId}`);

    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('join:channel', (channelId: string) => {
      socket.join(`channel:${channelId}`);
    });

    socket.on('leave:channel', (channelId: string) => {
      socket.leave(`channel:${channelId}`);
    });

    socket.on('message:send', async (data: { channelId: string; content: string; parentId?: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            content: data.content,
            channelId: data.channelId,
            senderId: userId,
            parentId: data.parentId,
          },
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        });

        io.to(`channel:${data.channelId}`).emit('message:new', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('task:update', async (data: { taskId: string; updates: Record<string, unknown> }) => {
      try {
        const task = await prisma.task.update({
          where: { id: data.taskId },
          data: data.updates,
          include: {
            assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            reporter: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        });

        const projectMembers = await prisma.projectMember.findMany({
          where: { projectId: task.projectId },
          select: { userId: true },
        });

        projectMembers.forEach((member) => {
          io.to(`user:${member.userId}`).emit('task:updated', task);
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to update task' });
      }
    });

    socket.on('notification:send', async (data: { userId: string; title: string; message: string; type: string }) => {
      try {
        const notification = await prisma.notification.create({
          data: {
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type as any,
          },
        });

        io.to(`user:${data.userId}`).emit('notification:new', notification);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send notification' });
      }
    });

    socket.on('typing:start', (data: { channelId: string }) => {
      socket.to(`channel:${data.channelId}`).emit('typing:update', {
        userId,
        email: socket.userEmail,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data: { channelId: string }) => {
      socket.to(`channel:${data.channelId}`).emit('typing:update', {
        userId,
        email: socket.userEmail,
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userEmail} (${userId})`);
    });
  });
};
