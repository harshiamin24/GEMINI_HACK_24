import React from 'react';

export default function StatsCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  trendPositive = true,
  badgeText,
  colorScheme = 'emerald',
}) {
  const colorStyles = {
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      glow: 'shadow-emerald-500/5',
      badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      glow: 'shadow-cyan-500/5',
      badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      glow: 'shadow-amber-500/5',
      badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
      glow: 'shadow-purple-500/5',
      badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    },
  };

  const currentTheme = colorStyles[colorScheme] || colorStyles.emerald;

  return (
    <div
      className={`p-5 rounded-2xl bg-slate-900/80 border transition-all duration-300 hover:shadow-xl ${currentTheme.border} ${currentTheme.glow}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl ${currentTheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-mono">{value}</h3>
        {badgeText && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${currentTheme.badge}`}>
            {badgeText}
          </span>
        )}
      </div>

      {(subvalue || trend) && (
        <div className="flex items-center justify-between text-xs pt-1">
          {subvalue && <span className="text-slate-400">{subvalue}</span>}
          {trend && (
            <span
              className={`font-semibold ml-auto ${
                trendPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
