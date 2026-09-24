import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Plus,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Building2,
  Trash2,
  X,
} from 'lucide-react';

export default function Inventory() {
  const { isDispatcher, isAdmin } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allocationResult, setAllocationResult] = useState(null);
  const [message, setMessage] = useState(null);

  // Intake Form
  const [form, setForm] = useState({
    trackingNumber: '',
    destinationAddress: '',
    destinationLat: '40.7350',
    destinationLng: '-73.9910',
    weightKg: '3.5',
    volumeM3: '0.012',
    tier: 'Medium',
    assignedHubId: '',
    isFragile: false,
    deliveryWindow: 'Morning (08:00 - 12:00)',
  });

  const fetchParcels = async () => {
    try {
      setLoading(true);
      const [parcelsRes, hubsRes] = await Promise.all([
        api.getParcels({ status: statusFilter, tier: tierFilter }),
        api.getHubs(),
      ]);
      setParcels(parcelsRes.parcels || []);
      setHubs(hubsRes.hubs || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, [statusFilter, tierFilter]);

  const handleCreateParcel = async (e) => {
    e.preventDefault();
    try {
      const tracking = form.trackingNumber || `UL-${Math.floor(1000 + Math.random() * 9000)}`;
      await api.createParcel({
        ...form,
        trackingNumber: tracking,
        destinationLat: parseFloat(form.destinationLat),
        destinationLng: parseFloat(form.destinationLng),
        weightKg: parseFloat(form.weightKg),
        volumeM3: parseFloat(form.volumeM3),
        assignedHubId: form.assignedHubId || undefined,
      });

      setMessage({ type: 'success', text: `Parcel ${tracking} registered into intake successfully.` });
      setIsModalOpen(false);
      setForm({
        trackingNumber: '',
        destinationAddress: '',
        destinationLat: '40.7350',
        destinationLng: '-73.9910',
        weightKg: '3.5',
        volumeM3: '0.012',
        tier: 'Medium',
        assignedHubId: '',
        isFragile: false,
        deliveryWindow: 'Morning (08:00 - 12:00)',
      });
      fetchParcels();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to register parcel' });
    }
  };

  const handleRunAIAllocation = async () => {
    try {
      setAllocating(true);
      const res = await api.allocateParcels();
      setAllocationResult(res.recommendations);
      setMessage({
        type: 'success',
        text: `AI pre-positioning completed: ${res.recommendations?.summary?.totalAllocated || 0} parcels distributed.`,
      });
      fetchParcels();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'AI allocation failed' });
    } finally {
      setAllocating(false);
    }
  };

  const handleDeleteParcel = async (id, tracking) => {
    if (!window.confirm(`Delete parcel ${tracking}?`)) return;
    try {
      await api.deleteParcel(id);
      fetchParcels();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const filteredParcels = parcels.filter(
    (p) =>
      p.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.destination_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Parcel Intake & Allocation Matrix</h1>
          <p className="text-sm text-slate-400">
            Intake incoming parcels and trigger off-peak AI pre-positioning transfers to decentralized micro-hubs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDispatcher && (
            <button
              onClick={handleRunAIAllocation}
              disabled={allocating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${allocating ? 'animate-spin' : ''}`} />
              <span>{allocating ? 'Optimizing with Gemini...' : 'Run AI Allocation Engine'}</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Parcel Intake</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AI Pre-Positioning Recommendations Card (if just allocated) */}
      {allocationResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-white text-base">Gemini Pre-Positioning Optimization Results</h3>
                <p className="text-xs text-slate-300">
                  Off-peak consolidation matrix successfully updated for {allocationResult.allocations?.length || 0} parcels
                </p>
              </div>
            </div>
            <button
              onClick={() => setAllocationResult(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allocationResult.allocations?.map((alloc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1"
              >
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Parcel: {alloc.parcelId?.slice(0, 8)}...</span>
                  <span className="text-emerald-400 font-mono">~{alloc.distanceToDestinationKm} km</span>
                </div>
                <div className="text-slate-300 font-medium flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  {alloc.hubName}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight pt-1 border-t border-slate-800/80">
                  {alloc.reasoning}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tracking # or address..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-4 h-4 text-slate-500" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="pending_sorting">Pending Sorting</option>
              <option value="at_hub">Pre-Positioned at Hub</option>
              <option value="in_transit">In Transit (Bike)</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Tiers</option>
              <option value="Small">Small (&lt;2kg)</option>
              <option value="Medium">Medium (2-10kg)</option>
              <option value="Bulk">Bulk (10-25kg)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parcels Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Tracking Number</th>
                <th className="px-5 py-3.5">Destination</th>
                <th className="px-5 py-3.5">Tier & Specs</th>
                <th className="px-5 py-3.5">Assigned Micro-Hub</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredParcels.map((parcel) => {
                const getStatusBadge = (st) => {
                  switch (st) {
                    case 'pending_sorting':
                      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                    case 'at_hub':
                      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                    case 'in_transit':
                      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                    case 'delivered':
                      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                    default:
                      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
                  }
                };

                return (
                  <tr key={parcel.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-white">
                      {parcel.tracking_number}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-200">{parcel.destination_address}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {Number(parcel.destination_lat).toFixed(4)},{' '}
                        {Number(parcel.destination_lng).toFixed(4)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-white">{parcel.tier}</span>
                      <span className="text-slate-400 block text-[11px] font-mono">
                        {parcel.weight_kg}kg • {parcel.volume_m3}m³
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {parcel.micro_hubs ? (
                        <div>
                          <p className="font-semibold text-emerald-400">{parcel.micro_hubs.name}</p>
                          <span className="text-[10px] text-slate-400">{parcel.micro_hubs.zone}</span>
                        </div>
                      ) : (
                        <span className="text-amber-400/90 italic text-[11px]">Unassigned (Central Staging)</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          parcel.status
                        )}`}
                      >
                        {parcel.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteParcel(parcel.id, parcel.tracking_number)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Parcel Intake */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">Parcel Intake Entry</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParcel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Recipient Address
                </label>
                <input
                  type="text"
                  required
                  value={form.destinationAddress}
                  onChange={(e) => setForm({ ...form, destinationAddress: e.target.value })}
                  placeholder="e.g. 500 7th Ave, New York, NY"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
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
                    value={form.destinationLat}
                    onChange={(e) => setForm({ ...form, destinationLat: e.target.value })}
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
                    value={form.destinationLng}
                    onChange={(e) => setForm({ ...form, destinationLng: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    max="25"
                    required
                    value={form.weightKg}
                    onChange={(e) => {
                      const w = parseFloat(e.target.value);
                      let t = 'Small';
                      if (w > 10) t = 'Bulk';
                      else if (w >= 2) t = 'Medium';
                      setForm({ ...form, weightKg: e.target.value, tier: t });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Volume (m³)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={form.volumeM3}
                    onChange={(e) => setForm({ ...form, volumeM3: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Parcel Tier
                  </label>
                  <select
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Small">Small (&lt;2kg)</option>
                    <option value="Medium">Medium (2-10kg)</option>
                    <option value="Bulk">Bulk (10-25kg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Direct Pre-Positioning Hub (Optional)
                </label>
                <select
                  value={form.assignedHubId}
                  onChange={(e) => setForm({ ...form, assignedHubId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Leave Unassigned (Pending AI Allocation)</option>
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="fragile"
                  checked={form.isFragile}
                  onChange={(e) => setForm({ ...form, isFragile: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                />
                <label htmlFor="fragile" className="text-xs text-slate-300 select-none">
                  Fragile Item (Requires cushioned cargo bay)
                </label>
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
                  Confirm Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
