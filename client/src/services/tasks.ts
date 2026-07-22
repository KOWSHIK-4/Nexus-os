import { api } from '../lib/api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  storyPoints?: number;
  dueDate?: string;
  estimatedHours?: number;
  loggedHours?: number;
  order: number;
  tags: string[];
  projectId: string;
  project?: { id: string; name: string; color?: string };
  assigneeId?: string;
  assignee?: { id: string; firstName: string; lastName: string; avatar?: string };
  reporterId: string;
  reporter?: { id: string; firstName: string; lastName: string; avatar?: string };
  boardColumnId?: string;
  comments?: Array<{ id: string; content: string; createdAt: string; user: { id: string; firstName: string; lastName: string; avatar?: string } }>;
  createdAt: string;
}

export const tasksService = {
  list: (params?: Record<string, unknown>) => api.get('/tasks', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/tasks/${id}`).then(r => r.data),
  create: (data: Partial<Task>) => api.post('/tasks', data).then(r => r.data),
  update: (id: string, data: Partial<Task>) => api.put(`/tasks/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/tasks/${id}`).then(r => r.data),
  updateStatus: (id: string, status: string) => api.put(`/tasks/${id}/status`, { status }).then(r => r.data),
  assign: (id: string, assigneeId: string) => api.put(`/tasks/${id}/assign`, { assigneeId }).then(r => r.data),
  addComment: (id: string, content: string, parentId?: string) => api.post(`/tasks/${id}/comments`, { content, parentId }).then(r => r.data),
};
