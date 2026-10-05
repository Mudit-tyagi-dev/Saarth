/**
 * SAARTH Dashboard Service
 * Real-time analytics, KPIs, chart data & insights from backend API
 */
import apiClient from './api';

export async function getDashboardData(vehicleId) {
  if (!vehicleId) return null;
  const response = await apiClient.get(`/dashboard/${vehicleId}`);
  return response.data.data;
}
