/**
 * SAARTH Maintenance Service
 * Real PostgreSQL maintenance tracking via backend API
 */
import apiClient from './api';

export async function getMaintenanceRecords(vehicleId) {
  if (!vehicleId) return [];
  const response = await apiClient.get(`/vehicles/${vehicleId}/maintenance`);
  return response.data.data;
}

export async function createMaintenance(data) {
  const response = await apiClient.post('/maintenance', data);
  return response.data.data;
}

export async function updateMaintenance(id, data) {
  const response = await apiClient.put(`/maintenance/${id}`, data);
  return response.data.data;
}

export async function deleteMaintenance(id) {
  const response = await apiClient.delete(`/maintenance/${id}`);
  return response.data;
}
