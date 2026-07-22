import { api } from '../lib/api';
export const chatService = {
  getChannels: () => api.get('/chat/channels').then(r => r.data),
  createChannel: (data: { name: string; isPrivate?: boolean }) => api.post('/chat/channels', data).then(r => r.data),
  getMessages: (channelId: string, params?: Record<string, unknown>) => api.get(`/chat/messages/${channelId}`, { params }).then(r => r.data),
  sendMessage: (data: { channelId: string; content: string; parentId?: string }) => api.post('/chat/messages', data).then(r => r.data),
  deleteMessage: (id: string) => api.delete(`/chat/messages/${id}`).then(r => r.data),
};
