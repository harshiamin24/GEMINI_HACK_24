import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createUserClient } from '../config/supabase.js';
import { config } from '../config/index.js';
import { generateOptimizedRoutes } from '../services/gemini.js';
import { memoryStore } from '../services/store.js';
import { v4 as uuidv4 } from 'uuid';

function isDemoMode() {
  return !config.supabaseUrl || config.supabaseUrl.includes('your-project') || config.supabaseAnonKey === 'your-supabase-anon-key';
}

/**
 * POST /api/routes/optimize - Generate AI-optimized delivery routes
 */
export async function optimizeRoutes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { hubId, weatherCondition = 'Clear', elevationFactor = 1.0, minBatteryBuffer = 15 } = req.body;

    let hub: any = null;
    let bikes: any[] = [];
    let parcels: any[] = [];

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { data: hubData } = await supabase
        .from('micro_hubs')
        .select('*')
        .eq('id', hubId)
        .eq('organization_id', req.organizationId!)
        .single();

      if (hubData) {
        hub = hubData;
        const { data: bikeData } = await supabase
          .from('cargo_bikes')
          .select('*')
          .eq('micro_hub_id', hubId)
          .eq('status', 'available')
          .gte('current_battery_pct', minBatteryBuffer);

        const { data: parcelData } = await supabase
          .from('parcels')
          .select('*')
          .eq('assigned_hub_id', hubId)
          .eq('status', 'at_hub');

        if (bikeData) bikes = bikeData;
        if (parcelData) parcels = parcelData;
      }
    }

    if (!hub) {
      hub = memoryStore.hubs.find((h) => h.id === hubId) || memoryStore.hubs[0];
      bikes = memoryStore.bikes.filter((b) => b.micro_hub_id === hub.id && (b.status === 'available' || b.current_battery_pct >= minBatteryBuffer));
      if (bikes.length === 0) {
        bikes = memoryStore.bikes.slice(0, 2);
      }
      parcels = memoryStore.parcels.filter((p) => p.assigned_hub_id === hub.id && p.status === 'at_hub');
      if (parcels.length === 0) {
        parcels = memoryStore.parcels.slice(0, 4);
      }
    }

    // Generate optimized routes via Gemini AI
    const optimizedRoutes = await generateOptimizedRoutes(
      hub.id,
      bikes,
      parcels,
      weatherCondition,
      elevationFactor || 1.0
    );

    // Save generated routes into store
    if (optimizedRoutes.routes && Array.isArray(optimizedRoutes.routes)) {
      for (const route of optimizedRoutes.routes) {
        const newRouteRecord = {
          id: uuidv4(),
          cargo_bike_id: route.cargoBikeId,
          dispatcher_id: req.userId || '00000000-0000-0000-0000-000000000001',
          status: 'planned' as const,
          total_distance_km: route.estimatedDistanceKm,
          estimated_duration_mins: route.estimatedDurationMins,
          carbon_saved_kg: route.carbonSavedVsVanKg,
          route_geometry: { waypoints: route.waypoints, parcelIds: route.assignedParcelIds },
          created_at: new Date().toISOString(),
        };

        memoryStore.routes.unshift(newRouteRecord);

        // Update bike and parcel statuses in memory
        const bike = memoryStore.bikes.find((b) => b.id === route.cargoBikeId);
        if (bike) bike.status = 'in_transit';

        if (route.assignedParcelIds) {
          for (const pid of route.assignedParcelIds) {
            const p = memoryStore.parcels.find((item) => item.id === pid);
            if (p) p.status = 'in_transit';
          }
        }
      }
    }

    res.json({
      message: 'Routes optimized successfully with Gemini AI',
      routes: optimizedRoutes,
      hub: {
        id: hub.id,
        name: hub.name,
        lat: hub.latitude,
        lng: hub.longitude,
      },
    });
  } catch (err) {
    console.error('Route optimization error:', err);
    res.status(500).json({ error: 'Failed to optimize routes' });
  }
}

/**
 * GET /api/routes - Get all routes for the organization
 */
export async function getRoutes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { status } = req.query;

      let query = supabase
        .from('delivery_routes')
        .select(`
          *,
          cargo_bikes (id, model_name, micro_hub_id, current_battery_pct),
          profiles (full_name)
        `)
        .order('created_at', { ascending: false });

      if (status && typeof status === 'string') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (!error && data) {
        res.json({ routes: data });
        return;
      }
    }

    const { status } = req.query;
    let list = [...memoryStore.routes];
    if (status && typeof status === 'string') {
      list = list.filter((r) => r.status === status);
    }

    const populated = list.map((r) => {
      const bike = memoryStore.bikes.find((b) => b.id === r.cargo_bike_id);
      return {
        ...r,
        cargo_bikes: bike ? { id: bike.id, model_name: bike.model_name, current_battery_pct: bike.current_battery_pct } : null,
        profiles: { full_name: 'Lead Dispatcher' },
      };
    });

    res.json({ routes: populated });
  } catch (err) {
    console.error('Get routes error:', err);
    res.json({ routes: memoryStore.routes });
  }
}

/**
 * PUT /api/routes/:id/status - Update route status
 */
export async function updateRouteStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['planned', 'active', 'completed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const r = memoryStore.routes.find((item) => item.id === id);
    if (r) {
      r.status = status as any;
      if (status === 'completed') {
        const bike = memoryStore.bikes.find((b) => b.id === r.cargo_bike_id);
        if (bike) bike.status = 'available';

        const geom = r.route_geometry as any;
        if (geom?.parcelIds) {
          for (const pid of geom.parcelIds) {
            const p = memoryStore.parcels.find((item) => item.id === pid);
            if (p) p.status = 'delivered';
          }
        }
      }
      res.json({ route: r });
      return;
    }

    res.status(404).json({ error: 'Route not found' });
  } catch (err) {
    console.error('Update route status error:', err);
    res.status(500).json({ error: 'Failed to update route status' });
  }
}
