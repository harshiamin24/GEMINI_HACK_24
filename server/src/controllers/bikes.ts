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
 * GET /api/bikes - Get all cargo bikes for the organization
 */
export async function getBikes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { hubId, status } = req.query;

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      let query = supabase
        .from('cargo_bikes')
        .select('*, micro_hubs(id, name, zone)')
        .order('created_at', { ascending: false });

      if (hubId && typeof hubId === 'string') {
        query = query.eq('micro_hub_id', hubId);
      }
      if (status && typeof status === 'string') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (!error && data) {
        res.json({ bikes: data });
        return;
      }
    }

    let filtered = [...memoryStore.bikes];
    if (hubId && typeof hubId === 'string') {
      filtered = filtered.filter((b) => b.micro_hub_id === hubId);
    }
    if (status && typeof status === 'string') {
      filtered = filtered.filter((b) => b.status === status);
    }

    const bikesWithHub = filtered.map((b) => {
      const h = memoryStore.hubs.find((hub) => hub.id === b.micro_hub_id);
      return {
        ...b,
        micro_hubs: h ? { id: h.id, name: h.name, zone: h.zone } : null,
      };
    });

    res.json({ bikes: bikesWithHub });
  } catch (err) {
    console.error('Get bikes error:', err);
    res.json({ bikes: memoryStore.bikes });
  }
}

/**
 * POST /api/bikes - Create a new cargo bike
 */
export async function createBike(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { microHubId, modelName, maxPayloadKg, batteryRangeKm } = req.body;

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { data, error } = await supabase
        .from('cargo_bikes')
        .insert({
          micro_hub_id: microHubId,
          model_name: modelName,
          max_payload_kg: maxPayloadKg,
          battery_range_km: batteryRangeKm,
          current_battery_pct: 100,
          status: 'available',
        })
        .select()
        .single();

      if (!error && data) {
        res.status(201).json({ bike: data });
        return;
      }
    }

    const newBike: any = {
      id: uuidv4(),
      micro_hub_id: microHubId,
      model_name: modelName,
      max_payload_kg: parseFloat(maxPayloadKg),
      battery_range_km: parseInt(batteryRangeKm, 10),
      current_battery_pct: 100,
      status: 'available',
      created_at: new Date().toISOString(),
    };
    memoryStore.bikes.unshift(newBike);

    res.status(201).json({ bike: newBike });
  } catch (err) {
    console.error('Create bike error:', err);
    res.status(500).json({ error: 'Failed to create cargo bike' });
  }
}

/**
 * PUT /api/bikes/:id - Update a cargo bike
 */
export async function updateBike(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, currentBatteryPct } = req.body;

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const updateFields: Record<string, any> = {};
      if (status) updateFields.status = status;
      if (currentBatteryPct !== undefined) updateFields.current_battery_pct = currentBatteryPct;

      const { data, error } = await supabase
        .from('cargo_bikes')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        res.json({ bike: data });
        return;
      }
    }

    const bike = memoryStore.bikes.find((b) => b.id === id);
    if (bike) {
      if (status) bike.status = status;
      if (currentBatteryPct !== undefined) bike.current_battery_pct = parseInt(currentBatteryPct, 10);
      res.json({ bike });
      return;
    }

    res.status(404).json({ error: 'Bike not found' });
  } catch (err) {
    console.error('Update bike error:', err);
    res.status(500).json({ error: 'Failed to update cargo bike' });
  }
}

/**
 * DELETE /api/bikes/:id - Delete a cargo bike
 */
export async function deleteBike(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { error } = await supabase.from('cargo_bikes').delete().eq('id', id);
      if (!error) {
        res.json({ message: 'Cargo bike deleted successfully' });
        return;
      }
    }

    memoryStore.bikes = memoryStore.bikes.filter((b) => b.id !== id);
    res.json({ message: 'Cargo bike deleted successfully' });
  } catch (err) {
    console.error('Delete bike error:', err);
    res.status(500).json({ error: 'Failed to delete cargo bike' });
  }
}
