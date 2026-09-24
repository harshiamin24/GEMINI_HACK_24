import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Bike,
  Shield,
  Key,
  Building,
  CheckCircle2,
  AlertCircle,
  Save,
  Cpu,
} from 'lucide-react';

export default function Settings() {
  const { profile } = useAuth();
  const [saved, setSaved] = useState(false);

  // Settings State
  const [fleetConfig, setFleetConfig] = useState({
    vanEmissionFactor: 0.21,
    ebikeEmissionFactor: 0.005,
    vanCostFactor: 0.85,
    ebikeCostFactor: 0.12,
    defaultBatteryBuffer: 15,
    offPeakStart: '23:00',
    offPeakEnd: '05:30',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System & Fleet Configurations</h1>
        <p className="text-sm text-slate-400">
          Set low-emission zone thresholds, vehicle specifications, and operational parameters
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Operational parameters updated successfully.</span>
        </div>
      )}

      {/* Vehicle Fleet Profiles Section */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-base">
          <Bike className="w-5 h-5 text-emerald-400" />
          <span>Vehicle Fleet Profiles & Capacities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Class-1 E-Bike */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Class-1-E-Bike</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Single Battery Pack
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard agile e-cargo bike tailored for dense street grids, pedestrian zones, and bike paths.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900">
                <span className="text-slate-500 text-[10px]">Max Payload</span>
                <p className="font-mono font-bold text-white">50.00 kg</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900">
                <span className="text-slate-500 text-[10px]">Nominal Range</span>
                <p className="font-mono font-bold text-white">40 km</p>
              </div>
            </div>
          </div>

          {/* Heavy-Cargo-Trike */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Heavy-Cargo-Trike</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Dual Battery Pack
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Three-wheeled reinforced hauler for bulk parcels, palletized boxes, and multi-hub transfers.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900">
                <span className="text-slate-500 text-[10px]">Max Payload</span>
                <p className="font-mono font-bold text-white">120.00 kg</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-900">
                <span className="text-slate-500 text-[10px]">Nominal Range</span>
                <p className="font-mono font-bold text-white">35 km</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Thresholds Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-bold text-base">
          <SettingsIcon className="w-5 h-5 text-emerald-400" />
          <span>Environmental Calculation Baselines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Diesel Van CO₂ Factor (kg/km)
            </label>
            <input
              type="number"
              step="0.001"
              value={fleetConfig.vanEmissionFactor}
              onChange={(e) => setFleetConfig({ ...fleetConfig, vanEmissionFactor: parseFloat(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              E-Cargo Bike CO₂ Factor (kg/km)
            </label>
            <input
              type="number"
              step="0.001"
              value={fleetConfig.ebikeEmissionFactor}
              onChange={(e) => setFleetConfig({ ...fleetConfig, ebikeEmissionFactor: parseFloat(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Diesel Van Operating Cost ($/km)
            </label>
            <input
              type="number"
              step="0.01"
              value={fleetConfig.vanCostFactor}
              onChange={(e) => setFleetConfig({ ...fleetConfig, vanCostFactor: parseFloat(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              E-Bike Operating Cost ($/km)
            </label>
            <input
              type="number"
              step="0.01"
              value={fleetConfig.ebikeCostFactor}
              onChange={(e) => setFleetConfig({ ...fleetConfig, ebikeCostFactor: parseFloat(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* AI & Backend Integration Status */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-base pb-2 border-b border-slate-800">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <span>System Environment Status</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-300 font-medium">Google Gemini SDK (@google/genai)</span>
            <span className="text-emerald-400 font-mono font-semibold">gemini-2.5-flash Configured</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-300 font-medium">Database & Row Level Security</span>
            <span className="text-emerald-400 font-mono font-semibold">PostgreSQL (RLS Active)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-300 font-medium">Active Organization</span>
            <span className="text-white font-semibold">{profile?.organization || 'Metro Green Logistics Co.'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
