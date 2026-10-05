/**
 * Add Fuel Page — Core Fuel Refill Logging
 * Live telemetry preview of Estimated Fuel Volume, Distance, Mileage, and Cost/KM
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Fuel,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { createFuelEvent, getFuelEvents } from '../services/fuel.service';
import { useVehicleStore } from '../store/vehicleStore';
import {
  Button,
  FormField,
  Input,
  Select,
  PageHeader,
  GlassCard,
  Badge,
} from '../components/ui';
import { formatCurrency, formatOdometer } from '../lib/utils';

const schema = z.object({
  vehicleId: z.coerce.number().positive('Please select a vehicle'),
  occurredAt: z.string().min(1, 'Refill date is required'),
  amount: z.coerce.number().positive('Amount paid must be greater than 0'),
  fuelPrice: z.coerce.number().positive('Fuel price per litre must be greater than 0'),
  odometer: z.coerce.number().positive('Current odometer reading is required'),
  fuelType: z.string().min(1, 'Select fuel type'),
  station: z.string().optional(),
  paymentMethod: z.enum(['Cash', 'UPI', 'Card']),
});

export default function AddFuelPage() {
  const navigate = useNavigate();
  const { vehicles, selectedVehicleId, selectVehicle, fetchVehicles } = useVehicleStore();

  const [success, setSuccess] = useState(false);
  const [savedEvent, setSavedEvent] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [prevFuelEvent, setPrevFuelEvent] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const defaultVehicle =
    vehicles.find((v) => String(v.id) === String(selectedVehicleId)) || vehicles[0];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: defaultVehicle ? defaultVehicle.id : '',
      occurredAt: today,
      amount: '',
      fuelPrice: 100,
      odometer: defaultVehicle ? Number(defaultVehicle.currentOdometer || 0) : '',
      paymentMethod: 'UPI',
      fuelType: defaultVehicle ? defaultVehicle.fuelType : 'Petrol',
      station: '',
    },
  });

  const watchedVehicleId = useWatch({ control, name: 'vehicleId' });
  const watchedAmount = useWatch({ control, name: 'amount' });
  const watchedPrice = useWatch({ control, name: 'fuelPrice' });
  const watchedOdometer = useWatch({ control, name: 'odometer' });

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (watchedVehicleId) {
      const v = vehicles.find((item) => String(item.id) === String(watchedVehicleId));
      if (v) {
        setValue('fuelType', v.fuelType || 'Petrol');
        if (!watchedOdometer || watchedOdometer === 0) {
          setValue('odometer', Number(v.currentOdometer || 0));
        }
      }

      getFuelEvents(watchedVehicleId)
        .then((events) => {
          if (events && events.length > 0) {
            setPrevFuelEvent(events[0]);
          } else {
            setPrevFuelEvent(null);
          }
        })
        .catch(() => setPrevFuelEvent(null));
    }
  }, [watchedVehicleId, vehicles]);

  // Live Calculations
  const numAmount = Number(watchedAmount) || 0;
  const numPrice = Number(watchedPrice) || 0;
  const numCurrentOdo = Number(watchedOdometer) || 0;

  const estimatedVolume =
    numAmount > 0 && numPrice > 0 ? Number((numAmount / numPrice).toFixed(2)) : 0;

  const prevOdo = prevFuelEvent
    ? Number(prevFuelEvent.odometer)
    : defaultVehicle
    ? Number(defaultVehicle.currentOdometer || 0)
    : null;

  const distanceDelta =
    prevOdo !== null && numCurrentOdo > prevOdo
      ? Number((numCurrentOdo - prevOdo).toFixed(1))
      : null;

  const liveMileage =
    distanceDelta && estimatedVolume > 0
      ? Number((distanceDelta / estimatedVolume).toFixed(2))
      : null;

  const liveCostPerKm =
    distanceDelta && distanceDelta > 0 && numAmount > 0
      ? Number((numAmount / distanceDelta).toFixed(2))
      : null;

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const created = await createFuelEvent({
        vehicleId: data.vehicleId,
        amount: data.amount,
        fuelPrice: data.fuelPrice,
        odometer: data.odometer,
        fuelType: data.fuelType,
        paymentMethod: data.paymentMethod,
        station: data.station,
        occurredAt: data.occurredAt,
      });

      setSavedEvent(created);
      setSuccess(true);
      fetchVehicles();
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to record fuel event.');
    }
  };

  if (vehicles.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12">
        <GlassCard className="p-8 text-center space-y-4">
          <Fuel size={32} className="text-teal-600 dark:text-teal-400 mx-auto" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Your garage is empty</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please register a vehicle before logging fuel refills.
          </p>
          <Button onClick={() => navigate('/vehicles/add')} fullWidth>
            Register Vehicle
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (success && savedEvent) {
    return (
      <div className="max-w-lg mx-auto my-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs border border-emerald-100 dark:border-emerald-900/40">
          <CheckCircle2 size={32} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Refill Saved!</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calculated metrics have been computed and recorded.
          </p>
        </div>

        <GlassCard className="p-5 sm:p-6 text-left space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1324] border border-slate-100 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Amount Paid
              </span>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(savedEvent.amount)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/30 text-teal-900 dark:text-teal-200">
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">
                Estimated Fuel Volume
              </span>
              <div className="text-base font-black text-teal-800 dark:text-teal-300 mt-0.5">
                {savedEvent.estimatedVolume} L
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1324] border border-slate-100 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Odometer
              </span>
              <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {formatOdometer(savedEvent.odometer)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                Calculated Mileage
              </span>
              <div className="text-base font-black text-emerald-800 dark:text-emerald-300 mt-0.5">
                {savedEvent.mileage ? `${Number(savedEvent.mileage).toFixed(1)} km/L` : 'Baseline Refill'}
              </div>
            </div>
          </div>

          {savedEvent.costPerKm && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200/50 dark:border-teal-800/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-300 uppercase">
                  Cost Per KM
                </span>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  ₹{Number(savedEvent.costPerKm).toFixed(2)} / km
                </div>
              </div>
              {savedEvent.distance && (
                <div className="text-slate-500 dark:text-slate-400 font-semibold">
                  Distance: {savedEvent.distance} km
                </div>
              )}
            </div>
          )}
        </GlassCard>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Button
            onClick={() => {
              setSuccess(false);
              setSavedEvent(null);
            }}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Log Another Refill
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
      >
        <ArrowLeft size={15} />
        <span>Back to Dashboard</span>
      </button>

      <PageHeader
        title="Add Fuel Refill"
        description="Log refill telemetry to compute estimated volume, distance, mileage, and cost per kilometre."
      />

      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {apiError}
        </div>
      )}

      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Select Vehicle" error={errors.vehicleId?.message} required>
            <Select error={errors.vehicleId?.message} {...register('vehicleId')}>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.registrationNumber || v.vehicleNumber}) — {v.fuelType}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <FormField label="Amount Paid (₹)" error={errors.amount?.message} required hint="e.g. 2500">
              <Input
                type="number"
                step="any"
                placeholder="2500"
                error={errors.amount?.message}
                {...register('amount')}
              />
            </FormField>

            <FormField label="Fuel Price / Litre (₹)" error={errors.fuelPrice?.message} required hint="e.g. 100.50">
              <Input
                type="number"
                step="any"
                placeholder="100.50"
                error={errors.fuelPrice?.message}
                {...register('fuelPrice')}
              />
            </FormField>
          </div>

          {/* Live Calculation Preview */}
          {estimatedVolume > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-50/50 to-white dark:from-teal-950/30 dark:via-[#0F1B33] dark:to-slate-900/40 border border-teal-200/80 dark:border-teal-800/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-teal-600 text-white shadow-2xs">
                    <Sparkles size={13} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-teal-900 dark:text-teal-200">
                    Live Telemetry Preview
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#0A1324] border border-teal-100 dark:border-teal-900/30">
                  <div className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500">
                    Estimated Volume
                  </div>
                  <div className="text-base font-black text-teal-800 dark:text-teal-300 mt-0.5">
                    {estimatedVolume} <span className="text-xs font-semibold text-slate-400">L</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">₹{numAmount} ÷ ₹{numPrice}/L</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-[#0A1324] border border-teal-100 dark:border-teal-900/30">
                  <div className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500">
                    Calculated Distance
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {distanceDelta !== null && distanceDelta > 0 ? (
                      <>
                        {distanceDelta}{' '}
                        <span className="text-xs font-semibold text-slate-400">km</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">
                        {prevOdo ? `Odo > ${prevOdo}` : 'Initial Refill'}
                      </span>
                    )}
                  </div>
                  {prevOdo && (
                    <div className="text-[9px] text-slate-400 mt-0.5">Prev: {prevOdo} km</div>
                  )}
                </div>

                <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-white/90 dark:bg-[#0A1324] border border-teal-100 dark:border-teal-900/30">
                  <div className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500">
                    Calculated Mileage
                  </div>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {liveMileage ? (
                      <>
                        {liveMileage}{' '}
                        <span className="text-xs font-semibold text-slate-400">km/L</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">Ready on 2nd refill</span>
                    )}
                  </div>
                  {liveCostPerKm && (
                    <div className="text-[9px] font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                      Cost: ₹{liveCostPerKm}/km
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <FormField
              label="Odometer (km)"
              error={errors.odometer?.message}
              required
              hint={prevOdo ? `Previous reading: ${prevOdo} km` : 'Current meter reading at pump'}
            >
              <Input
                type="number"
                placeholder="42510"
                error={errors.odometer?.message}
                {...register('odometer')}
              />
            </FormField>

            <FormField label="Date of Refill" error={errors.occurredAt?.message} required>
              <Input
                type="date"
                error={errors.occurredAt?.message}
                {...register('occurredAt')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <FormField label="Fuel Station" hint="Optional station name / location">
              <Input placeholder="Indian Oil, Sector 62" {...register('station')} />
            </FormField>

            <FormField label="Payment Method" required>
              <Select {...register('paymentMethod')}>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
              </Select>
            </FormField>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => navigate('/fuel')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} icon={Fuel}>
              {isSubmitting ? 'Saving...' : 'Save Refill Event'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
