import { config } from '../config';
import { AppError } from '../utils/errors';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface GeneratedTask {
  title: string;
  description: string;
  priority: Priority;
  estimatedHours: number;
}

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

  const data: { choices?: Array<{ message?: { content?: string } }> } = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function parseJSONArray<T>(raw: string): T[] {
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

function extractTasksFromPlan(plan: string): GeneratedTask[] {
  const match = plan.match(/---TASKS_START---\s*([\s\S]*?)\s*---TASKS_END---/);
  if (!match) return [];
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return [];
  }
}

export async function chat(message: string, context?: Record<string, unknown>): Promise<string> {
  let systemPrompt = 'You are Nexus AI, an intelligent assistant for the Nexus OS project management platform. You help users with project management, task organization, and productivity. Be concise and helpful.';
  if (context) {
    systemPrompt += `\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  }
  return callAI(message, systemPrompt);
}

export async function generateTasks(description: string): Promise<GeneratedTask[]> {
  const systemPrompt = `You are a project management assistant. Based on the given description, generate a list of tasks with title, description, priority (LOW/MEDIUM/HIGH/URGENT), and estimatedHours. Return the response as a valid JSON array of objects with keys: title, description, priority, estimatedHours.`;
  const result = await callAI(description, systemPrompt);
  const tasks = parseJSONArray<GeneratedTask>(result);
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new AppError('AI returned no tasks', 500, 'AI_NO_RESULTS');
  }
  return tasks;
}

export async function summarize(content: string, maxLength?: number): Promise<{ summary: string; originalLength: number; summaryLength: number }> {
  const systemPrompt = `Summarize the following content in a clear and concise manner${maxLength ? ` (max ${maxLength} words)` : ''}. Focus on the key points and maintain the original meaning.`;
  const summary = await callAI(content, systemPrompt);
  return { summary, originalLength: content.length, summaryLength: summary.length };
}

export async function reviewCode(code: string, language?: string): Promise<{ review: string; language: string }> {
  const systemPrompt = `You are an expert code reviewer${language ? ` specializing in ${language}` : ''}. Review the following code and provide feedback on:
1. Potential bugs and issues
2. Code quality and best practices
3. Performance considerations
4. Security concerns
5. Suggestions for improvement

Format your response with clear sections.`;
  const review = await callAI(code, systemPrompt);
  return { review, language: language || 'unknown' };
}

export async function generateDocs(title: string, description: string, type?: string, context?: Record<string, unknown>): Promise<{ title: string; documentation: string; type: string }> {
  const systemPrompt = `You are a technical documentation writer. Generate comprehensive ${type || 'technical'} documentation based on the given title and description.
Include an overview, detailed sections, code examples if applicable, and a summary.
Format the output in markdown.`;
  const prompt = `Title: ${title}\n\nDescription: ${description}\n\n${context ? `Additional Context: ${JSON.stringify(context)}\n\n` : ''}Please generate the documentation.`;
  const documentation = await callAI(prompt, systemPrompt);
  return { title, documentation, type: type || 'technical' };
}

export async function generateEmail(subject: string, context: string, recipients?: string, tone?: string): Promise<{ subject: string; body: string }> {
  const systemPrompt = `You are an email writing assistant. Generate a professional email with the given subject and context.
Tone: ${tone || 'professional'}
${recipients ? `Recipients: ${recipients}` : ''}

Include a clear subject line, appropriate greeting, body, and closing signature.`;
  const emailContent = await callAI(subject, systemPrompt);
  return { subject, body: emailContent };
}

export async function planProject(name: string, description: string, goals?: string[], timeline?: string): Promise<{ plan: string; tasks: GeneratedTask[] }> {
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
  const tasks = extractTasksFromPlan(plan);
  return { plan, tasks };
}
