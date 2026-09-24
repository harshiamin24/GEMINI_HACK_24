import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, Bell, Shield, User, LogOut, Zap, Bike } from 'lucide-react';

export default function Navbar({ onOpenAIAdvisor }) {
  const { profile, logout, isDispatcher, isAdmin, isRider } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'dispatcher':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'rider':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
      {/* Brand & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <Bike className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">UrbanLogix</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded uppercase tracking-wider">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Decentralized Micro-Hub & E-Cargo Bike Fleet</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-400">Gemini 2.5 Active</span>
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-3">
        {/* Gemini AI Advisor Trigger Button */}
        <button
          onClick={onOpenAIAdvisor}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all shadow-sm hover:shadow-emerald-500/10 group cursor-pointer"
          title="Open AI Logistics Advisor"
        >
          <Bot className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium hidden sm:inline">Ask AI Advisor</span>
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
        </button>

        {/* User Session Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{profile?.full_name || 'Operations Lead'}</p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span
                className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getRoleBadge(
                  profile?.role || 'admin'
                )}`}
              >
                {profile?.role || 'Admin'}
              </span>
              <span className="text-[10px] text-slate-500">Metro Green</span>
            </div>
          </div>

          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
            {profile?.full_name ? profile.full_name.charAt(0) : 'U'}
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
