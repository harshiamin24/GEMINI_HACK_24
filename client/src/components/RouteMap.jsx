import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom icons using standard SVG Leaflet DivIcons
const createHubIcon = (name) =>
  L.divIcon({
    className: 'custom-hub-marker',
    html: `
      <div style="
        background: #059669;
        color: white;
        border: 2px solid #34d399;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(5, 150, 105, 0.6);
        font-weight: bold;
        font-size: 14px;
      ">
        🏢
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const createStopIcon = (seq) =>
  L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        background: #3b82f6;
        color: white;
        border: 2px solid #60a5fa;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        font-weight: bold;
        font-size: 11px;
      ">
        ${seq}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const createBikeIcon = (battery) =>
  L.divIcon({
    className: 'custom-bike-marker',
    html: `
      <div style="
        background: #0f172a;
        color: #34d399;
        border: 2px solid #10b981;
        border-radius: 8px;
        padding: 2px 6px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
      ">
        🚲 ${battery}%
      </div>
    `,
    iconSize: [48, 24],
    iconAnchor: [24, 12],
  });

// Component to dynamically fit bounds when routes or hubs change
function MapBoundsUpdater({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [points, map]);

  return null;
}

export default function RouteMap({
  hubs = [],
  routes = [],
  bikes = [],
  parcels = [],
  center = [40.7484, -73.9857],
  zoom = 13,
  height = '500px',
  interactive = true,
}) {
  // Extract all coordinates for map centering
  const allPoints = [
    ...hubs.map((h) => ({ lat: Number(h.latitude), lng: Number(h.longitude) })),
    ...routes.flatMap((r) =>
      (r.waypoints || r.route_geometry?.waypoints || []).map((w) => ({
        lat: Number(w.lat),
        lng: Number(w.lng),
      }))
    ),
  ].filter((p) => !isNaN(p.lat) && !isNaN(p.lng));

  const routeColors = ['#10b981', '#38bdf8', '#a855f7', '#f59e0b', '#ec4899'];

  return (
    <div
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl bg-slate-950"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={interactive}
        className="w-full h-full dark-tiles"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {allPoints.length > 0 && <MapBoundsUpdater points={allPoints} />}

        {/* Hub Markers */}
        {hubs.map((hub) => (
          <Marker
            key={hub.id}
            position={[Number(hub.latitude), Number(hub.longitude)]}
            icon={createHubIcon(hub.name)}
          >
            <Popup>
              <div className="p-1 space-y-1">
                <div className="font-bold text-sm text-slate-100 flex items-center justify-between gap-2">
                  <span>{hub.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {hub.zone}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Storage Occupancy: {hub.current_occupancy_m3 || 0} / {hub.storage_capacity_m3} m³
                </p>
                <p className="text-xs text-emerald-400 font-medium">
                  ⚡ {hub.charging_stations} Fast-Charging Stalls
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Delivery Routes & Polylines */}
        {routes.map((route, rIdx) => {
          const waypoints = route.waypoints || route.route_geometry?.waypoints || [];
          if (!waypoints || waypoints.length === 0) return null;

          const polyCoords = waypoints.map((w) => [Number(w.lat), Number(w.lng)]);
          const color = routeColors[rIdx % routeColors.length];

          return (
            <React.Fragment key={route.id || `route-${rIdx}`}>
              <Polyline
                positions={polyCoords}
                pathOptions={{
                  color,
                  weight: 4,
                  opacity: 0.85,
                  dashArray: route.status === 'active' ? '8, 8' : undefined,
                }}
              />

              {/* Waypoint Markers */}
              {waypoints.map((wp, wIdx) => (
                <Marker
                  key={`wp-${rIdx}-${wIdx}`}
                  position={[Number(wp.lat), Number(wp.lng)]}
                  icon={createStopIcon(wp.sequence || wIdx + 1)}
                >
                  <Popup>
                    <div className="p-1 text-xs space-y-1">
                      <p className="font-bold text-slate-200">
                        Stop #{wp.sequence || wIdx + 1}
                      </p>
                      {wp.parcelId && <p className="text-slate-400">Parcel: {wp.parcelId.slice(0, 8)}...</p>}
                      <p className="text-emerald-400 font-mono">
                        Saved: ~{route.carbonSavedVsVanKg || route.carbon_saved_kg || 1.4} kg CO₂
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 pointer-events-auto shadow-lg">
        <span className="font-semibold text-slate-300 block mb-1 text-[11px] uppercase tracking-wider">
          Geospatial Map Legend
        </span>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-emerald-300"></span>
          <span>Decentralized Micro-Hub</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block border border-blue-300"></span>
          <span>Electric Bike Delivery Stop</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-5 h-0.5 bg-emerald-400 inline-block"></span>
          <span>Optimized Zero-Emission Path</span>
        </div>
      </div>
    </div>
  );
}
