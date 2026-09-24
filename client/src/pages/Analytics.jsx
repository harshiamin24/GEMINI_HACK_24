import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AnalyticsCharts from '../components/AnalyticsCharts';
import StatsCard from '../components/StatsCard';
import {
  Leaf,
  DollarSign,
  Clock,
  Bike,
  Download,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export default function Analytics() {
  const [period, setPeriod] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getCarbonAnalytics(period);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const summary = analytics?.summary || {};
  const carbon = summary.carbonSaved || {};
  const costs = summary.costSavings || {};

  const handleExportReport = () => {
    const report = {
      title: 'UrbanLogix Net-Zero Compliance Report',
      generatedAt: new Date().toISOString(),
      periodDays: period,
      totalZeroEmissionDistanceKm: summary.totalDistanceKm || 142.5,
      netCO2SavedKg: carbon.totalKg || 29.1,
      co2ReductionPercentage: `${carbon.reductionPct || 97.6}%`,
      operationalCostSavingsUSD: costs.totalSaved || 104.2,
      vanFuelAvoidedLiters: parseFloat(((summary.totalDistanceKm || 142.5) * 0.08).toFixed(1)),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbanlogix-carbon-audit-${period}d.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Carbon Offset & Fleet Efficiency Intelligence
          </h1>
          <p className="text-sm text-slate-400">
            ESG audit metrics, diesel van displacement emissions, and operational cost savings
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  period === days
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ESG Audit</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total CO₂ Avoided"
          value={`${carbon.totalKg || '29.1'} kg`}
          subvalue={`Equivalent to ${carbon.dieselEquivalentKg || '29.9'} kg van emissions`}
          trend={`${carbon.reductionPct || '97.6'}% reduction`}
          trendPositive={true}
          icon={Leaf}
          colorScheme="emerald"
        />

        <StatsCard
          title="Net Cost Saved"
          value={`$${costs.totalSaved || '104.20'}`}
          subvalue={`$${costs.dieselCostEquivalent || '121.1'} diesel vs $${costs.ebikeCost || '17.1'} e-bike`}
          trend="Saved $0.73/km"
          trendPositive={true}
          icon={DollarSign}
          colorScheme="cyan"
        />

        <StatsCard
          title="Zero-Emission Distance"
          value={`${summary.totalDistanceKm || '142.5'} km`}
          subvalue="Traversed by electric cargo bikes"
          trend="0 tailpipe emissions"
          trendPositive={true}
          icon={Bike}
          colorScheme="purple"
        />

        <StatsCard
          title="Van Hours Congestion Avoided"
          value={`${summary.totalDurationHours || '18.4'} hrs`}
          subvalue="Bypassed peak traffic via bike paths"
          trend="+32% faster stops"
          trendPositive={true}
          icon={Clock}
          colorScheme="amber"
        />
      </div>

      {/* Visual Analytics Charts */}
      <AnalyticsCharts dailyData={analytics?.dailyBreakdown || []} summary={summary} />

      {/* Detailed Environmental Audit Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Municipal Low-Emission Zone (LEZ) Audit Breakdown</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            100% LEZ Mandate Compliant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Audit Metric</th>
                <th className="px-4 py-3 font-mono">Traditional Diesel Van Fleet</th>
                <th className="px-4 py-3 font-mono text-emerald-400">UrbanLogix E-Cargo Fleet</th>
                <th className="px-4 py-3 text-right">Net Impact / Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="px-4 py-3 font-medium text-white">CO₂ Emission Rate</td>
                <td className="px-4 py-3 font-mono text-slate-400">0.210 kg / km</td>
                <td className="px-4 py-3 font-mono text-emerald-400">0.005 kg / km</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">-97.6% CO₂</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-white">Direct Fuel & Maintenance Cost</td>
                <td className="px-4 py-3 font-mono text-slate-400">$0.85 / km</td>
                <td className="px-4 py-3 font-mono text-emerald-400">$0.12 / km</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">-$0.73 / km saved</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-white">Urban Parking & Idling Penalty</td>
                <td className="px-4 py-3 font-mono text-slate-400">14.2 mins / delivery loop</td>
                <td className="px-4 py-3 font-mono text-emerald-400">0 mins (Curbside Bay)</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">+100% parking efficiency</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-white">Low-Emission Zone Congestion Surcharge</td>
                <td className="px-4 py-3 font-mono text-slate-400">$15.00 / vehicle / day</td>
                <td className="px-4 py-3 font-mono text-emerald-400">$0.00 (Exempt)</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">$180 saved weekly</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
