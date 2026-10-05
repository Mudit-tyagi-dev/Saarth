/**
 * Dashboard Page — Core SAARTH Experience
 * Refined visual hierarchy, asymmetrical KPI grid, clean Recharts trend curve, and signature intelligence
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gauge,
  TrendingUp,
  Fuel,
  Plus,
  Car,
  Sparkles,
  BarChart2,
  Calendar,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useVehicleStore } from '../store/vehicleStore';
import { useAuthStore } from '../store/authStore';
import { getDashboardData } from '../services/dashboard.service';
import {
  StatCard,
  FuelEventCard,
  InsightCard,
  EmptyState,
  LoadingSkeleton,
  Badge,
  Button,
  GlassCard,
} from '../components/ui';
import { formatCurrency, formatOdometer } from '../lib/utils';

const CustomChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0B192C] dark:bg-[#060B17] text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700">
      <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-extrabold text-teal-400 text-sm">
          {Number(p.value).toFixed(1)} km/L
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { vehicles, selectedVehicleId, selectedVehicle, selectVehicle, fetchVehicles } =
    useVehicleStore();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (selectedVehicleId) {
      loadStats(selectedVehicleId);
    } else if (vehicles.length > 0) {
      selectVehicle(vehicles[0].id);
      loadStats(vehicles[0].id);
    } else {
      setLoading(false);
    }
  }, [selectedVehicleId, vehicles]);

  async function loadStats(vId) {
    setLoading(true);
    try {
      const data = await getDashboardData(vId);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = user?.name ? user.name.split(' ')[0] : 'Driver';

  if (!loading && vehicles.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <EmptyState
          icon={Car}
          title="Your garage is empty"
          description="Add your first vehicle to start understanding fuel economy, real-world mileage, running costs, and vehicle health."
          action={() => navigate('/vehicles/add')}
          actionLabel="Add Vehicle"
        />
      </div>
    );
  }

  const vehicle = selectedVehicle || dashboardData?.vehicle;
  const metrics = dashboardData?.metrics || {};
  const recentEvents = dashboardData?.recentFuelEvents || [];
  const mileageHistory = dashboardData?.recentMileageHistory || [];
  const insight = dashboardData?.insight;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's how your vehicle is doing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Car}
            onClick={() => navigate('/vehicles')}
          >
            Garage ({vehicles.length})
          </Button>
          <Button
            size="sm"
            icon={Fuel}
            onClick={() => navigate('/fuel/add')}
          >
            Add Refill
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} height={100} />
      ) : (
        <>
          {/* ─── Primary Vehicle Overview Card ──────────────────── */}
          {vehicle && (
            <GlassCard className="p-5 sm:p-6 bg-gradient-to-r from-white via-slate-50/50 to-teal-50/20 dark:from-[#0F1B33] dark:via-[#101F3B] dark:to-teal-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xl shadow-xs">
                    {vehicle.vehicleType === 'Bike' ? '🏍️' : '🚗'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">
                        {vehicle.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                        {vehicle.fuelType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {vehicle.registrationNumber || vehicle.vehicleNumber}
                      </span>
                      {vehicle.model && ` • ${vehicle.model}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Odometer
                    </span>
                    <div className="font-black text-slate-900 dark:text-white text-sm">
                      {formatOdometer(vehicle.currentOdometer || metrics.currentOdometer)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      Status
                    </span>
                    <div className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* ─── Refined Asymmetrical KPI Grid ─────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp}
              label="Average Mileage"
              value={metrics.averageMileage ? metrics.averageMileage : '—'}
              unit={metrics.averageMileage ? 'km/L' : ''}
              color="teal"
              featured={true}
            />

            <StatCard
              icon={BarChart2}
              label="Cost / KM"
              value={metrics.costPerKm ? `₹${metrics.costPerKm}` : '—'}
              unit={metrics.costPerKm ? '/ km' : ''}
              color="navy"
            />

            <StatCard
              icon={Calendar}
              label="Monthly Fuel Spend"
              value={formatCurrency(metrics.monthlyFuelSpend || 0)}
              color="green"
            />

            <StatCard
              icon={Fuel}
              label="Refill Events"
              value={metrics.fuelEventCount || 0}
              color="orange"
            />
          </div>

          {/* ─── Signature SAARTH Insight Card ─────────────────── */}
          {insight && (
            <InsightCard
              title={insight.title}
              headline={insight.headline}
              message={insight.message}
              tip={insight.tip}
              type={insight.type}
            />
          )}

          {/* ─── Chart & Recent Activity Grid ──────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mileage Trend Chart */}
            <div className="lg:col-span-2">
              <GlassCard className="p-5 sm:p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      Mileage Trend
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      Calculated economy (km/L) per refill event
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                    km / L
                  </span>
                </div>

                <div className="h-60 w-full">
                  {mileageHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={mileageHistory}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="dashboardMileageGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="mileage"
                          stroke="#0D9488"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#dashboardMileageGrad)"
                          dot={{ r: 3.5, fill: '#0D9488', strokeWidth: 2, stroke: '#FFFFFF' }}
                          activeDot={{ r: 5.5, fill: '#0B192C' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      <TrendingUp size={24} className="text-slate-300 dark:text-slate-600 mb-2" />
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Trend curve unlocks after 2+ refills
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mt-0.5">
                        Log odometer readings on each refill to chart your fuel economy curve.
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Recent Refills Timeline */}
            <div className="lg:col-span-1">
              <GlassCard className="p-5 sm:p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Recent Refills
                  </h3>
                  <button
                    onClick={() => navigate('/fuel')}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="flex-1 space-y-2.5">
                  {recentEvents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <Fuel size={22} className="text-slate-300 dark:text-slate-600 mb-2" />
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        No refill events yet
                      </div>
                      <Button
                        size="sm"
                        className="mt-3 text-xs"
                        onClick={() => navigate('/fuel/add')}
                      >
                        Log First Refill
                      </Button>
                    </div>
                  ) : (
                    recentEvents.map((event) => (
                      <FuelEventCard key={event.id} event={event} compact={true} />
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
