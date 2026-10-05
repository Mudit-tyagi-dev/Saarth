/**
 * Settings Page
 * User profile, garage overview, notification preferences, units & themes, privacy, and signout
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Car,
  Bell,
  Sliders,
  ShieldCheck,
  LogOut,
  Edit2,
  Save,
  Check,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useVehicleStore } from '../store/vehicleStore';
import { useThemeStore } from '../store/themeStore';
import { Button, FormField, Input, Badge, GlassCard, PageHeader } from '../components/ui';
import { getInitials } from '../lib/utils';

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-teal-600 dark:text-teal-400" />}
        <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
      )}
      <GlassCard className="overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {children}
      </GlassCard>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-5">
      <div className="pr-4">
        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          {label}
        </div>
        {description && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
          checked ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuthStore();
  const { vehicles } = useVehicleStore();
  const { theme, setTheme } = useThemeStore();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    fuelInsights: true,
    maintenance: true,
    monthlySummary: true,
  });

  const handleSaveProfile = () => {
    updateProfile({ name: profileName });
    setEditingProfile(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Settings"
        description="Account preferences, garage configuration, notification alerts, and theme preferences."
      />

      {/* ─── Profile Section ───────────────────────────────────── */}
      <SettingsSection
        icon={User}
        title="Driver Profile"
        description="Manage your account name and email address"
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                {getInitials(user?.name || 'Driver')}
              </div>
              <div>
                <div className="font-extrabold text-base text-slate-900 dark:text-white">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
                </div>
              </div>
            </div>

            {editingProfile ? (
              <div className="space-y-3 w-full sm:w-auto">
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your Name"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" icon={Save} onClick={handleSaveProfile}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileName(user?.name || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                icon={Edit2}
                onClick={() => setEditingProfile(true)}
              >
                Edit Name
                {saved && <Check size={14} className="text-emerald-600 ml-1.5" />}
              </Button>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* ─── Vehicles Section ──────────────────────────────────── */}
      <SettingsSection
        icon={Car}
        title="Registered Garage"
        description="Vehicles configured for tracking and telemetry"
      >
        <div className="p-4 sm:p-5 space-y-3">
          {vehicles.length === 0 ? (
            <div className="text-xs text-slate-400 py-2">No vehicles registered yet.</div>
          ) : (
            vehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => navigate(`/vehicles/${v.id}`)}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {v.name}
                  </span>
                  <div className="text-[11px] text-slate-400">
                    {v.registrationNumber || v.vehicleNumber} • {v.model}
                  </div>
                </div>
                <Badge variant="teal">{v.fuelType}</Badge>
              </div>
            ))
          )}

          <div className="pt-2">
            <Button size="sm" variant="outline" onClick={() => navigate('/vehicles/add')}>
              + Add Vehicle
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* ─── Notifications Section ─────────────────────────────── */}
      <SettingsSection
        icon={Bell}
        title="Notifications & Alerts"
        description="Configure in-app vehicle telemetry and efficiency triggers"
      >
        <ToggleRow
          label="Efficiency & Mileage Drop Alerts"
          description="In-app alerts when refill mileage is significantly below historical average"
          checked={notifications.fuelInsights}
          onChange={(v) => setNotifications((p) => ({ ...p, fuelInsights: v }))}
        />
        <ToggleRow
          label="Scheduled Maintenance Reminders"
          description="Alerts when vehicle odometer approaches periodic service targets"
          checked={notifications.maintenance}
          onChange={(v) => setNotifications((p) => ({ ...p, maintenance: v }))}
        />
        <ToggleRow
          label="Monthly Fuel Summary"
          description="Monthly budget overview and consumption trend digest"
          checked={notifications.monthlySummary}
          onChange={(v) => setNotifications((p) => ({ ...p, monthlySummary: v }))}
        />
      </SettingsSection>

      {/* ─── Preferences & Theme ───────────────────────────────── */}
      <SettingsSection
        icon={Sliders}
        title="Preferences & Units"
        description="Interface appearance and telemetry standard units"
      >
        {/* Theme Picker */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Interface Theme
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Choose your visual appearance
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Sun size={13} className="text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#0B192C] text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon size={13} className="text-teal-400" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 sm:p-5">
          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
            Currency
          </span>
          <span className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400">
            ₹ INR (Indian Rupee)
          </span>
        </div>

        <div className="flex items-center justify-between p-4 sm:p-5">
          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
            Distance Unit
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            Kilometres (km)
          </span>
        </div>

        <div className="flex items-center justify-between p-4 sm:p-5">
          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
            Fuel Volume Unit
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            Litres (L)
          </span>
        </div>
      </SettingsSection>

      {/* ─── Privacy & Data Storage ────────────────────────────── */}
      <SettingsSection
        icon={ShieldCheck}
        title="Privacy & Data Storage"
        description="Neon PostgreSQL encrypted cloud storage"
      >
        <div className="p-4 sm:p-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Your vehicles, refill logs, odometer readings, and maintenance records are securely stored and synced in your private PostgreSQL instance with industry-standard bcrypt encryption.
        </div>
      </SettingsSection>

      {/* ─── Account / Signout ─────────────────────────────────── */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition cursor-pointer"
        >
          <LogOut size={15} />
          <span>Sign Out of SAARTH</span>
        </button>
      </div>
    </div>
  );
}
