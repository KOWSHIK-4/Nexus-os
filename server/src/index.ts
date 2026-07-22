import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { projectsRouter } from './routes/projects';
import { tasksRouter } from './routes/tasks';
import { kanbanRouter } from './routes/kanban';
import { notesRouter } from './routes/notes';
import { documentsRouter } from './routes/documents';
import { filesRouter } from './routes/files';
import { chatRouter } from './routes/chat';
import { teamsRouter } from './routes/teams';
import { notificationsRouter } from './routes/notifications';
import { analyticsRouter } from './routes/analytics';
import { calendarRouter } from './routes/calendar';
import { aiRouter } from './routes/ai';
import { searchRouter } from './routes/search';
import { settingsRouter } from './routes/settings';
import { adminRouter } from './routes/admin';
import { workspaceRouter } from './routes/workspace';
import { organizationsRouter } from './routes/organizations';
import { setupSocketHandlers } from './sockets';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.cors.origin,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/kanban', kanbanRouter);
app.use('/api/notes', notesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/files', filesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/ai', aiRouter);
app.use('/api/search', searchRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/organizations', organizationsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

setupSocketHandlers(io);

server.listen(config.port, () => {
  logger.info(`Nexus OS server running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export { app, server, io };
