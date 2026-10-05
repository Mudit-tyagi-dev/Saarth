/**
 * SAARTH Fuel Service
 * Real PostgreSQL CRUD & calculations via backend API
 */
import apiClient from './api';

export async function getFuelEvents(vehicleId) {
  if (!vehicleId) return [];
  const response = await apiClient.get(`/vehicles/${vehicleId}/fuel-events`);
  return response.data.data;
}

export async function getFuelEventById(id) {
  const response = await apiClient.get(`/fuel-events/${id}`);
  return response.data.data;
}

export async function createFuelEvent(data) {
  const response = await apiClient.post('/fuel-events', data);
  return response.data.data;
}

export async function updateFuelEvent(id, data) {
  const response = await apiClient.put(`/fuel-events/${id}`, data);
  return response.data.data;
}

export async function deleteFuelEvent(id) {
  const response = await apiClient.delete(`/fuel-events/${id}`);
  return response.data;
}
