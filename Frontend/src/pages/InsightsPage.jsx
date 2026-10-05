/**
 * Insights Page — Vehicle Intelligence & Running Costs
 * Real PostgreSQL telemetry with rule-based recommendations and economy charts
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Fuel,
  BarChart2,
  Lightbulb,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getDashboardData } from '../services/dashboard.service';
import { getFuelEvents } from '../services/fuel.service';
import { useVehicleStore } from '../store/vehicleStore';
import {
  StatCard,
  InsightCard,
  LoadingSkeleton,
  EmptyState,
  PageHeader,
  GlassCard,
  Badge,
  Button,
} from '../components/ui';
import { formatCurrency } from '../lib/utils';

const CustomChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0B192C] dark:bg-[#060B17] text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700">
      <div className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-extrabold text-teal-400">
          {p.dataKey === 'mileage'
            ? `${Number(p.value).toFixed(1)} km/L`
            : p.dataKey === 'costPerKm'
            ? `₹${Number(p.value).toFixed(2)} / km`
            : formatCurrency(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function InsightsPage() {
  const navigate = useNavigate();
  const { vehicles, selectedVehicleId, selectVehicle, fetchVehicles } = useVehicleStore();

  const [dashboardData, setDashboardData] = useState(null);
  const [fuelEvents, setFuelEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (selectedVehicleId) {
      loadInsights(selectedVehicleId);
    } else if (vehicles.length > 0) {
      selectVehicle(vehicles[0].id);
      loadInsights(vehicles[0].id);
    } else {
      setLoading(false);
    }
  }, [selectedVehicleId, vehicles]);

  async function loadInsights(vId) {
    setLoading(true);
    try {
      const [dash, events] = await Promise.all([
        getDashboardData(vId),
        getFuelEvents(vId),
      ]);
      setDashboardData(dash);
      setFuelEvents(events || []);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSkeleton rows={4} height={90} />;

  if (vehicles.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Your garage is empty"
        description="Register a vehicle and log refills to unlock intelligence metrics."
        action={() => navigate('/vehicles/add')}
        actionLabel="Add Vehicle"
      />
    );
  }

  const metrics = dashboardData?.metrics || {};
  const validMileageEvents = fuelEvents.filter((e) => e.mileage !== null && e.mileage > 0);

  // Chart data
  const chartData = [...validMileageEvents].reverse().map((e) => ({
    label: new Date(e.occurredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mileage: Number(e.mileage),
    costPerKm: e.costPerKm ? Number(e.costPerKm) : null,
    amount: Number(e.amount),
  }));

  // Recommendations
  const recommendations = [];

  if (metrics.averageMileage) {
    recommendations.push({
      type: 'positive',
      title: 'Baseline Running Economy',
      headline: `Average Mileage: ${metrics.averageMileage} km/L`,
      message: `Your vehicle currently averages ₹${metrics.costPerKm || '7.50'} per kilometre. Maintaining steady cruising speeds optimizes combustion efficiency.`,
      tip: 'Regular periodic tyre pressure checks improve fuel efficiency by up to 3-5%.',
    });
  }

  if (fuelEvents.length >= 3 && validMileageEvents.length >= 2) {
    const latest = validMileageEvents[0];
    const avg = metrics.averageMileage;
    if (latest.mileage < avg * 0.93) {
      recommendations.push({
        type: 'warning',
        title: 'Mileage Dip Detected',
        headline: `${latest.mileage} km/L recorded on latest refill`,
        message: `Your latest refill returned a lower mileage than your historical ${avg} km/L average.`,
        tip: 'Check engine air filter condition, tire inflation, or inspect for excess idling in dense traffic.',
      });
    }
  }

  recommendations.push({
    type: 'info',
    title: 'Service & Maintenance Schedule',
    headline: 'Preventive Engine Health',
    message: 'Timely engine oil and spark plug servicing preserves injector precision and protects against mileage degradation.',
    tip: 'Schedule oil replacement every 10,000 km or 12 months for peak combustion efficiency.',
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Vehicle Insights"
        description="Rule-based intelligence, fuel economy trends, running costs, and maintenance recommendations."
      />

      {/* KPI Grid */}
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
          label="Running Cost / KM"
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
          label="Logged Refills"
          value={fuelEvents.length}
          color="orange"
        />
      </div>

      {fuelEvents.length < 2 ? (
        <div className="p-6 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/40 text-teal-900 dark:text-teal-200 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base">More telemetry needed</h4>
            <p className="text-xs sm:text-sm text-teal-700 dark:text-teal-300 mt-1">
              Add at least 2 consecutive fuel refills with odometer readings to unlock comparative mileage trends and cost per km graphs.
            </p>
            <Button
              size="sm"
              className="mt-3 text-xs"
              onClick={() => navigate('/fuel/add')}
            >
              Add Fuel Refill
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mileage Trend */}
            <GlassCard className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                    Mileage Economy Curve
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Calculated km/L per refill</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  km / L
                </span>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="mileage"
                      stroke="#0D9488"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#0D9488', strokeWidth: 2, stroke: '#FFFFFF' }}
                      activeDot={{ r: 5.5, fill: '#0B192C' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Cost Per KM Trend */}
            <GlassCard className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                    Running Cost / KM Trend
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">₹ spent per driven kilometre</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ₹ / km
                </span>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar
                      dataKey="costPerKm"
                      fill="#0D9488"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Recommendations Section */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-teal-600 text-white shadow-2xs">
                <Lightbulb size={14} />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                Vehicle Recommendations
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, i) => (
                <InsightCard
                  key={i}
                  title={rec.title}
                  headline={rec.headline}
                  message={rec.message}
                  tip={rec.tip}
                  type={rec.type}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
