import { api } from '../lib/api';

export interface Project {
  id: string;
  name: string;
  description?: string;
  key: string;
  status: string;
  priority: string;
  color?: string;
  icon?: string;
  startDate?: string;
  endDate?: string;
  ownerId: string;
  owner?: { id: string; firstName: string; lastName: string; avatar?: string };
  members?: Array<{ id: string; userId: string; role: string; user: { id: string; firstName: string; lastName: string; avatar?: string } }>;
  _count?: { tasks: number; members: number };
  createdAt: string;
}

export const projectsService = {
  list: (params?: Record<string, unknown>) => api.get('/projects', { params }).then(r => r.data),
  getById: (id: string) => api.get(`/projects/${id}`).then(r => r.data),
  create: (data: Partial<Project>) => api.post('/projects', data).then(r => r.data),
  update: (id: string, data: Partial<Project>) => api.put(`/projects/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/projects/${id}`).then(r => r.data),
  addMember: (id: string, userId: string, role?: string) => api.post(`/projects/${id}/members`, { userId, role }).then(r => r.data),
  removeMember: (id: string, userId: string) => api.delete(`/projects/${id}/members/${userId}`).then(r => r.data),
};
