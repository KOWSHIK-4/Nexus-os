import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { AppError } from '../utils/errors';

const router = Router();

router.use(authenticate);

async function callAI(prompt: string, systemPrompt: string = ''): Promise<string> {
  if (!config.openai.apiKey) {
    throw new AppError('AI service is not configured', 503, 'AI_NOT_CONFIGURED');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new AppError(`AI service error: ${error}`, 502, 'AI_ERROR');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400, 'VALIDATION_ERROR');
    }

    let systemPrompt = 'You are Nexus AI, an intelligent assistant for the Nexus OS project management platform. You help users with project management, task organization, and productivity. Be concise and helpful.';
    if (context) {
      systemPrompt += `\n\nContext:\n${JSON.stringify(context, null, 2)}`;
    }

    const reply = await callAI(message, systemPrompt);

    res.json({ data: { reply } });
  } catch (error) {
    next(error);
  }
});

router.post('/generate/tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, projectId } = req.body;

    if (!description) {
      throw new AppError('Description is required', 400, 'VALIDATION_ERROR');
    }

    const systemPrompt = `You are a project management assistant. Based on the given description, generate a list of tasks with title, description, priority (LOW/MEDIUM/HIGH/URGENT), and estimatedHours. Return the response as a valid JSON array of objects with keys: title, description, priority, estimatedHours.`;

    const result = await callAI(description, systemPrompt);

    let tasks: Array<{ title: string; description: string; priority: string; estimatedHours: number }> = [];
    try {
      const cleaned = result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      tasks = JSON.parse(cleaned);
    } catch {
      throw new AppError('Failed to parse AI response into tasks', 500, 'AI_PARSE_ERROR');
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new AppError('AI returned no tasks', 500, 'AI_NO_RESULTS');
    }

    const created = [];
    for (const task of tasks) {
      const createdTask = await prisma.task.create({
        data: {
          title: task.title,
          description: task.description || '',
          priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(task.priority) ? task.priority : 'MEDIUM',
          projectId: projectId || null,
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

    if (!content) {
      throw new AppError('Content is required', 400, 'VALIDATION_ERROR');
    }

    const systemPrompt = `Summarize the following content in a clear and concise manner${maxLength ? ` (max ${maxLength} words)` : ''}. Focus on the key points and maintain the original meaning.`;

    const summary = await callAI(content, systemPrompt);

    res.json({ data: { summary, originalLength: content.length, summaryLength: summary.length } });
  } catch (error) {
    next(error);
  }
});

router.post('/review/code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      throw new AppError('Code is required', 400, 'VALIDATION_ERROR');
    }

    const systemPrompt = `You are an expert code reviewer${language ? ` specializing in ${language}` : ''}. Review the following code and provide feedback on:
1. Potential bugs and issues
2. Code quality and best practices
3. Performance considerations
4. Security concerns
5. Suggestions for improvement

Format your response with clear sections.`;

    const review = await callAI(code, systemPrompt);

    res.json({ data: { review, language: language || 'unknown' } });
  } catch (error) {
    next(error);
  }
});

router.post('/generate/docs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, type, context } = req.body;

    if (!title || !description) {
      throw new AppError('Title and description are required', 400, 'VALIDATION_ERROR');
    }

    const systemPrompt = `You are a technical documentation writer. Generate comprehensive ${type || 'technical'} documentation based on the given title and description.
Include an overview, detailed sections, code examples if applicable, and a summary.
Format the output in markdown.`;

    const prompt = `Title: ${title}\n\nDescription: ${description}\n\n${context ? `Additional Context: ${JSON.stringify(context)}\n\n` : ''}Please generate the documentation.`;

    const documentation = await callAI(prompt, systemPrompt);

    res.json({ data: { title, documentation, type: type || 'technical' } });
  } catch (error) {
    next(error);
  }
});

router.post('/generate/email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, context, recipients, tone } = req.body;

    if (!subject || !context) {
      throw new AppError('Subject and context are required', 400, 'VALIDATION_ERROR');
    }

    const systemPrompt = `You are an email writing assistant. Generate a professional email with the given subject and context.
Tone: ${tone || 'professional'}
${recipients ? `Recipients: ${recipients}` : ''}

Include a clear subject line, appropriate greeting, body, and closing signature.`;

    const emailContent = await callAI(subject, systemPrompt);

    res.json({ data: { subject, body: emailContent } });
  } catch (error) {
    next(error);
  }
});

router.post('/plan/project', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, goals, timeline } = req.body;

    if (!name || !description) {
      throw new AppError('Project name and description are required', 400, 'VALIDATION_ERROR');
    }

    const systemPrompt = `You are a project planning expert. Generate a comprehensive project plan based on the given information.
Include:
1. Executive summary
2. Project goals and objectives
3. Scope and deliverables
4. Timeline and milestones${timeline ? ` (target: ${timeline})` : ''}
5. Resource requirements
6. Risk assessment
7. Task breakdown with phases

Format the output in markdown with clear sections. The tasks should also be returned as a JSON array at the end of the document, enclosed in ---TASKS_START--- and ---TASKS_END--- markers. Each task should have title, description, priority, and estimatedHours.`;

    const prompt = `Project Name: ${name}\n\nDescription: ${description}\n\n${goals ? `Goals: ${JSON.stringify(goals)}\n\n` : ''}${timeline ? `Timeline: ${timeline}\n\n` : ''}Please generate the project plan.`;

    const plan = await callAI(prompt, systemPrompt);

    let tasks: Array<{ title: string; description: string; priority: string; estimatedHours: number }> = [];
    const tasksMatch = plan.match(/---TASKS_START---\s*([\s\S]*?)\s*---TASKS_END---/);
    if (tasksMatch) {
      try {
        tasks = JSON.parse(tasksMatch[1].trim());
      } catch {
      }
    }

    res.json({ data: { plan, tasks } });
  } catch (error) {
    next(error);
  }
});

export default router;
export { router as aiRouter };
