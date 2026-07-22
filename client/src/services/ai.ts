import { api } from '../lib/api';

export const aiService = {
  chat: (message: string, context?: string) => api.post('/ai/chat', { message, context }).then(r => r.data),
  generateTasks: (description: string) => api.post('/ai/generate/tasks', { description }).then(r => r.data),
  summarize: (content: string) => api.post('/ai/summarize', { content }).then(r => r.data),
  reviewCode: (code: string, language?: string) => api.post('/ai/review/code', { code, language }).then(r => r.data),
  generateDocs: (description: string) => api.post('/ai/generate/docs', { description }).then(r => r.data),
  generateEmail: (prompt: string, tone?: string) => api.post('/ai/generate/email', { prompt, tone }).then(r => r.data),
  generatePlan: (description: string) => api.post('/ai/plan/project', { description }).then(r => r.data),
};
