import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  BatteryCharging,
  Bike,
  Package,
  Trash2,
  MapPin,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const ZONES = ['Core-Downtown', 'Midtown-North', 'Riverside-District', 'University-Zone'];

export default function Hubs() {
  const { isDispatcher, isAdmin } = useAuth();
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBikeModalOpen, setIsBikeModalOpen] = useState(false);
  const [selectedHub, setSelectedHub] = useState(null);

  // New Hub Form State
  const [formData, setFormData] = useState({
    name: '',
    zone: 'Core-Downtown',
    latitude: '40.7300',
    longitude: '-73.9900',
    storageCapacityM3: '45.00',
    chargingStations: '6',
  });

  // New Bike Form State
  const [bikeFormData, setBikeFormData] = useState({
    modelName: 'Class-1-E-Bike',
    maxPayloadKg: '50.00',
    batteryRangeKm: '40',
  });

  const [message, setMessage] = useState(null);

  const fetchHubs = async () => {
    try {
      setLoading(true);
      const res = await api.getHubs();
      setHubs(res.hubs || []);
    } catch (err) {
      console.error('Failed to fetch hubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  const handleCreateHub = async (e) => {
    e.preventDefault();
    try {
      await api.createHub({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        storageCapacityM3: parseFloat(formData.storageCapacityM3),
        chargingStations: parseInt(formData.chargingStations, 10),
      });
      setMessage({ type: 'success', text: `Micro-hub "${formData.name}" established successfully!` });
      setIsModalOpen(false);
      setFormData({
        name: '',
        zone: 'Core-Downtown',
        latitude: '40.7300',
        longitude: '-73.9900',
        storageCapacityM3: '45.00',
        chargingStations: '6',
      });
      fetchHubs();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create hub' });
    }
  };

  const handleAddBike = async (e) => {
    e.preventDefault();
    if (!selectedHub) return;
    try {
      await api.createBike({
        microHubId: selectedHub.id,
        modelName: bikeFormData.modelName,
        maxPayloadKg: parseFloat(bikeFormData.maxPayloadKg),
        batteryRangeKm: parseInt(bikeFormData.batteryRangeKm, 10),
      });
      setMessage({ type: 'success', text: `Cargo Bike deployed to ${selectedHub.name}!` });
      setIsBikeModalOpen(false);
      fetchHubs();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to deploy bike' });
    }
  };

  const handleDeleteHub = async (id, name) => {
    if (!window.confirm(`Are you sure you want to decommission micro-hub "${name}"?`)) return;
    try {
      await api.deleteHub(id);
      setMessage({ type: 'success', text: `Micro-hub "${name}" decommissioned.` });
      fetchHubs();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete hub' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Decentralized Micro-Hub Management</h1>
          <p className="text-sm text-slate-400">
            Configure urban staging facilities, parcel storage limits, and fast-charging infrastructure
          </p>
        </div>

        {isDispatcher && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Establish New Micro-Hub</span>
          </button>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hub Cards Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hubs.map((hub) => {
          const capacity = Number(hub.storage_capacity_m3) || 40;
          const current = Number(hub.current_occupancy_m3) || 0;
          const occupancyPct = Math.min(100, Math.round((current / capacity) * 100));
          const bikes = hub.cargo_bikes || [];

          return (
            <div
              key={hub.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5"
            >
              {/* Card Title & Decommission */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{hub.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        {hub.zone}
                      </span>
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {Number(hub.latitude).toFixed(4)}, {Number(hub.longitude).toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteHub(hub.id, hub.name)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Decommission Hub"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Storage Capacity Gauge */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Package className="w-4 h-4 text-emerald-400" />
                    Parcel Volume Occupancy
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {occupancyPct}% ({current} / {capacity} m³)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      occupancyPct > 80
                        ? 'bg-rose-500'
                        : occupancyPct > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Stalls & Fleet Section */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                    <BatteryCharging className="w-4 h-4 text-amber-400" />
                    Charging Stalls
                  </span>
                  <p className="font-bold text-white font-mono text-sm">
                    {hub.charging_stations} Dedicated Bays
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">High-speed DC 48V</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                    <Bike className="w-4 h-4 text-emerald-400" />
                    Assigned Fleet
                  </span>
                  <p className="font-bold text-white font-mono text-sm">
                    {bikes.length} Electric Bikes
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {bikes.filter((b) => b.status === 'available').length} ready for dispatch
                  </p>
                </div>
              </div>

              {/* Cargo Bike Telemetry List */}
              <div className="border-t border-slate-800/80 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Assigned Cargo Bike Fleet
                  </h4>
                  {isDispatcher && (
                    <button
                      onClick={() => {
                        setSelectedHub(hub);
                        setIsBikeModalOpen(true);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                    >
                      + Assign New Bike
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bikes.slice(0, 4).map((bike) => (
                    <div
                      key={bike.id}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">{bike.model_name}</p>
                        <p className="text-[10px] text-slate-500">
                          Cap: {bike.max_payload_kg}kg • Range: {bike.battery_range_km}km
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold ${
                            bike.current_battery_pct > 50
                              ? 'text-emerald-400'
                              : bike.current_battery_pct > 20
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {bike.current_battery_pct}%
                        </span>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">
                          {bike.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Establish New Micro-Hub */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Establish Micro-Hub</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHub} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Hub Facility Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tribeca Logistics Staging Hub"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Urban Micro-Hub Zone
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Storage Capacity (m³)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.storageCapacityM3}
                    onChange={(e) => setFormData({ ...formData, storageCapacityM3: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Charging Bays
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.chargingStations}
                    onChange={(e) => setFormData({ ...formData, chargingStations: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Deploy Micro-Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Cargo Bike to Hub */}
      {isBikeModalOpen && selectedHub && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Assign Cargo Bike</h3>
                  <p className="text-xs text-slate-400">{selectedHub.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBikeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBike} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Vehicle Profile
                </label>
                <select
                  value={bikeFormData.modelName}
                  onChange={(e) => {
                    const isTrike = e.target.value === 'Heavy-Cargo-Trike';
                    setBikeFormData({
                      modelName: e.target.value,
                      maxPayloadKg: isTrike ? '120.00' : '50.00',
                      batteryRangeKm: isTrike ? '35' : '40',
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Class-1-E-Bike">Class-1-E-Bike (50kg max, 40km range)</option>
                  <option value="Heavy-Cargo-Trike">Heavy-Cargo-Trike (120kg max, 35km range)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Max Payload (kg)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={bikeFormData.maxPayloadKg}
                    onChange={(e) => setBikeFormData({ ...bikeFormData, maxPayloadKg: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Range (km)
                  </label>
                  <input
                    type="number"
                    required
                    value={bikeFormData.batteryRangeKm}
                    onChange={(e) => setBikeFormData({ ...bikeFormData, batteryRangeKm: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBikeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Add to Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
