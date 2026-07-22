import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { aiService } from '../services';

const router = Router();

router.use(authenticate);

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, context } = req.body;
    if (!message) throw new AppError('Message is required', 400, 'VALIDATION_ERROR');
    const reply = await aiService.chat(message, context);
    res.json({ data: { reply } });
  } catch (error) {
    next(error);
  }
});

router.post('/generate/tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, projectId } = req.body;
    if (!description) throw new AppError('Description is required', 400, 'VALIDATION_ERROR');

    const tasks = await aiService.generateTasks(description);
    const created = [];
    for (const task of tasks) {
      const createdTask = await prisma.task.create({
        data: {
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          reporterId: req.user!.userId,
          projectId: projectId ? (projectId as string) : null,
        },
      });
      created.push(createdTask);
    }

    res.status(201).json({ data: { tasks: created, count: created.length } });
  } catch (error) {
    next(error);
  }
});

router.post('/summarize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, maxLength } = req.body;
    if (!content) throw new AppError('Content is required', 400, 'VALIDATION_ERROR');
    const result = await aiService.summarize(content, maxLength);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/review/code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, language } = req.body;
    if (!code) throw new AppError('Code is required', 400, 'VALIDATION_ERROR');
    const result = await aiService.reviewCode(code, language);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/generate/docs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, type, context } = req.body;
    if (!title || !description) throw new AppError('Title and description are required', 400, 'VALIDATION_ERROR');
    const result = await aiService.generateDocs(title, description, type, context);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/generate/email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, context, recipients, tone } = req.body;
    if (!subject || !context) throw new AppError('Subject and context are required', 400, 'VALIDATION_ERROR');
    const result = await aiService.generateEmail(subject, context, recipients, tone);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/plan/project', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, goals, timeline } = req.body;
    if (!name || !description) throw new AppError('Project name and description are required', 400, 'VALIDATION_ERROR');
    const result = await aiService.planProject(name, description, goals, timeline);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as aiRouter };
