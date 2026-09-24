import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Package,
  Route,
  BarChart3,
  Bot,
  Settings,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/hubs', label: 'Micro-Hubs', icon: Building2 },
  { path: '/inventory', label: 'Inventory & Alloc.', icon: Package },
  { path: '/routing', label: 'Dynamic Routing', icon: Route },
  { path: '/analytics', label: 'Carbon Analytics', icon: BarChart3 },
  { path: '/ai-advisor', label: 'AI Logistics Advisor', icon: Bot, isHighlight: true },
  { path: '/settings', label: 'Settings & Fleet', icon: Settings },
];

export default function Sidebar({ onOpenAIAdvisor }) {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <nav className="p-4 space-y-1.5 flex-1">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
          Fleet Operations
        </p>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.isHighlight && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sustainability Quick Card */}
      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/20">
        <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Net-Zero Progress</span>
        </div>
        <p className="text-xs text-slate-300">
          Replaced <strong className="text-white font-bold">142 km</strong> of diesel van routes today.
        </p>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <span>CO₂ Saved</span>
          <span className="text-emerald-400 font-mono font-bold">+29.1 kg</span>
        </div>
      </div>
    </aside>
  );
}
