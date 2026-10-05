/**
 * Fuel History Page
 * Responsive telemetry stream of fuel refills with search, multi-vehicle filters, and dark mode support
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, Plus, Search, Trash2 } from 'lucide-react';
import { getFuelEvents, deleteFuelEvent } from '../services/fuel.service';
import { useVehicleStore } from '../store/vehicleStore';
import {
  EmptyState,
  LoadingSkeleton,
  PageHeader,
  Button,
  Badge,
  GlassCard,
} from '../components/ui';
import { formatCurrency, formatDateShort, formatOdometer } from '../lib/utils';

function PaymentBadge({ method }) {
  const map = { Cash: 'default', UPI: 'teal', Card: 'blue' };
  return <Badge variant={map[method] || 'default'}>{method}</Badge>;
}

export default function FuelHistoryPage() {
  const navigate = useNavigate();
  const { vehicles, selectedVehicleId, fetchVehicles } = useVehicleStore();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeVehicleFilter, setActiveVehicleFilter] = useState(
    selectedVehicleId ? String(selectedVehicleId) : 'all'
  );

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (selectedVehicleId && activeVehicleFilter === 'all') {
      setActiveVehicleFilter(String(selectedVehicleId));
    }
  }, [selectedVehicleId]);

  useEffect(() => {
    loadAllFuelEvents();
  }, [activeVehicleFilter, vehicles]);

  async function loadAllFuelEvents() {
    setLoading(true);
    try {
      if (activeVehicleFilter === 'all') {
        const all = [];
        for (const v of vehicles) {
          try {
            const vEvents = await getFuelEvents(v.id);
            all.push(...vEvents.map((e) => ({ ...e, vehicleName: v.name })));
          } catch (e) {
            // ignore
          }
        }
        all.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
        setEvents(all);
      } else {
        const vEvents = await getFuelEvents(activeVehicleFilter);
        const v = vehicles.find((item) => String(item.id) === String(activeVehicleFilter));
        setEvents(vEvents.map((e) => ({ ...e, vehicleName: v?.name || 'Vehicle' })));
      }
    } catch (err) {
      console.error('Failed to load fuel events:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this fuel event? Mileage metrics will recalculate.')) {
      try {
        await deleteFuelEvent(id);
        setEvents((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        alert('Failed to delete fuel event');
      }
    }
  };

  const filteredEvents = events.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (e.station && e.station.toLowerCase().includes(q)) ||
      (e.paymentMethod && e.paymentMethod.toLowerCase().includes(q)) ||
      (e.vehicleName && e.vehicleName.toLowerCase().includes(q)) ||
      (e.occurredAt && e.occurredAt.includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Fuel History"
        description="Chronological telemetry of refills, estimated volumes, mileage, and cost per kilometre."
        action={
          <Button icon={Plus} onClick={() => navigate('/fuel/add')}>
            Add Refill
          </Button>
        }
      />

      {/* Filter Bar */}
      <GlassCard className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fuel station, payment method..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white bg-slate-50/60 dark:bg-[#0A1324] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeVehicleFilter}
            onChange={(e) => setActiveVehicleFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-[#0F1B33] font-medium outline-none focus:border-teal-500"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.registrationNumber || v.vehicleNumber})
              </option>
            ))}
          </select>

          {(search || activeVehicleFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setActiveVehicleFilter('all');
              }}
              className="text-xs text-slate-400 hover:text-rose-600 font-semibold px-2 py-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </GlassCard>

      {/* Main Content */}
      {loading ? (
        <LoadingSkeleton rows={4} height={80} />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Fuel}
          title="No fuel events found"
          description={
            search || activeVehicleFilter !== 'all'
              ? 'No records match your selected filters.'
              : 'Add your first fuel refill to start computing real-world mileage and cost per km.'
          }
          action={() => navigate('/fuel/add')}
          actionLabel="Add Fuel Refill"
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Data Table */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F1B33] shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Est. Volume</th>
                  <th className="py-3 px-4">Odometer</th>
                  <th className="py-3 px-4">Mileage</th>
                  <th className="py-3 px-4">Cost / KM</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {formatDateShort(e.occurredAt)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {e.vehicleName || 'Vehicle'}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-teal-700 dark:text-teal-400">
                      {e.estimatedVolume} L
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {Number(e.odometer).toLocaleString('en-IN')} km
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {e.mileage ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {Number(e.mileage).toFixed(1)} km/L
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 font-normal">Baseline</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {e.costPerKm ? `₹${Number(e.costPerKm).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                      {e.station || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <PaymentBadge method={e.paymentMethod} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(ev) => handleDelete(e.id, ev)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards Stack */}
          <div className="lg:hidden space-y-2.5">
            {filteredEvents.map((e) => (
              <GlassCard key={e.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {e.vehicleName}
                    </span>
                    <div className="text-[11px] text-slate-400">
                      {formatDateShort(e.occurredAt)} • {Number(e.odometer).toLocaleString('en-IN')} km
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 dark:text-white text-base">
                      {formatCurrency(e.amount)}
                    </div>
                    <PaymentBadge method={e.paymentMethod} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0A1324]">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Est. Volume</div>
                    <div className="font-extrabold text-xs text-teal-700 dark:text-teal-400 mt-0.5">
                      {e.estimatedVolume} L
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0A1324]">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Mileage</div>
                    <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {e.mileage ? `${Number(e.mileage).toFixed(1)} km/L` : '—'}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0A1324]">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Cost / KM</div>
                    <div className="font-extrabold text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                      {e.costPerKm ? `₹${Number(e.costPerKm).toFixed(2)}` : '—'}
                    </div>
                  </div>
                </div>

                {e.station && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center justify-between pt-1">
                    <span>📍 {e.station}</span>
                    <button
                      onClick={(ev) => handleDelete(e.id, ev)}
                      className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
