/**
 * Notification Dropdown
 * Real in-app alerts with theme-aware styling and clean interactions
 */
import React, { useEffect, useState, useRef } from 'react';
import { Bell, Fuel, Wrench, AlertTriangle, Info, Check } from 'lucide-react';
import { getNotifications, markNotificationRead } from '../services/notification.service';
import { formatDateShort } from '../lib/utils';

const iconConfig = {
  mileage: {
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
  },
  maintenance: {
    icon: Wrench,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
  },
  monthly: {
    icon: Fuel,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  info: {
    icon: Info,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/50',
  },
};

export default function NotificationDropdown({ onClose }) {
  const [notifs, setNotifs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef();

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setIsLoading(true);
      const data = await getNotifications();
      setNotifs(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const handleMarkOne = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAll = async () => {
    const unread = notifs.filter((n) => !n.isRead);
    for (const n of unread) {
      try {
        await markNotificationRead(n.id);
      } catch (err) {
        // ignore
      }
    }
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <div
      ref={ref}
      className="absolute top-12 right-0 w-80 sm:w-96 bg-white dark:bg-[#0F1B33] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-full px-2 py-0.5 text-[10px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {isLoading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading updates...</div>
        ) : notifs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <Bell size={22} className="text-slate-300 dark:text-slate-600" />
            <span>No notifications</span>
          </div>
        ) : (
          notifs.map((n) => {
            const config = iconConfig[n.type] || iconConfig.info;
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkOne(n.id)}
                className={`p-3.5 sm:p-4 flex items-start gap-3 transition cursor-pointer ${
                  n.isRead
                    ? 'bg-white dark:bg-[#0F1B33] opacity-75'
                    : 'bg-teal-50/40 dark:bg-teal-950/20'
                } hover:bg-slate-50 dark:hover:bg-slate-800/40`}
              >
                <div
                  className={`w-8 h-8 rounded-xl ${config.bg} ${config.color} flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {n.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {n.message}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                    {formatDateShort(n.createdAt)}
                  </div>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
