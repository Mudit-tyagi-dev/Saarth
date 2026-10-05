/**
 * Vehicle Details Page
 * Comprehensive overview, fuel telemetry stream, maintenance history, and insights
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Car,
  Bike,
  Gauge,
  Fuel,
  Wrench,
  TrendingUp,
  BarChart2,
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { getVehicleById, updateVehicle, deleteVehicle } from '../services/vehicle.service';
import { getFuelEvents } from '../services/fuel.service';
import { getMaintenanceRecords } from '../services/maintenance.service';
import { getDashboardData } from '../services/dashboard.service';
import {
  LoadingSkeleton,
  StatCard,
  FuelEventCard,
  InsightCard,
  Button,
  Badge,
  EmptyState,
  PageHeader,
  GlassCard,
  Modal,
  FormField,
  Input,
  Select,
} from '../components/ui';
import { formatCurrency, formatOdometer, formatDateShort } from '../lib/utils';
import { useVehicleStore } from '../store/vehicleStore';

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectVehicle, removeVehicle } = useVehicleStore();

  const [vehicle, setVehicle] = useState(null);
  const [fuelEvents, setFuelEvents] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Edit vehicle state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    registrationNumber: '',
    vehicleType: 'Car',
    fuelType: 'Petrol',
    model: '',
    year: '',
    currentOdometer: '',
  });

  useEffect(() => {
    loadVehicleData();
  }, [id]);

  async function loadVehicleData() {
    setLoading(true);
    try {
      selectVehicle(id);
      const [v, events, maint, dash] = await Promise.all([
        getVehicleById(id),
        getFuelEvents(id),
        getMaintenanceRecords(id),
        getDashboardData(id),
      ]);
      setVehicle(v);
      setFuelEvents(events || []);
      setMaintenance(maint || []);
      setDashboardData(dash);
      setEditForm({
        name: v.name || '',
        registrationNumber: v.registrationNumber || v.vehicleNumber || '',
        vehicleType: v.vehicleType || 'Car',
        fuelType: v.fuelType || 'Petrol',
        model: v.model || '',
        year: v.year || '',
        currentOdometer: v.currentOdometer || 0,
      });
    } catch (err) {
      console.error('Failed to load vehicle:', err);
      navigate('/vehicles');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateVehicle(id, editForm);
      setVehicle((prev) => ({ ...prev, ...updated }));
      setEditModalOpen(false);
    } catch (err) {
      alert('Failed to update vehicle');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vehicle? All fuel and service logs will be permanently removed.')) {
      try {
        await deleteVehicle(id);
        removeVehicle(id);
        navigate('/vehicles');
      } catch (err) {
        alert('Failed to delete vehicle');
      }
    }
  };

  if (loading) return <LoadingSkeleton rows={4} height={90} />;
  if (!vehicle) return null;

  const isBike = vehicle.vehicleType === 'Bike' || vehicle.type === 'Bike';
  const VehicleIcon = isBike ? Bike : Car;

  const validMileageEvents = fuelEvents.filter((e) => e.mileage !== null && e.mileage > 0);
  const avgMileage =
    validMileageEvents.length > 0
      ? Number(
          (
            validMileageEvents.reduce((s, e) => s + Number(e.mileage), 0) /
            validMileageEvents.length
          ).toFixed(1)
        )
      : null;

  const validCostEvents = fuelEvents.filter((e) => e.costPerKm !== null && e.costPerKm > 0);
  const avgCostPerKm =
    validCostEvents.length > 0
      ? Number(
          (
            validCostEvents.reduce((s, e) => s + Number(e.costPerKm), 0) /
            validCostEvents.length
          ).toFixed(2)
        )
      : null;

  const totalFuelSpend = fuelEvents.reduce((s, e) => s + Number(e.amount || 0), 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'fuel', label: `Fuel Events (${fuelEvents.length})`, icon: Fuel },
    { id: 'maintenance', label: `Maintenance (${maintenance.length})`, icon: Wrench },
    { id: 'insights', label: 'Insights', icon: Sparkles },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/vehicles')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
      >
        <ArrowLeft size={15} />
        <span>Back to Garage</span>
      </button>

      {/* Vehicle Hero Card */}
      <GlassCard className="p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shadow-2xs">
              <VehicleIcon size={30} />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {vehicle.name}
                </h1>
                <Badge variant="teal">{vehicle.fuelType}</Badge>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {vehicle.vehicleType}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {vehicle.registrationNumber || vehicle.vehicleNumber}
                </span>
                {vehicle.model && ` • ${vehicle.model}`}
                {vehicle.year && ` (${vehicle.year})`}
              </div>

              <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                <Gauge size={14} className="text-teal-600 dark:text-teal-400" />
                <span>Odometer: {formatOdometer(vehicle.currentOdometer)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={Edit2}
              onClick={() => setEditModalOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Trash2}
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              size="sm"
              icon={Fuel}
              onClick={() => navigate('/fuel/add')}
            >
              Refill
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Average Mileage"
          value={avgMileage ? avgMileage : '—'}
          unit={avgMileage ? 'km/L' : ''}
          color="teal"
          featured={true}
        />
        <StatCard
          icon={BarChart2}
          label="Running Cost"
          value={avgCostPerKm ? `₹${avgCostPerKm}` : '—'}
          unit={avgCostPerKm ? '/ km' : ''}
          color="navy"
        />
        <StatCard
          icon={Fuel}
          label="Total Fuel Spend"
          value={formatCurrency(totalFuelSpend)}
          color="orange"
        />
        <StatCard
          icon={Gauge}
          label="Current Odometer"
          value={Number(vehicle.currentOdometer || 0).toLocaleString('en-IN')}
          unit="km"
          color="green"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {dashboardData?.insight && (
            <InsightCard
              title={dashboardData.insight.title}
              headline={dashboardData.insight.headline}
              message={dashboardData.insight.message}
              tip={dashboardData.insight.tip}
              type={dashboardData.insight.type}
            />
          )}

          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-3">
              Recent Refill Activity
            </h3>
            {fuelEvents.length === 0 ? (
              <EmptyState
                icon={Fuel}
                title="No fuel entries yet"
                description="Log refills to unlock distance, mileage and running cost stats."
                action={() => navigate('/fuel/add')}
                actionLabel="Log Refill"
              />
            ) : (
              <div className="space-y-2.5">
                {fuelEvents.slice(0, 4).map((e) => (
                  <FuelEventCard key={e.id} event={e} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fuel' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Fuel Refill Stream
            </h3>
            <Button size="sm" icon={Plus} onClick={() => navigate('/fuel/add')}>
              Add Refill
            </Button>
          </div>

          {fuelEvents.length === 0 ? (
            <EmptyState
              icon={Fuel}
              title="No fuel records"
              description="Record fuel purchases to calculate estimated volume, mileage, and cost per km."
              action={() => navigate('/fuel/add')}
              actionLabel="Add Fuel Refill"
            />
          ) : (
            <div className="space-y-2.5">
              {fuelEvents.map((e) => (
                <FuelEventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Service History
            </h3>
            <Button size="sm" icon={Plus} onClick={() => navigate('/maintenance')}>
              Record Service
            </Button>
          </div>

          {maintenance.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No service records"
              description="Keep logs of oil changes, periodic maintenance, and repairs."
              action={() => navigate('/maintenance')}
              actionLabel="Add Service Record"
            />
          ) : (
            <div className="space-y-2.5">
              {maintenance.map((m) => (
                <GlassCard key={m.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold flex-shrink-0">
                      <Wrench size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {m.serviceType}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDateShort(m.serviceDate)}
                        {m.odometer && ` • ${Number(m.odometer).toLocaleString('en-IN')} km`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-slate-900 dark:text-white text-sm">
                    {formatCurrency(m.cost)}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          {dashboardData?.insight ? (
            <InsightCard
              title={dashboardData.insight.title}
              headline={dashboardData.insight.headline}
              message={dashboardData.insight.message}
              tip={dashboardData.insight.tip}
              type={dashboardData.insight.type}
            />
          ) : (
            <EmptyState
              icon={Sparkles}
              title="More data needed"
              description="Add at least two consecutive refills to generate vehicle intelligence."
            />
          )}
        </div>
      )}

      {/* Edit Vehicle Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Vehicle Details"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <FormField label="Vehicle Name" required>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Registration Number" required>
            <Input
              value={editForm.registrationNumber}
              onChange={(e) =>
                setEditForm({ ...editForm, registrationNumber: e.target.value.toUpperCase() })
              }
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type">
              <Select
                value={editForm.vehicleType}
                onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
              </Select>
            </FormField>

            <FormField label="Fuel Type">
              <Select
                value={editForm.fuelType}
                onChange={(e) => setEditForm({ ...editForm, fuelType: e.target.value })}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Model">
            <Input
              value={editForm.model}
              onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Year">
              <Input
                type="number"
                value={editForm.year}
                onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
              />
            </FormField>
            <FormField label="Current Odometer (km)">
              <Input
                type="number"
                value={editForm.currentOdometer}
                onChange={(e) => setEditForm({ ...editForm, currentOdometer: e.target.value })}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
