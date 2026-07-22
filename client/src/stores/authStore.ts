import { create } from 'zustand';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  title?: string;
  organizationId?: string;
  preferences?: Record<string, unknown>;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

function extractErrorMessage(error: unknown): string | null {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { data?: { error?: { message?: string } } } };
    return err.response?.data?.error?.message || null;
  }
  if (error instanceof Error) return error.message;
  return null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data } = await api.get('/auth/me');
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ error: null, isLoading: true });
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.data.accessToken);
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const message = extractErrorMessage(error) || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (registerData) => {
    try {
      set({ error: null, isLoading: true });
      const { data } = await api.post('/auth/register', registerData);
      localStorage.setItem('accessToken', data.data.accessToken);
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const message = extractErrorMessage(error) || 'Registration failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await api.put('/auth/me', profileData);
      set({ user: { ...get().user!, ...data.data } });
    } catch (error: unknown) {
      const message = extractErrorMessage(error) || 'Update failed';
      set({ error: message });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
