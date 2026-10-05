/**
 * Vehicle store — manages vehicles and selected vehicle
 */
import { create } from 'zustand';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/vehicle.service';

export const useVehicleStore = create((set, get) => ({
  vehicles: [],
  selectedVehicleId: null,
  isLoading: false,
  error: null,

  get selectedVehicle() {
    const { vehicles, selectedVehicleId } = get();
    if (!vehicles || vehicles.length === 0) return null;
    return vehicles.find((v) => String(v.id) === String(selectedVehicleId)) || vehicles[0] || null;
  },

  fetchVehicles: async () => {
    set({ isLoading: true, error: null });
    try {
      const vehicles = await getVehicles();
      const currentSelectedId = get().selectedVehicleId;
      const validCurrent = vehicles.some((v) => String(v.id) === String(currentSelectedId));
      
      set({
        vehicles,
        isLoading: false,
        selectedVehicleId: validCurrent
          ? currentSelectedId
          : vehicles.length > 0
          ? vehicles[0].id
          : null,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load vehicles.';
      set({ isLoading: false, error: msg });
    }
  },

  addVehicle: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const vehicle = await createVehicle(data);
      set((state) => ({
        vehicles: [vehicle, ...state.vehicles],
        selectedVehicleId: vehicle.id,
        isLoading: false,
      }));
      return { success: true, vehicle };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add vehicle.';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  selectVehicle: (id) => set({ selectedVehicleId: id }),

  updateVehicle: async (id, data) => {
    try {
      const updated = await updateVehicle(id, data);
      set((state) => ({
        vehicles: state.vehicles.map((v) => (String(v.id) === String(id) ? { ...v, ...updated } : v)),
      }));
      return { success: true, vehicle: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Update failed' };
    }
  },

  removeVehicle: async (id) => {
    try {
      await deleteVehicle(id);
      set((state) => {
        const vehicles = state.vehicles.filter((v) => String(v.id) !== String(id));
        return {
          vehicles,
          selectedVehicleId:
            String(state.selectedVehicleId) === String(id) ? vehicles[0]?.id || null : state.selectedVehicleId,
        };
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Delete failed' };
    }
  },
}));
