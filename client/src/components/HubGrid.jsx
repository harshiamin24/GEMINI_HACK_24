import React from 'react';
import { Building2, BatteryCharging, Bike, Package, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HubGrid({ hubs = [], onSelectHub }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {hubs.map((hub) => {
        const capacity = Number(hub.storage_capacity_m3) || 40;
        const current = Number(hub.current_occupancy_m3) || 0;
        const occupancyPct = Math.min(100, Math.round((current / capacity) * 100));

        const bikes = hub.cargo_bikes || [];
        const availableBikes = bikes.filter((b) => b.status === 'available').length;

        const getZoneColor = (zone) => {
          switch (zone) {
            case 'Core-Downtown':
              return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'Midtown-North':
              return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'Riverside-District':
              return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
            case 'University-Zone':
              return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            default:
              return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
          }
        };

        return (
          <div
            key={hub.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 shadow-lg group flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm line-clamp-1">{hub.name}</h4>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getZoneColor(
                        hub.zone
                      )}`}
                    >
                      {hub.zone}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/routing?hubId=${hub.id}`}
                  className="text-slate-500 hover:text-emerald-400 transition-colors p-1"
                  title="Plan Routes From Here"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Storage Capacity Gauge */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    Storage Footprint
                  </span>
                  <span className="font-mono font-semibold text-slate-200">
                    {occupancyPct}% ({current} / {capacity} m³)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      occupancyPct > 85
                        ? 'bg-rose-500'
                        : occupancyPct > 65
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Charging & Fleet Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                    Charging Stalls
                  </span>
                  <p className="font-bold text-white font-mono mt-0.5">
                    {hub.charging_stations} Available
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <Bike className="w-3.5 h-3.5 text-emerald-400" />
                    Cargo Bikes
                  </span>
                  <p className="font-bold text-white font-mono mt-0.5">
                    {availableBikes} Ready / {bikes.length || 3}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                {Number(hub.latitude).toFixed(3)}, {Number(hub.longitude).toFixed(3)}
              </span>
              <button
                onClick={() => onSelectHub && onSelectHub(hub)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                Inspect Telemetry →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
