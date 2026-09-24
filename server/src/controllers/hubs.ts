import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createUserClient } from '../config/supabase.js';
import { config } from '../config/index.js';
import { memoryStore } from '../services/store.js';
import { v4 as uuidv4 } from 'uuid';

function isDemoMode() {
  return !config.supabaseUrl || config.supabaseUrl.includes('your-project') || config.supabaseAnonKey === 'your-supabase-anon-key';
}

/**
 * GET /api/hubs - Retrieve all micro-hubs for the organization
 */
export async function getHubs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { data, error } = await supabase
        .from('micro_hubs')
        .select(`
          *,
          cargo_bikes (id, model_name, max_payload_kg, battery_range_km, current_battery_pct, status)
        `)
        .eq('organization_id', req.organizationId!)
        .order('created_at', { ascending: false });

      if (!error && data) {
        res.json({ hubs: data });
        return;
      }
    }

    // Fallback to in-memory store with associated cargo bikes
    const hubsWithBikes = memoryStore.hubs.map((hub) => ({
      ...hub,
      cargo_bikes: memoryStore.bikes.filter((b) => b.micro_hub_id === hub.id),
    }));

    res.json({ hubs: hubsWithBikes });
  } catch (err) {
    console.error('Get hubs error:', err);
    res.json({ hubs: memoryStore.hubs });
  }
}

/**
 * GET /api/hubs/:id - Retrieve a single micro-hub with details
 */
export async function getHubById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { data, error } = await supabase
        .from('micro_hubs')
        .select(`
          *,
          cargo_bikes (id, model_name, max_payload_kg, battery_range_km, current_battery_pct, status),
          parcels (id, tracking_number, destination_address, weight_kg, volume_m3, tier, status)
        `)
        .eq('id', id)
        .eq('organization_id', req.organizationId!)
        .single();

      if (!error && data) {
        res.json({ hub: data });
        return;
      }
    }

    const hub = memoryStore.hubs.find((h) => h.id === id);
    if (!hub) {
      res.status(404).json({ error: 'Hub not found' });
      return;
    }

    const hubDetails = {
      ...hub,
      cargo_bikes: memoryStore.bikes.filter((b) => b.micro_hub_id === hub.id),
      parcels: memoryStore.parcels.filter((p) => p.assigned_hub_id === hub.id),
    };

    res.json({ hub: hubDetails });
  } catch (err) {
    console.error('Get hub by ID error:', err);
    res.status(500).json({ error: 'Failed to retrieve micro-hub' });
  }
}

/**
 * POST /api/hubs - Create a new micro-hub
 */
export async function createHub(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, zone, latitude, longitude, storageCapacityM3, chargingStations } = req.body;

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { data, error } = await supabase
        .from('micro_hubs')
        .insert({
          organization_id: req.organizationId!,
          name,
          zone,
          latitude,
          longitude,
          storage_capacity_m3: storageCapacityM3,
          current_occupancy_m3: 0,
          charging_stations: chargingStations,
        })
        .select()
        .single();

      if (!error && data) {
        res.status(201).json({ hub: data });
        return;
      }
    }

    const newHub = {
      id: uuidv4(),
      organization_id: req.organizationId || memoryStore.orgId,
      name,
      zone,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      storage_capacity_m3: parseFloat(storageCapacityM3),
      current_occupancy_m3: 0,
      charging_stations: parseInt(chargingStations, 10),
      created_at: new Date().toISOString(),
    };
    memoryStore.hubs.unshift(newHub);

    res.status(201).json({ hub: newHub });
  } catch (err) {
    console.error('Create hub error:', err);
    res.status(500).json({ error: 'Failed to create micro-hub' });
  }
}

/**
 * PUT /api/hubs/:id - Update a micro-hub
 */
export async function updateHub(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { data, error } = await supabase
        .from('micro_hubs')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.zone && { zone: updates.zone }),
          ...(updates.latitude && { latitude: updates.latitude }),
          ...(updates.longitude && { longitude: updates.longitude }),
          ...(updates.storageCapacityM3 && { storage_capacity_m3: updates.storageCapacityM3 }),
          ...(updates.chargingStations && { charging_stations: updates.chargingStations }),
        })
        .eq('id', id)
        .eq('organization_id', req.organizationId!)
        .select()
        .single();

      if (!error && data) {
        res.json({ hub: data });
        return;
      }
    }

    const idx = memoryStore.hubs.findIndex((h) => h.id === id);
    if (idx !== -1) {
      memoryStore.hubs[idx] = {
        ...memoryStore.hubs[idx],
        ...(updates.name && { name: updates.name }),
        ...(updates.zone && { zone: updates.zone }),
        ...(updates.latitude && { latitude: updates.latitude }),
        ...(updates.longitude && { longitude: updates.longitude }),
        ...(updates.storageCapacityM3 && { storage_capacity_m3: updates.storageCapacityM3 }),
        ...(updates.chargingStations && { charging_stations: updates.chargingStations }),
      };
      res.json({ hub: memoryStore.hubs[idx] });
      return;
    }

    res.status(404).json({ error: 'Hub not found' });
  } catch (err) {
    console.error('Update hub error:', err);
    res.status(500).json({ error: 'Failed to update micro-hub' });
  }
}

/**
 * DELETE /api/hubs/:id - Delete a micro-hub
 */
export async function deleteHub(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { error } = await supabase
        .from('micro_hubs')
        .delete()
        .eq('id', id)
        .eq('organization_id', req.organizationId!);

      if (!error) {
        res.json({ message: 'Hub deleted successfully' });
        return;
      }
    }

    memoryStore.hubs = memoryStore.hubs.filter((h) => h.id !== id);
    res.json({ message: 'Hub deleted successfully' });
  } catch (err) {
    console.error('Delete hub error:', err);
    res.status(500).json({ error: 'Failed to delete micro-hub' });
  }
}
