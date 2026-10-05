/**
 * App Layout — Apple + Modern Automotive Software SaaS
 * Desktop Sidebar + Top Bar with Vehicle Switcher & Theme Toggle + Mobile Bottom Nav
 */
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Fuel,
  BarChart2,
  Wrench,
  Settings,
  Bell,
  ChevronDown,
  Menu,
  X,
  Plus,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useVehicleStore } from '../store/vehicleStore';
import { getInitials } from '../lib/utils';
import Logo from '../components/Logo';
import NotificationDropdown from '../components/NotificationDropdown';
import { ThemeToggle } from '../components/ui';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Car, label: 'Vehicles', to: '/vehicles' },
  { icon: Fuel, label: 'Fuel Events', to: '/fuel' },
  { icon: BarChart2, label: 'Insights', to: '/insights' },
  { icon: Wrench, label: 'Maintenance', to: '/maintenance' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

function VehicleSwitcher() {
  const { vehicles, selectedVehicleId, selectVehicle, fetchVehicles } = useVehicleStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentVehicle =
    vehicles.find((v) => String(v.id) === String(selectedVehicleId)) || vehicles[0];

  if (!currentVehicle) {
    return (
      <button
        onClick={() => navigate('/vehicles/add')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-teal-500/40 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-xs font-bold transition cursor-pointer"
      >
        <Plus size={13} />
        <span>Add Vehicle</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A1324] hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
      >
        <div className="w-5 h-5 rounded-lg bg-teal-500/10 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-[11px]">
          {currentVehicle.vehicleType === 'Bike' ? '🏍️' : '🚗'}
        </div>
        <div className="text-left flex flex-col">
          <span className="truncate max-w-[120px] font-bold text-slate-900 dark:text-white leading-none">
            {currentVehicle.name}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
            {currentVehicle.registrationNumber || currentVehicle.vehicleNumber}
          </span>
        </div>
        <ChevronDown size={13} className="text-slate-400 ml-1" />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0F1B33] border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-1.5 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Active Vehicle
          </div>
          <div className="max-h-56 overflow-y-auto">
            {vehicles.map((v) => {
              const isSelected = String(v.id) === String(selectedVehicleId);
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    selectVehicle(v.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-sm">{v.vehicleType === 'Bike' ? '🏍️' : '🚗'}</span>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{v.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {v.registrationNumber || v.vehicleNumber} • {v.fuelType}
                      </div>
                    </div>
                  </div>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>}
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                navigate('/vehicles/add');
              }}
              className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 cursor-pointer"
            >
              <Plus size={13} />
              <span>Register new vehicle</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#091122] text-slate-900 dark:text-slate-100">
      {/* ─── Desktop Sidebar ───────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-[#0B192C] dark:bg-[#060B17] border-r border-[#1E293B] dark:border-[#13203B] select-none flex-shrink-0 z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1E293B]/70 dark:border-[#13203B]">
          <Logo size="md" showTagline={true} />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, to }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 font-bold border-l-2 border-teal-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40 dark:hover:bg-[#13203B]/60'
                }`}
              >
                <Icon
                  size={16}
                  className={isActive ? 'text-teal-400' : 'text-slate-400'}
                />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Sign Out at bottom */}
        <div className="p-3 border-t border-[#1E293B] dark:border-[#13203B] bg-[#07111F]/60 dark:bg-black/30">
          <div
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#1E293B]/60 dark:hover:bg-[#13203B]/60 cursor-pointer transition"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {getInitials(user?.name || 'User')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-100 truncate">
                {user?.name || 'Driver'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-1.5 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile Drawer Overlay ─────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── Mobile Drawer ─────────────────────────────────────── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-68 bg-[#0B192C] dark:bg-[#060B17] z-50 flex flex-col transition-transform duration-200 ease-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-[#1E293B] dark:border-[#13203B]">
          <Logo size="md" showTagline={true} />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, to }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 font-bold border-l-2 border-teal-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-teal-400' : 'text-slate-400'} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1E293B] dark:border-[#13203B] bg-[#07111F]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              {getInitials(user?.name || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-100 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Viewport Column ───────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-15 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0B1426]/90 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
            >
              <Menu size={19} />
            </button>
            <VehicleSwitcher />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/fuel/add')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Refill</span>
              <span className="sm:hidden">Refill</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-slate-900"></span>
              </button>
              {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Scrollable Main Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>

        {/* ─── Mobile Bottom Navigation ─────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#0B1426]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-40 shadow-lg">
          {navItems.slice(0, 5).map(({ icon: Icon, label, to }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition ${
                  isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
