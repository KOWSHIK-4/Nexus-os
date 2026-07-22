import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects';
import { tasksService } from '../services/tasks';
import { notificationsService } from '../services/notifications';
import { aiService } from '../services/ai';
import { api } from '../lib/api';

export function useProjects(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsService.list(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof projectsService.create>[0]) => projectsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof projectsService.update>[1]) => projectsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); qc.invalidateQueries({ queryKey: ['project', id] }); },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useTasks(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => tasksService.list(params),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof tasksService.create>[0]) => tasksService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof tasksService.update>[1]) => tasksService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); qc.invalidateQueries({ queryKey: ['task', id] }); },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useNotifications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsService.list(params),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useAIChat() {
  return useMutation({
    mutationFn: ({ message, context }: { message: string; context?: string }) => aiService.chat(message, context),
  });
}

export function useAnalytics(type: 'dashboard' | 'projects' | 'tasks' | 'team') {
  return useQuery({
    queryKey: ['analytics', type],
    queryFn: () => api.get(`/analytics/${type}`).then(r => r.data),
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => api.get('/teams').then(r => r.data),
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data),
  });
}

export function useCalendarEvents(params?: { start?: string; end?: string; projectId?: string }) {
  return useQuery({
    queryKey: ['calendar-events', params],
    queryFn: () => api.get('/calendar/events', { params }).then(r => r.data),
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.get('/search', { params: { q: query } }).then(r => r.data),
    enabled: query.length > 0,
  });
}
