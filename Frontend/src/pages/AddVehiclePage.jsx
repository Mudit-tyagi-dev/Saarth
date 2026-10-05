/**
 * Add Vehicle Page
 * Register a vehicle into PostgreSQL database with live validation and clean form styling
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, CheckCircle2, ArrowLeft, Fuel } from 'lucide-react';
import { useVehicleStore } from '../store/vehicleStore';
import { Button, FormField, Input, Select, PageHeader, GlassCard } from '../components/ui';

const VEHICLE_TYPES = ['Car', 'Bike'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG'];

const schema = z.object({
  name: z.string().min(2, 'Vehicle name is required'),
  registrationNumber: z.string().min(4, 'Enter a valid registration number (e.g. UP16XX1234)'),
  vehicleType: z.enum(['Car', 'Bike'], { required_error: 'Select vehicle type' }),
  fuelType: z.enum(['Petrol', 'Diesel', 'CNG'], { required_error: 'Select fuel type' }),
  model: z.string().min(2, 'Model name is required (e.g. Swift ZXi+)'),
  year: z.coerce
    .number()
    .int()
    .min(1990, 'Enter a valid year')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  currentOdometer: z.coerce.number().min(0, 'Odometer cannot be negative'),
});

export default function AddVehiclePage() {
  const navigate = useNavigate();
  const { addVehicle } = useVehicleStore();
  const [success, setSuccess] = useState(false);
  const [savedVehicle, setSavedVehicle] = useState(null);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleType: 'Car',
      fuelType: 'Petrol',
      year: new Date().getFullYear(),
      currentOdometer: 0,
    },
  });

  const onSubmit = async (data) => {
    setApiError(null);
    const result = await addVehicle({
      name: data.name,
      registrationNumber: data.registrationNumber.toUpperCase(),
      vehicleType: data.vehicleType,
      fuelType: data.fuelType,
      model: data.model,
      year: data.year,
      currentOdometer: data.currentOdometer,
    });

    if (result.success) {
      setSavedVehicle(result.vehicle);
      setSuccess(true);
    } else {
      setApiError(result.error || 'Failed to add vehicle. Please try again.');
    }
  };

  if (success && savedVehicle) {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs border border-emerald-100 dark:border-emerald-900/40">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Vehicle Registered!</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            <strong className="text-slate-800 dark:text-slate-200">{savedVehicle.name}</strong> ({savedVehicle.registrationNumber}) is now in your garage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
          <Button onClick={() => navigate('/fuel/add')} icon={Fuel} size="lg">
            Add First Fuel Refill
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')} size="lg">
            Go to Dashboard
          </Button>
        </div>

        <button
          onClick={() => {
            setSuccess(false);
            setSavedVehicle(null);
          }}
          className="text-xs text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-semibold cursor-pointer"
        >
          Register another vehicle
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/vehicles')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
      >
        <ArrowLeft size={15} />
        <span>Back to Garage</span>
      </button>

      <PageHeader
        title="Add Vehicle"
        description="Register a new car or motorcycle to start tracking fuel economy and running costs."
      />

      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {apiError}
        </div>
      )}

      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <FormField label="Vehicle Name" error={errors.name?.message} required hint="e.g. Swift, City, Duke 390">
              <Input placeholder="My Swift" error={errors.name?.message} {...register('name')} />
            </FormField>

            <FormField label="Registration Number" error={errors.registrationNumber?.message} required hint="e.g. UP16XX1234">
              <Input
                placeholder="UP16XX1234"
                className="uppercase font-semibold tracking-wide"
                error={errors.registrationNumber?.message}
                {...register('registrationNumber')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <FormField label="Vehicle Type" error={errors.vehicleType?.message} required>
              <Select error={errors.vehicleType?.message} {...register('vehicleType')}>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'Bike' ? '🏍️ Bike' : '🚗 Car'}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Fuel Type" error={errors.fuelType?.message} required>
              <Select error={errors.fuelType?.message} {...register('fuelType')}>
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Model Details" error={errors.model?.message} required hint="e.g. Maruti Suzuki Swift ZXi+">
            <Input placeholder="Maruti Suzuki Swift ZXi+" error={errors.model?.message} {...register('model')} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <FormField label="Year" error={errors.year?.message} required>
              <Input type="number" placeholder="2023" error={errors.year?.message} {...register('year')} />
            </FormField>

            <FormField
              label="Current Odometer (km)"
              error={errors.currentOdometer?.message}
              required
              hint="Initial starting odometer reading"
            >
              <Input
                type="number"
                placeholder="42180"
                error={errors.currentOdometer?.message}
                {...register('currentOdometer')}
              />
            </FormField>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => navigate('/vehicles')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} icon={Car}>
              {isSubmitting ? 'Registering...' : 'Register Vehicle'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
