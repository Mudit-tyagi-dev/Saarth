/**
 * SAARTH Notification Service
 * In-app notifications & alert status
 */
import apiClient from './api';

export async function getNotifications() {
  const response = await apiClient.get('/notifications');
  return response.data.data;
}

export async function markNotificationRead(id) {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data.data;
}
