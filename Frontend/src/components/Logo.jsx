/**
 * Reusable SAARTH Logo Slot / Component
 * Clean brand slot with stylized wordmark and tagline slot.
 * User can drop in official SVG asset or image file directly.
 */
import React from 'react';

export default function Logo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showTagline = false,
  className = '',
}) {
  const sizeConfig = {
    sm: {
      mark: 'w-7 h-7 text-xs',
      text: 'text-base',
      tagline: 'text-[9px]',
      gap: 'gap-2',
    },
    md: {
      mark: 'w-8 h-8 text-sm',
      text: 'text-lg',
      tagline: 'text-[10px]',
      gap: 'gap-2.5',
    },
    lg: {
      mark: 'w-10 h-10 text-base',
      text: 'text-xl',
      tagline: 'text-xs',
      gap: 'gap-3',
    },
    xl: {
      mark: 'w-12 h-12 text-lg',
      text: 'text-2xl',
      tagline: 'text-xs',
      gap: 'gap-3.5',
    },
  }[size] || {
    mark: 'w-8 h-8 text-sm',
    text: 'text-lg',
    tagline: 'text-[10px]',
    gap: 'gap-2.5',
  };

  return (
    <div className={`flex items-center ${sizeConfig.gap} select-none ${className}`}>
      {/* Brand Icon / Symbol Slot */}
      <div
        className={`${sizeConfig.mark} rounded-xl bg-gradient-to-tr from-slate-900 via-teal-900 to-teal-600 dark:from-slate-950 dark:via-teal-950 dark:to-teal-500 text-white flex items-center justify-center font-black shadow-xs border border-white/10 flex-shrink-0`}
      >
        <span className="tracking-tighter font-extrabold text-teal-400">S</span>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1">
          <span
            className={`font-black tracking-tight text-slate-900 dark:text-white ${sizeConfig.text}`}
            style={{ letterSpacing: '-0.03em' }}
          >
            SAARTH
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mb-0.5"></span>
        </div>
        {showTagline && (
          <span
            className={`font-medium tracking-wide text-slate-500 dark:text-slate-400 ${sizeConfig.tagline}`}
          >
            Your Vehicle Intelligence Buddy
          </span>
        )}
      </div>
    </div>
  );
}
