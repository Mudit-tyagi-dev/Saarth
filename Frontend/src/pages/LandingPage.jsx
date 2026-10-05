/**
 * SAARTH Landing Page
 * Apple-like whitespace, Linear simplicity, controlled hero product preview, and dark/light support
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Fuel,
  TrendingUp,
  BarChart2,
  Wrench,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Gauge,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import Logo from '../components/Logo';
import { ThemeToggle } from '../components/ui';

const features = [
  {
    icon: Fuel,
    title: 'Fuel Intelligence',
    description:
      'Log refills in seconds. Compute estimated volume, expenditure trends, and running consumption automatically.',
  },
  {
    icon: TrendingUp,
    title: 'Mileage Intelligence',
    description:
      'Real distance-to-volume telemetry. Compare consecutive refills without false estimates or fabricated figures.',
  },
  {
    icon: BarChart2,
    title: 'Running Cost / KM',
    description:
      'Know what every kilometre costs you to drive. Monitor monthly budgets and cost per km with zero friction.',
  },
  {
    icon: Wrench,
    title: 'Preventive Care',
    description:
      'Keep service logs, track periodic intervals, and catch efficiency drops before they become expensive repairs.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#091122] text-slate-900 dark:text-slate-100 selection:bg-teal-500 selection:text-white transition-colors duration-200">
      {/* ─── Top Navigation ────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#091122]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Logo size="md" showTagline={true} />
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Ambient Subtle Glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-teal-500/10 via-emerald-500/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/40 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-6">
            <Sparkles size={13} className="text-teal-600 dark:text-teal-400" />
            <span>Your Vehicle Intelligence Buddy</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] mb-5">
            Don't just track your vehicle.{' '}
            <span className="text-teal-600 dark:text-teal-400">
              Understand it.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
            SAARTH turns everyday vehicle data into useful insights about fuel, mileage, running costs and maintenance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition transform active:scale-95 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#0F1B33] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-800 shadow-2xs transition cursor-pointer"
            >
              <span>Explore Dashboard</span>
            </button>
          </div>

          {/* ─── Controlled Product Preview Card ─────────────────── */}
          <div className="relative mx-auto max-w-3xl rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0F1B33]/95 p-5 sm:p-7 shadow-xl backdrop-blur-md text-left">
            {/* Top Preview Bar */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
                  🚗
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Swift ZXi+
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    UP16XX1234 • Petrol
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
              </span>
            </div>

            {/* Metric KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1324] border border-slate-100 dark:border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Average Mileage
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  13.8 <span className="text-xs font-semibold text-slate-400">km/L</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1324] border border-slate-100 dark:border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Cost / KM
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  ₹7.24
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1324] border border-slate-100 dark:border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Monthly Spend
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  ₹4,850
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1324] border border-slate-100 dark:border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Fuel Events
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  12
                </div>
              </div>
            </div>

            {/* Signature Insight Preview */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 via-white to-slate-50 dark:from-teal-950/30 dark:via-[#0F1B33] dark:to-slate-900/40 border border-teal-200/60 dark:border-teal-800/40 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-teal-600 text-white shadow-xs">
                <Sparkles size={15} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  SAARTH INSIGHT
                </span>
                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  "Your vehicle is running consistently at 13.8 km/L."
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Regular tyre pressure checks maintain optimal running efficiency.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ──────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#0A1324] border-t border-slate-200/70 dark:border-slate-800/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Vehicle intelligence, made useful.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Simple telemetry inputs translated into real mileage, accurate running costs, and maintenance predictions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50/70 dark:bg-[#0F1B33]/60 border border-slate-100 dark:border-slate-800/80 hover:border-teal-500/30 dark:hover:border-teal-500/30 transition-all duration-150"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold mb-4 shadow-2xs">
                    <Icon size={19} />
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="py-8 bg-[#F8FAFC] dark:bg-[#060B17] border-t border-slate-200/70 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" showTagline={true} />
          <div>© {new Date().getFullYear()} SAARTH · Your Vehicle Intelligence Buddy.</div>
        </div>
      </footer>
    </div>
  );
}
