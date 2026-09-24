import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function AnalyticsCharts({ dailyData = [], summary = {} }) {
  const chartData = dailyData.map((d) => ({
    date: d.date?.slice(5) || d.date,
    carbonSavedKg: parseFloat(d.carbonSavedKg?.toFixed(2) || 0),
    dieselEquivalentKg: parseFloat(((d.distanceKm || 0) * 0.21).toFixed(2)),
    costSavingsUsd: parseFloat(d.costSavings?.toFixed(2) || 0),
    distanceKm: parseFloat(d.distanceKm?.toFixed(1) || 0),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-slate-300 mb-1">Date: {label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {entry.value} {entry.name.includes('Cost') ? '$' : entry.name.includes('Carbon') ? 'kg' : 'km'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Carbon Offset vs Diesel Van Emissions Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h4 className="text-base font-bold text-white">Daily Carbon Offsets vs. Diesel Van Baseline</h4>
            <p className="text-xs text-slate-400">
              Measured in kg CO₂ avoided through electric cargo bike replacement
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              Net Carbon Saved (kg)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-rose-500/60 inline-block"></span>
              Diesel Van Potential (kg)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="dieselEquivalentKg"
                name="Diesel Van Equivalent"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#roseGrad)"
              />
              <Area
                type="monotone"
                dataKey="carbonSavedKg"
                name="Carbon Saved by E-Bikes"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#emeraldGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Operational Cost Savings & Distance Traveled */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Savings Bar Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="mb-4">
            <h4 className="text-base font-bold text-white">Daily Operational Cost Savings ($)</h4>
            <p className="text-xs text-slate-400">
              Fuel & Maintenance differential ($0.85/km van vs $0.12/km cargo bike)
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="costSavingsUsd" name="Cost Savings ($)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distance Completed Bar Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="mb-4">
            <h4 className="text-base font-bold text-white">Fleet Delivery Distance (km)</h4>
            <p className="text-xs text-slate-400">
              Total zero-emission kilometers traversed across all 4 micro-hub zones
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="distanceKm"
                  name="Distance Traversed (km)"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#purpleGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
