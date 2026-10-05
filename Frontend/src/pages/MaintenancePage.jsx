/**
 * Maintenance Page
 * Service logs, periodic maintenance targets, and cost tracking with dark/light mode
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench, Plus, Calendar, Gauge, Trash2 } from 'lucide-react';
import {
  getMaintenanceRecords,
  createMaintenance,
  deleteMaintenance,
} from '../services/maintenance.service';
import { useVehicleStore } from '../store/vehicleStore';
import {
  LoadingSkeleton,
  EmptyState,
  PageHeader,
  Button,
  Badge,
  FormField,
  Input,
  Select,
  Textarea,
  Modal,
  GlassCard,
} from '../components/ui';
import { formatCurrency, formatDateShort, formatOdometer } from '../lib/utils';

const SERVICE_TYPES = [
  'Engine Oil & Filter Change',
  'Periodic Scheduled Service',
  'Brake Pads & Fluid Inspection',
  'Tyre Rotation & Wheel Balancing',
  'Air & Cabin Filter Replacement',
  'Battery & Electrical Checkup',
  'AC Service & Gas Recharge',
  'Spark Plug & Ignition Service',
  'Coolant Flush & Radiator Care',
  'Other Repair / Tuning',
];

const schema = z.object({
  vehicleId: z.coerce.number().positive('Please select a vehicle'),
  serviceType: z.string().min(1, 'Select service type'),
  serviceDate: z.string().min(1, 'Service date is required'),
  odometer: z.coerce.number().min(0, 'Enter valid odometer reading'),
  cost: z.coerce.number().min(0, 'Cost must be 0 or higher'),
  notes: z.string().optional(),
});

export default function MaintenancePage() {
  const navigate = useNavigate();
  const { vehicles, selectedVehicleId, fetchVehicles } = useVehicleStore();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeVehicleFilter, setActiveVehicleFilter] = useState(
    selectedVehicleId ? String(selectedVehicleId) : 'all'
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleId: selectedVehicleId || (vehicles[0] ? vehicles[0].id : ''),
      serviceType: 'Engine Oil & Filter Change',
      serviceDate: new Date().toISOString().split('T')[0],
      cost: '',
      notes: '',
    },
  });

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (selectedVehicleId && activeVehicleFilter === 'all') {
      setActiveVehicleFilter(String(selectedVehicleId));
    }
  }, [selectedVehicleId]);

  useEffect(() => {
    loadMaintenance();
  }, [activeVehicleFilter, vehicles]);

  async function loadMaintenance() {
    setLoading(true);
    try {
      if (activeVehicleFilter === 'all') {
        const all = [];
        for (const v of vehicles) {
          try {
            const list = await getMaintenanceRecords(v.id);
            all.push(...list.map((r) => ({ ...r, vehicleName: v.name })));
          } catch (e) {
            // ignore
          }
        }
        all.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
        setRecords(all);
      } else {
        const list = await getMaintenanceRecords(activeVehicleFilter);
        const v = vehicles.find((item) => String(item.id) === String(activeVehicleFilter));
        setRecords(list.map((r) => ({ ...r, vehicleName: v?.name || 'Vehicle' })));
      }
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data) => {
    try {
      await createMaintenance({
        vehicleId: data.vehicleId,
        serviceType: data.serviceType,
        serviceDate: data.serviceDate,
        odometer: data.odometer,
        cost: data.cost,
        notes: data.notes,
      });

      setModalOpen(false);
      reset();
      loadMaintenance();
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record maintenance.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this service record?')) {
      try {
        await deleteMaintenance(id);
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        alert('Failed to delete maintenance record');
      }
    }
  };

  const totalMaintenanceCost = records.reduce((s, r) => s + Number(r.cost || 0), 0);
  const latestService = records.length > 0 ? records[0] : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Maintenance & Service"
        description="Track routine servicing, scheduled replacements, and maintenance expenses."
        action={
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            Record Service
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shadow-2xs">
            <Wrench size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
              Total Service Cost
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(totalMaintenanceCost)}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shadow-2xs">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
              Last Service Date
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {latestService ? formatDateShort(latestService.serviceDate) : 'No service logged'}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-2xs">
            <Gauge size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
              Next Service Target
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {latestService && latestService.odometer
                ? `${(Number(latestService.odometer) + 10000).toLocaleString('en-IN')} km`
                : '10,000 km interval'}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Vehicle Filter */}
      <div className="flex items-center justify-between gap-4">
        <select
          value={activeVehicleFilter}
          onChange={(e) => setActiveVehicleFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-[#0F1B33] font-medium outline-none focus:border-teal-500 shadow-2xs"
        >
          <option value="all">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.registrationNumber || v.vehicleNumber})
            </option>
          ))}
        </select>

        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {records.length} {records.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {/* Service Records Stream */}
      {loading ? (
        <LoadingSkeleton rows={3} height={80} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No service records logged"
          description="Record routine servicing, oil changes, or repairs to maintain vehicle health history."
          action={() => setModalOpen(true)}
          actionLabel="Record Service"
        />
      ) : (
        <div className="space-y-2.5">
          {records.map((r) => (
            <GlassCard key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  <Wrench size={17} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {r.serviceType}
                    </span>
                    <Badge variant="teal">{r.vehicleName || 'Vehicle'}</Badge>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2.5">
                    <span>{formatDateShort(r.serviceDate)}</span>
                    {r.odometer && (
                      <>
                        <span>•</span>
                        <span>{formatOdometer(r.odometer)}</span>
                      </>
                    )}
                  </div>

                  {r.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-[#0A1324] p-2 rounded-lg border border-slate-100 dark:border-slate-800 max-w-xl">
                      {r.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 dark:border-slate-800 gap-2">
                <div className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                  {formatCurrency(r.cost)}
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg transition cursor-pointer"
                  title="Delete record"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add Maintenance Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Service / Maintenance"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Vehicle" error={errors.vehicleId?.message} required>
            <Select error={errors.vehicleId?.message} {...register('vehicleId')}>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.registrationNumber || v.vehicleNumber})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Service Type" error={errors.serviceType?.message} required>
            <Select error={errors.serviceType?.message} {...register('serviceType')}>
              {SERVICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Service Date" error={errors.serviceDate?.message} required>
              <Input type="date" error={errors.serviceDate?.message} {...register('serviceDate')} />
            </FormField>

            <FormField label="Odometer at Service (km)" error={errors.odometer?.message} required>
              <Input
                type="number"
                placeholder="42500"
                error={errors.odometer?.message}
                {...register('odometer')}
              />
            </FormField>
          </div>

          <FormField label="Cost (₹)" error={errors.cost?.message} required hint="Total service invoice">
            <Input type="number" step="any" placeholder="3200" error={errors.cost?.message} {...register('cost')} />
          </FormField>

          <FormField label="Service Notes" hint="Optional details on replaced parts, oil grade, etc.">
            <Textarea
              placeholder="Replaced 0W-20 engine oil, oil filter, and wiper blades."
              {...register('notes')}
            />
          </FormField>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} icon={Wrench}>
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
