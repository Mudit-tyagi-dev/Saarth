/**
 * SAARTH Auth Service
 * Real PostgreSQL + JWT Authentication
 */
import apiClient from './api';

export async function signup(userData) {
  const response = await apiClient.post('/auth/signup', userData);
  const { user, token } = response.data.data;
  if (token) {
    localStorage.setItem('saarth_token', token);
    localStorage.setItem('saarth_user', JSON.stringify(user));
  }
  return response.data.data;
}

export async function login(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  const { user, token } = response.data.data;
  if (token) {
    localStorage.setItem('saarth_token', token);
    localStorage.setItem('saarth_user', JSON.stringify(user));
  }
  return response.data.data;
}

export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return response.data.data;
}

export function logout() {
  localStorage.removeItem('saarth_token');
  localStorage.removeItem('saarth_user');
}
