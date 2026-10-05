/**
 * Auth store — manages authenticated session with PostgreSQL backend
 */
import { create } from 'zustand';
import * as authService from '../services/auth.service';

const AUTH_USER_KEY = 'saarth_user';
const AUTH_TOKEN_KEY = 'saarth_token';

function loadPersistedUser() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (!token || !stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export const useAuthStore = create((set, get) => ({
  user: loadPersistedUser(),
  isAuthenticated: !!localStorage.getItem(AUTH_TOKEN_KEY),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login({ email, password });
      set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.signup({ name, email, password });
      set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    try {
      const user = await authService.getMe();
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err) {
      authService.logout();
      set({ user: null, isAuthenticated: false });
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateProfile: (data) => {
    const updated = { ...get().user, ...data };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    set({ user: updated });
  },
}));
