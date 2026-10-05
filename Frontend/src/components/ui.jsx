/**
 * SAARTH Shared UI Component System
 * Apple + Linear + Modern Automotive SaaS design language
 * Full Light / Dark mode support with persistent tokens
 */
import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Car,
  Bike,
  Fuel,
  ChevronRight,
  AlertCircle,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { formatDateShort, formatCurrency } from '../lib/utils';

/* ─── ThemeToggle Button ────────────────────────────────────────── */
export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
    </button>
  );
}

/* ─── GlassCard / Surface Card ─────────────────────────────────── */
export function GlassCard({ children, className = '', hover = false, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-white dark:bg-[#0F1B33] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs transition-all duration-150 ${
        hover
          ? 'hover:border-teal-500/40 dark:hover:border-teal-500/40 hover:shadow-md cursor-pointer hover:-translate-y-0.5'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── StatCard (Refined Asymmetrical KPI) ────────────────────────── */
export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  trendLabel,
  color = 'teal',
  featured = false,
  onClick,
}) {
  const colorMap = {
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-100 dark:border-teal-900/30',
    },
    navy: {
      bg: 'bg-slate-100 dark:bg-slate-800/60',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700/50',
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-100 dark:border-orange-900/30',
    },
  };

  const c = colorMap[color] || colorMap.teal;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white dark:bg-[#0F1B33] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-xs transition-all duration-150 ${
        featured
          ? 'bg-gradient-to-br from-white via-slate-50/50 to-teal-50/30 dark:from-[#0F1B33] dark:via-[#11203E] dark:to-teal-950/20 border-teal-500/30 dark:border-teal-500/30'
          : ''
      } ${onClick ? 'hover:shadow-md hover:border-teal-500/40 cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center font-bold`}>
          {Icon && <Icon size={19} />}
        </div>

        {trend !== undefined && trend !== null && (
          <div
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              trend > 0
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : trend < 0
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>

      <div>
        <div
          className={`font-black text-slate-900 dark:text-white tracking-tight flex items-baseline ${
            featured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
          }`}
        >
          {value !== null && value !== undefined && value !== '' ? value : '—'}
          {unit && (
            <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 ml-1.5">
              {unit}
            </span>
          )}
        </div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{label}</div>
        {trendLabel && (
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── VehicleCard ───────────────────────────────────────────────── */
export function VehicleCard({ vehicle, selected, onClick }) {
  const isBike = vehicle.vehicleType === 'Bike' || vehicle.type === 'Bike';
  const VehicleIcon = isBike ? Bike : Car;

  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center gap-4 ${
        selected
          ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
          : 'bg-white dark:bg-[#0F1B33] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          selected
            ? 'bg-teal-600 text-white shadow-xs'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
        }`}
      >
        <VehicleIcon size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 dark:text-white text-base truncate">
            {vehicle.name}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
            {vehicle.fuelType}
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
          <span>{vehicle.registrationNumber || vehicle.vehicleNumber}</span>
          <span>•</span>
          <span>
            {Number(vehicle.currentOdometer || vehicle.odometer || 0).toLocaleString('en-IN')} km
          </span>
        </div>
      </div>

      <ChevronRight size={18} className={selected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-300 dark:text-slate-600'} />
    </div>
  );
}

/* ─── FuelEventCard ─────────────────────────────────────────────── */
export function FuelEventCard({ event, compact = false }) {
  return (
    <div
      className={`bg-white dark:bg-[#0F1B33] border border-slate-100 dark:border-slate-800/70 rounded-xl flex items-center gap-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
        compact ? 'p-3.5' : 'p-4 sm:p-5'
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
        <Fuel size={19} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-900 dark:text-white">Refill Event</span>
          {event.station && (
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
              • {event.station}
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {formatDateShort(event.occurredAt || event.date)} •{' '}
          {Number(event.odometer || 0).toLocaleString('en-IN')} km
          {event.estimatedVolume && (
            <span className="ml-2 font-medium text-slate-600 dark:text-slate-300">
              ({event.estimatedVolume} L est.)
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
          {formatCurrency(event.amount || event.amountPaid)}
        </div>
        {event.mileage ? (
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {Number(event.mileage).toFixed(1)} km/L
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Refill logged</div>
        )}
      </div>
    </div>
  );
}

/* ─── Signature SAARTH Insight Card ─────────────────────────────── */
export function InsightCard({
  title = 'SAARTH INSIGHT',
  headline,
  message,
  tip,
  type = 'info',
}) {
  const config = {
    positive: {
      bg: 'bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/5 dark:from-emerald-950/30 dark:via-[#0F1B33] dark:to-teal-950/20',
      border: 'border-emerald-500/30 dark:border-emerald-500/30',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-500/10 via-white to-orange-500/5 dark:from-amber-950/30 dark:via-[#0F1B33] dark:to-orange-950/20',
      border: 'border-amber-500/30 dark:border-amber-500/30',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    info: {
      bg: 'bg-gradient-to-br from-teal-500/10 via-white to-slate-50 dark:from-teal-950/30 dark:via-[#0F1B33] dark:to-slate-900/40',
      border: 'border-teal-500/30 dark:border-teal-500/30',
      badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
      icon: Sparkles,
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
  }[type] || {
    bg: 'bg-gradient-to-br from-teal-500/10 via-white to-slate-50 dark:from-teal-950/30 dark:via-[#0F1B33] dark:to-slate-900/40',
    border: 'border-teal-500/30 dark:border-teal-500/30',
    badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
    icon: Sparkles,
    iconColor: 'text-teal-600 dark:text-teal-400',
  };

  const Icon = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-xs ${config.bg} ${config.border}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-xs ${config.iconColor}`}>
            <Icon size={15} />
          </div>
          <span className="font-black text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200">
            {title}
          </span>
        </div>
        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${config.badgeBg}`}>
          Intelligence
        </span>
      </div>

      {headline && (
        <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5">
          {headline}
        </h4>
      )}

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>

      {tip && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="font-bold text-slate-700 dark:text-slate-200">Recommendation:</span>
          <span>{tip}</span>
        </div>
      )}
    </div>
  );
}

/* ─── EmptyState ────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
        {Icon ? <Icon size={26} /> : <Info size={26} />}
      </div>
      <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Plus size={15} />
          <span>{actionLabel || 'Get Started'}</span>
        </button>
      )}
    </div>
  );
}

/* ─── LoadingSkeleton ────────────────────────────────────────────── */
export function LoadingSkeleton({ rows = 3, height = 24, className = '' }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{ height }}
          className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-xl"
        />
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 24, color = '#0D9488' }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        style={{
          width: size,
          height: size,
          border: `2.5px solid #e2e8f0`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── PageHeader ────────────────────────────────────────────────── */
export function PageHeader({ title, description, action, badge }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/* ─── Badge ─────────────────────────────────────────────────────── */
export function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    teal: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/30',
    blue: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/30',
    green: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/30',
    orange: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/30',
    red: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/30',
  };
  const s = styles[variant] || styles.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s}`}>
      {children}
    </span>
  );
}

/* ─── Button ─────────────────────────────────────────────────────── */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  type = 'button',
  fullWidth,
  icon: Icon,
  className = '',
}) {
  const variants = {
    primary:
      'bg-teal-600 hover:bg-teal-700 text-white shadow-xs',
    secondary:
      'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100',
    outline:
      'border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
    ghost:
      'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {Icon && <Icon size={16} />}
      <span>{children}</span>
    </button>
  );
}

/* ─── FormField ─────────────────────────────────────────────────── */
export function FormField({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </span>
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
      {error && <p className="text-[11px] font-semibold text-rose-500">{error}</p>}
    </div>
  );
}

export function Input({ error, className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white bg-white dark:bg-[#0A1324] placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:ring-2 ${
        error
          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
          : 'border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20'
      } ${className}`}
    />
  );
}

export function Select({ error, children, className = '', ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white bg-white dark:bg-[#0A1324] outline-none transition focus:ring-2 cursor-pointer ${
        error
          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
          : 'border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20'
      } ${className}`}
    >
      {children}
    </select>
  );
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white bg-white dark:bg-[#0A1324] placeholder-slate-400 dark:placeholder-slate-600 outline-none transition focus:ring-2 resize-y min-h-[80px] ${
        error
          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
          : 'border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20'
      } ${className}`}
    />
  );
}

/* ─── Modal ─────────────────────────────────────────────────────── */
export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full ${maxWidth} bg-white dark:bg-[#0F1B33] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden`}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
