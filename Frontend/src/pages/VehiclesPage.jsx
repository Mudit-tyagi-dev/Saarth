/**
 * Vehicles Page — Garage Overview
 * List of registered vehicles with telemetry summary and quick actions
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Bike, Plus, ChevronRight, Gauge, Fuel } from 'lucide-react';
import { useVehicleStore } from '../store/vehicleStore';
import {
  EmptyState,
  LoadingSkeleton,
  PageHeader,
  Button,
  Badge,
  GlassCard,
} from '../components/ui';
import { formatOdometer } from '../lib/utils';

function VehicleDetailCard({ vehicle, onClick, onAddFuel }) {
  const isBike = vehicle.vehicleType === 'Bike' || vehicle.type === 'Bike';
  const VehicleIcon = isBike ? Bike : Car;
  const fuelBadge = {
    Petrol: 'teal',
    Diesel: 'orange',
    CNG: 'green',
  }[vehicle.fuelType] || 'default';

  return (
    <GlassCard
      onClick={onClick}
      hover={true}
      className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="w-13 h-13 rounded-2xl bg-teal-500/10 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 font-bold shadow-2xs">
          <VehicleIcon size={26} />
        </div>

        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              {vehicle.name}
            </h3>
            <Badge variant={fuelBadge}>{vehicle.fuelType}</Badge>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {vehicle.vehicleType || vehicle.type}
            </span>
          </div>

          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {vehicle.registrationNumber || vehicle.vehicleNumber}
            </span>
            {vehicle.model && ` • ${vehicle.model}`}
            {vehicle.year && ` (${vehicle.year})`}
          </div>

          <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold">
              <Gauge size={14} className="text-teal-600 dark:text-teal-400" />
              <span>
                {Number(vehicle.currentOdometer || vehicle.odometer || 0).toLocaleString('en-IN')} km
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddFuel();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <Fuel size={13} />
          <span>Refill</span>
        </button>

        <div className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition">
          <ChevronRight size={18} />
        </div>
      </div>
    </GlassCard>
  );
}

export default function VehiclesPage() {
  const navigate = useNavigate();
  const { vehicles, isLoading, fetchVehicles, selectVehicle } = useVehicleStore();

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Garage"
        description="Manage your registered vehicles and telemetry logs"
        action={
          <Button icon={Plus} onClick={() => navigate('/vehicles/add')} size="md">
            Add Vehicle
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSkeleton rows={3} height={90} />
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Your garage is empty"
          description="Add your first car or bike to start computing accurate fuel mileage and running expenses."
          action={() => navigate('/vehicles/add')}
          actionLabel="Add Vehicle"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {vehicles.map((v) => (
            <VehicleDetailCard
              key={v.id}
              vehicle={v}
              onClick={() => {
                selectVehicle(v.id);
                navigate(`/vehicles/${v.id}`);
              }}
              onAddFuel={() => {
                selectVehicle(v.id);
                navigate('/fuel/add');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
