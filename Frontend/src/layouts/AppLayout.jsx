/**
 * SAARTH App Layout
 * Floating sidebar (desktop) + Glass topbar + Mobile drawer + Bottom nav
 * Premium automotive SaaS — Apple × Linear design language
 */
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Car, Fuel, BarChart2, Wrench,
  Settings, Bell, ChevronDown, Menu, X, Plus,
  LogOut, Sun, Moon,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useVehicleStore } from '../store/vehicleStore';
import { useThemeStore } from '../store/themeStore';
import { getInitials } from '../lib/utils';
import Logo from '../components/Logo';
import NotificationDropdown from '../components/NotificationDropdown';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',   to: '/dashboard'   },
  { icon: Car,             label: 'Vehicles',     to: '/vehicles'    },
  { icon: Fuel,            label: 'Fuel',         to: '/fuel'        },
  { icon: BarChart2,       label: 'Insights',     to: '/insights'    },
  { icon: Wrench,          label: 'Maintenance',  to: '/maintenance' },
  { icon: Settings,        label: 'Settings',     to: '/settings'    },
];

/* ─── Vehicle Switcher ──────────────────────────────────────────────────── */
function VehicleSwitcher() {
  const { vehicles, selectedVehicleId, selectVehicle, fetchVehicles } = useVehicleStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = vehicles.find(v => String(v.id) === String(selectedVehicleId)) || vehicles[0];

  if (!current) {
    return (
      <button
        onClick={() => navigate('/vehicles/add')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150"
        style={{
          border: '1px dashed var(--accent-border)',
          color: 'var(--accent-text)',
          background: 'var(--accent-light)',
        }}
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150"
        style={{
          border: '1px solid var(--border-strong)',
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div
          className="w-5 h-5 rounded-lg flex items-center justify-center text-[11px]"
          style={{ background: 'var(--accent-light)' }}
        >
          {current.vehicleType === 'Bike' ? '🏍️' : '🚗'}
        </div>
        <div className="text-left">
          <div className="font-bold leading-none truncate max-w-[100px]" style={{ color: 'var(--text-primary)' }}>
            {current.name}
          </div>
          <div className="text-[9px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {current.registrationNumber || current.vehicleNumber}
          </div>
        </div>
        <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} className="ml-0.5 flex-shrink-0" />
      </button>

      {open && (
        <div
          className="vehicle-dropdown absolute left-0 mt-2"
          style={{ top: '100%' }}
        >
          <div
            className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}
          >
            Active Vehicle
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {vehicles.map(v => {
              const isSelected = String(v.id) === String(selectedVehicleId);
              return (
                <button
                  key={v.id}
                  onClick={() => { selectVehicle(v.id); setOpen(false); }}
                  className="w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition cursor-pointer"
                  style={{
                    background: isSelected ? 'var(--accent-light)' : 'transparent',
                    color: isSelected ? 'var(--accent-text)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{v.vehicleType === 'Bike' ? '🏍️' : '🚗'}</span>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v.name}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {v.registrationNumber || v.vehicleNumber} · {v.fuelType}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                  )}
                </button>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="py-1">
            <button
              onClick={() => { setOpen(false); navigate('/vehicles/add'); }}
              className="w-full text-left px-3.5 py-2.5 flex items-center gap-2 text-xs font-semibold cursor-pointer transition"
              style={{ color: 'var(--accent-text)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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

/* ─── Theme Toggle ───────────────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer"
      style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      {isDark
        ? <Sun size={16} style={{ color: '#F59E0B' }} />
        : <Moon size={16} />
      }
    </button>
  );
}

/* ─── Sidebar Content (shared between desktop/mobile) ───────────────────── */
function SidebarContent({ onNavClick, user, handleLogout, navigate }) {
  const location = useLocation();

  return (
    <>
      {/* Brand */}
      <div
        className="px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <Logo size="md" showTagline={false} />
        <div className="mt-1.5 text-[9px] font-medium tracking-widest uppercase" style={{ color: 'var(--sidebar-text)' }}>
          Vehicle Intelligence
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, to }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onNavClick}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User section + logout */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--sidebar-border)' }}
      >
        {/* Profile row */}
        <button
          onClick={() => { navigate('/settings'); if (onNavClick) onNavClick(); }}
          className="w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-150 cursor-pointer text-left"
          style={{ color: 'var(--sidebar-text)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-surface)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #059669 100%)' }}
          >
            {getInitials(user?.name || 'User')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {user?.name || 'Driver'}
            </div>
            <div className="text-[10px] truncate" style={{ color: 'var(--sidebar-text)' }}>
              {user?.email}
            </div>
          </div>
        </button>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="mt-1 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer"
          style={{ color: 'var(--sidebar-text)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FCA5A5'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--sidebar-text)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={12} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}

/* ─── Main AppLayout ─────────────────────────────────────────────────────── */
export default function AppLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: 'var(--bg-app)' }}
    >
      {/* ─── Desktop Floating Sidebar ─────────────────────────── */}
      <aside className="saarth-sidebar hidden md:flex select-none">
        <SidebarContent
          user={user}
          handleLogout={handleLogout}
          navigate={navigate}
        />
      </aside>

      {/* ─── Mobile Overlay ───────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── Mobile Slide Drawer ──────────────────────────────── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 flex flex-col md:hidden transition-transform duration-200 ease-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          boxShadow: mobileMenuOpen ? 'var(--shadow-xl)' : 'none',
        }}
      >
        {/* Close button */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <Logo size="md" showTagline={false} />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer"
            style={{ color: 'var(--sidebar-text)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-surface)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={17} />
          </button>
        </div>

        <SidebarContent
          onNavClick={() => setMobileMenuOpen(false)}
          user={user}
          handleLogout={handleLogout}
          navigate={navigate}
        />
      </aside>

      {/* ─── Main Column (right of sidebar) ───────────────────── */}
      <div
        className="flex-1 flex flex-col h-full overflow-hidden min-w-0"
        style={{ marginLeft: 0 }}
      >
        {/* On desktop, offset from sidebar */}
        <style>{`
          @media (min-width: 768px) {
            .main-column { margin-left: 242px; }
          }
        `}</style>
        <div className="main-column flex-1 flex flex-col h-full overflow-hidden min-w-0">

          {/* ─── Glass Topbar ───────────────────────────────────── */}
          <header className="saarth-topbar">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer md:hidden"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Menu size={18} />
              </button>

              <VehicleSwitcher />
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Add Refill CTA */}
              <button
                onClick={() => navigate('/fuel/add')}
                className="saarth-btn saarth-btn-primary saarth-btn-sm hidden sm:flex"
              >
                <Plus size={13} />
                <span>Add Refill</span>
              </button>
              <button
                onClick={() => navigate('/fuel/add')}
                className="saarth-btn saarth-btn-primary sm:hidden"
                style={{ padding: '7px 10px' }}
              >
                <Plus size={14} />
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  title="Notifications"
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Bell size={16} />
                  <span
                    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                </button>
                {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
              </div>

              <ThemeToggle />
            </div>
          </header>

          {/* ─── Scrollable Page Body ─────────────────────────── */}
          <main
            className="flex-1 overflow-y-auto"
            style={{ paddingBottom: '80px' }}
          >
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </div>
          </main>

          {/* ─── Mobile Bottom Navigation ─────────────────────── */}
          <nav className="saarth-mobile-nav md:hidden">
            {navItems.slice(0, 5).map(({ icon: Icon, label, to }) => {
              const isActive = location.pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
