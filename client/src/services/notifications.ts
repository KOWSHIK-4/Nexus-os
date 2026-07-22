import { api } from '../lib/api';
export const notificationsService = {
  list: (params?: Record<string, unknown>) => api.get('/notifications', { params }).then(r => r.data),
  markRead: (id: string) => api.put(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => api.put('/notifications/read-all').then(r => r.data),
};
