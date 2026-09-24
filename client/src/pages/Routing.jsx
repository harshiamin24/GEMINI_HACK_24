import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import RouteMap from '../components/RouteMap';
import {
  Route,
  Zap,
  CloudRain,
  Sun,
  Snowflake,
  Wind,
  Mountain,
  Battery,
  Bike,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Leaf,
  Navigation,
} from 'lucide-react';

const WEATHER_OPTIONS = [
  { value: 'Clear', label: 'Clear', icon: Sun, drainImpact: 'Normal (1.0x)' },
  { value: 'Rain', label: 'Rain', icon: CloudRain, drainImpact: '+15% battery drain' },
  { value: 'Snow', label: 'Snow', icon: Snowflake, drainImpact: '+25% battery drain' },
  { value: 'High Wind', label: 'High Wind', icon: Wind, drainImpact: '+10% battery drain' },
];

export default function Routing() {
  const [searchParams] = useSearchParams();
  const initialHubId = searchParams.get('hubId');

  const [hubs, setHubs] = useState([]);
  const [selectedHubId, setSelectedHubId] = useState(initialHubId || '');
  const [weatherCondition, setWeatherCondition] = useState('Clear');
  const [elevationFactor, setElevationFactor] = useState(1.2);
  const [minBatteryBuffer, setMinBatteryBuffer] = useState(15);
  const [optimizing, setOptimizing] = useState(false);
  const [generatedRoutes, setGeneratedRoutes] = useState([]);
  const [routingSummary, setRoutingSummary] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' or 'active'

  useEffect(() => {
    async function loadData() {
      try {
        const [hubsRes, routesRes] = await Promise.all([api.getHubs(), api.getRoutes()]);
        setHubs(hubsRes.hubs || []);
        if (!selectedHubId && hubsRes.hubs?.length > 0) {
          setSelectedHubId(hubsRes.hubs[0].id);
        }
        setSavedRoutes(routesRes.routes || []);
      } catch (err) {
        console.error('Failed to load routing data:', err);
      }
    }
    loadData();
  }, []);

  const handleOptimizeRoutes = async () => {
    if (!selectedHubId) return;
    try {
      setOptimizing(true);
      const res = await api.optimizeRoutes({
        hubId: selectedHubId,
        weatherCondition,
        elevationFactor: parseFloat(elevationFactor),
        minBatteryBuffer: parseInt(minBatteryBuffer, 10),
      });

      if (res.routes?.routes) {
        setGeneratedRoutes(res.routes.routes);
        setRoutingSummary(res.routes.summary);
      }
      // Refresh saved routes
      const updated = await api.getRoutes();
      setSavedRoutes(updated.routes || []);
    } catch (err) {
      alert(`Optimization failed: ${err.message}`);
    } finally {
      setOptimizing(false);
    }
  };

  const selectedHub = hubs.find((h) => h.id === selectedHubId);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dynamic Cargo Bike Route Planner</h1>
          <p className="text-sm text-slate-400">
            Multi-constraint AI optimization factoring payload, topography incline, weather friction, and battery discharge
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Generator
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fleet Routes ({savedRoutes.length})
          </button>
        </div>
      </div>

      {activeTab === 'planner' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Parameter Configuration */}
          <div className="space-y-5">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center gap-2 text-white font-bold text-base pb-3 border-b border-slate-800">
                <Navigation className="w-5 h-5 text-emerald-400" />
                <span>Dispatch Configuration</span>
              </div>

              {/* Staging Micro-Hub Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Originating Micro-Hub
                </label>
                <select
                  value={selectedHubId}
                  onChange={(e) => setSelectedHubId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {hubs.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name} ({hub.zone})
                    </option>
                  ))}
                </select>
                {selectedHub && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Available Cargo Fleet: {selectedHub.cargo_bikes?.length || 3} bikes
                  </p>
                )}
              </div>

              {/* Environmental Constraints: Weather */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Live Weather Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WEATHER_OPTIONS.map((w) => {
                    const Icon = w.icon;
                    const isSelected = weatherCondition === w.value;
                    return (
                      <button
                        type="button"
                        key={w.value}
                        onClick={() => setWeatherCondition(w.value)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold text-xs">
                          <Icon className="w-4 h-4 text-emerald-400" />
                          <span>{w.label}</span>
                        </div>
                        <span className="block text-[10px] text-slate-500 mt-1">{w.drainImpact}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Elevation Topography Factor Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                    <Mountain className="w-4 h-4 text-emerald-400" />
                    Topography & Incline Factor
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{elevationFactor}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.1"
                  value={elevationFactor}
                  onChange={(e) => setElevationFactor(e.target.value)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Flat Terrain (1.0x)</span>
                  <span>Moderate Hills (1.5x)</span>
                  <span>Steep Grade (2.0x)</span>
                </div>
              </div>

              {/* Min Battery Buffer Buffer Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                    <Battery className="w-4 h-4 text-amber-400" />
                    Min Return Battery Buffer
                  </span>
                  <span className="font-mono font-bold text-amber-400">{minBatteryBuffer}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="35"
                  step="5"
                  value={minBatteryBuffer}
                  onChange={(e) => setMinBatteryBuffer(e.target.value)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Prevents strandings by keeping reserve power to return to charging stall
                </p>
              </div>

              {/* Optimization Trigger Button */}
              <button
                type="button"
                onClick={handleOptimizeRoutes}
                disabled={optimizing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
                <span>{optimizing ? 'Gemini AI Calculating Routes...' : 'Generate Multi-Stop Routes'}</span>
              </button>
            </div>

            {/* AI Summary Card */}
            {routingSummary && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Leaf className="w-4 h-4" />
                  <span>Gemini Route Telemetry Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase">Total Distance</span>
                    <p className="font-mono font-bold text-white text-base">
                      {routingSummary.totalDistance} km
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase">CO₂ Offset</span>
                    <p className="font-mono font-bold text-emerald-400 text-base">
                      +{routingSummary.totalCarbonSaved} kg
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right 2 Columns: Map & Generated Itinerary */}
          <div className="lg:col-span-2 space-y-5">
            <RouteMap
              hubs={selectedHub ? [selectedHub] : hubs}
              routes={generatedRoutes.length > 0 ? generatedRoutes : savedRoutes}
              height="450px"
            />

            {/* Generated Route Cards */}
            {generatedRoutes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                  Generated Route Itineraries ({generatedRoutes.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedRoutes.map((route, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Bike className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-white text-sm">
                            Cargo Bike #{route.cargoBikeId?.slice(0, 8)}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {route.totalPayloadKg} kg payload
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-950/60">
                          <span className="text-[10px] text-slate-500">Distance</span>
                          <p className="font-bold font-mono text-slate-200">{route.estimatedDistanceKm} km</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60">
                          <span className="text-[10px] text-slate-500">Duration</span>
                          <p className="font-bold font-mono text-slate-200">{route.estimatedDurationMins}m</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60">
                          <span className="text-[10px] text-slate-500">Battery Drain</span>
                          <p className="font-bold font-mono text-amber-400">-{route.batteryDrainPct}%</p>
                        </div>
                      </div>

                      {/* Waypoints List */}
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                          Multi-Stop Sequence ({route.waypoints?.length || 0} stops):
                        </span>
                        <div className="space-y-1">
                          {route.waypoints?.map((wp, wIdx) => (
                            <div
                              key={wIdx}
                              className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-950/40 text-slate-300 font-mono"
                            >
                              <span className="text-emerald-400">#{wp.sequence}</span>
                              <span className="text-slate-400">
                                Lat: {wp.lat.toFixed(4)}, Lng: {wp.lng.toFixed(4)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Active Routes Tab */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <h3 className="font-bold text-white text-base">Active Fleet Routes In Execution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedRoutes.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">
                    Route #{r.id.slice(0, 8)}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      r.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p>Distance: <strong className="font-mono text-white">{r.total_distance_km} km</strong></p>
                  <p>Est. Duration: <strong className="font-mono text-white">{r.estimated_duration_mins} mins</strong></p>
                  <p>Carbon Avoided: <strong className="font-mono text-emerald-400">+{r.carbon_saved_kg} kg CO₂</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
