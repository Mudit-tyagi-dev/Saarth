/**
 * SAARTH Vehicle Service
 * Real PostgreSQL CRUD via backend API
 */
import apiClient from './api';

export async function getVehicles() {
  const response = await apiClient.get('/vehicles');
  return response.data.data;
}

export async function getVehicleById(id) {
  const response = await apiClient.get(`/vehicles/${id}`);
  return response.data.data;
}

export async function createVehicle(data) {
  const response = await apiClient.post('/vehicles', data);
  return response.data.data;
}

export async function updateVehicle(id, data) {
  const response = await apiClient.put(`/vehicles/${id}`, data);
  return response.data.data;
}

export async function deleteVehicle(id) {
  const response = await apiClient.delete(`/vehicles/${id}`);
  return response.data;
}
