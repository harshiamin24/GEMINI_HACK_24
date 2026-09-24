import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatsCard from '../components/StatsCard';
import RouteMap from '../components/RouteMap';
import HubGrid from '../components/HubGrid';
import {
  Leaf,
  Building2,
  Bike,
  PackageCheck,
  Zap,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard({ onOpenAIAdvisor }) {
  const [metrics, setMetrics] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, hubsData, routesData] = await Promise.all([
        api.getDashboardMetrics(),
        api.getHubs(),
        api.getRoutes({ status: 'active' }),
      ]);
      setMetrics(metricsData);
      setHubs(hubsData.hubs || []);
      setRoutes(routesData.routes || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Fleet Operations Command</h1>
          <p className="text-sm text-slate-400">
            Real-time urban micro-hub allocation & zero-emission cargo bike telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/routing"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <Zap className="w-4 h-4" />
            <span>Plan AI Delivery Routes</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Daily Carbon Avoided"
          value={`${metrics?.today?.carbonSavedKg || '29.1'} kg`}
          subvalue="vs. Diesel Van Baseline (0.21 kg/km)"
          trend="+18.4% this week"
          trendPositive={true}
          icon={Leaf}
          colorScheme="emerald"
          badgeText="Net Zero"
        />

        <StatsCard
          title="Micro-Hub Occupancy"
          value={`${metrics?.hubs?.avgOccupancy || '42'}%`}
          subvalue={`${metrics?.hubs?.total || 4} Active Hubs • ${metrics?.hubs?.totalChargingStations || 23} Stalls`}
          icon={Building2}
          colorScheme="cyan"
          badgeText="Balanced"
        />

        <StatsCard
          title="Active Cargo Fleet"
          value={`${metrics?.fleet?.inTransit || 4} / ${metrics?.fleet?.total || 12}`}
          subvalue={`Avg Battery SOC: ${metrics?.fleet?.avgBattery || 84}%`}
          trend={`${metrics?.fleet?.available || 6} Available`}
          trendPositive={true}
          icon={Bike}
          colorScheme="amber"
          badgeText="E-Mobility"
        />

        <StatsCard
          title="Parcels Pre-Positioned"
          value={`${metrics?.parcels?.total || 12}`}
          subvalue={`${metrics?.parcels?.delivered || 2} Delivered • ${metrics?.parcels?.inTransit || 2} In Transit`}
          trend="97.2% On-Time"
          trendPositive={true}
          icon={PackageCheck}
          colorScheme="purple"
          badgeText="Sorted"
        />
      </div>

      {/* Interactive Map & Telemetry Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-base text-white">Live Geospatial Network</h3>
            </div>
            <Link
              to="/routing"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Open Full Routing Engine <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <RouteMap hubs={hubs} routes={routes} height="420px" />
        </div>

        {/* Gemini Logistics AI Advisor Banner & Quick Dispatch */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Advisor Ready
                </span>
              </div>

              <h4 className="text-lg font-bold text-white mb-2">Off-Peak Pre-Positioning Active</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Gemini AI recommends shifting <strong className="text-emerald-400">3 bulk parcels</strong> from Downtown Sorting to <strong>Midtown Distribution Point</strong> before the 08:30 congestion window to maximize bike battery range.
              </p>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Projected CO₂ Savings:</span>
                  <span className="text-emerald-400 font-mono font-bold">+8.4 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Van Congestion Avoidance:</span>
                  <span className="text-white font-mono font-bold">42 mins</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={onOpenAIAdvisor}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Consult Gemini AI Logistics Advisor</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <Link
                to="/inventory"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 text-center"
              >
                Inspect Parcel Intake Matrix
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decentralized Micro-Hubs Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">Decentralized Micro-Hub Operations</h3>
            <p className="text-xs text-slate-400">Current storage occupancy and charging telemetry across urban zones</p>
          </div>
          <Link
            to="/hubs"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            Manage All Hubs <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <HubGrid hubs={hubs} />
      </div>
    </div>
  );
}
