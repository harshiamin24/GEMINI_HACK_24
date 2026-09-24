import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createUserClient } from '../config/supabase.js';
import { config } from '../config/index.js';
import { generateAllocationRecommendations } from '../services/gemini.js';
import { memoryStore } from '../services/store.js';
import { v4 as uuidv4 } from 'uuid';

function isDemoMode() {
  return !config.supabaseUrl || config.supabaseUrl.includes('your-project') || config.supabaseAnonKey === 'your-supabase-anon-key';
}

/**
 * GET /api/parcels - List parcels with optional filtering
 */
export async function getParcels(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, hubId, tier, page = '1', limit = '50' } = req.query;

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      let query = supabase
        .from('parcels')
        .select('*, micro_hubs(name, zone)', { count: 'exact' })
        .eq('organization_id', req.organizationId!)
        .order('created_at', { ascending: false });

      if (status && typeof status === 'string') {
        query = query.eq('status', status);
      }
      if (hubId && typeof hubId === 'string') {
        query = query.eq('assigned_hub_id', hubId);
      }
      if (tier && typeof tier === 'string') {
        query = query.eq('tier', tier);
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;
      query = query.range(offset, offset + limitNum - 1);

      const { data, error, count } = await query;

      if (!error && data) {
        res.json({
          parcels: data,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limitNum),
          },
        });
        return;
      }
    }

    // Fallback to memoryStore
    let filtered = [...memoryStore.parcels];
    if (status && typeof status === 'string') {
      filtered = filtered.filter((p) => p.status === status);
    }
    if (hubId && typeof hubId === 'string') {
      filtered = filtered.filter((p) => p.assigned_hub_id === hubId);
    }
    if (tier && typeof tier === 'string') {
      filtered = filtered.filter((p) => p.tier === tier);
    }

    const parcelsWithHub = filtered.map((p) => {
      const h = memoryStore.hubs.find((hub) => hub.id === p.assigned_hub_id);
      return {
        ...p,
        micro_hubs: h ? { name: h.name, zone: h.zone } : null,
      };
    });

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const start = (pageNum - 1) * limitNum;
    const paginated = parcelsWithHub.slice(start, start + limitNum);

    res.json({
      parcels: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limitNum),
      },
    });
  } catch (err) {
    console.error('Get parcels error:', err);
    res.json({ parcels: memoryStore.parcels, pagination: { total: memoryStore.parcels.length } });
  }
}

/**
 * POST /api/parcels - Create a new parcel
 */
export async function createParcel(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      trackingNumber,
      destinationAddress,
      destinationLat,
      destinationLng,
      weightKg,
      volumeM3,
      tier,
      assignedHubId,
    } = req.body;

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { data, error } = await supabase
        .from('parcels')
        .insert({
          organization_id: req.organizationId!,
          tracking_number: trackingNumber,
          destination_address: destinationAddress,
          destination_lat: destinationLat,
          destination_lng: destinationLng,
          weight_kg: weightKg,
          volume_m3: volumeM3,
          tier,
          status: assignedHubId ? 'at_hub' : 'pending_sorting',
          assigned_hub_id: assignedHubId || null,
        })
        .select()
        .single();

      if (!error && data) {
        res.status(201).json({ parcel: data });
        return;
      }
    }

    const newParcel: any = {
      id: uuidv4(),
      organization_id: req.organizationId || memoryStore.orgId,
      tracking_number: trackingNumber || `UL-${Date.now().toString().slice(-4)}`,
      destination_address: destinationAddress,
      destination_lat: parseFloat(destinationLat),
      destination_lng: parseFloat(destinationLng),
      weight_kg: parseFloat(weightKg),
      volume_m3: parseFloat(volumeM3),
      tier,
      status: assignedHubId ? 'at_hub' : 'pending_sorting',
      assigned_hub_id: assignedHubId || null,
      created_at: new Date().toISOString(),
    };
    memoryStore.parcels.unshift(newParcel);

    res.status(201).json({ parcel: newParcel });
  } catch (err) {
    console.error('Create parcel error:', err);
    res.status(500).json({ error: 'Failed to create parcel' });
  }
}

/**
 * PUT /api/parcels/:id/status - Update parcel status
 */
export async function updateParcelStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending_sorting', 'at_hub', 'in_transit', 'delivered'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { data, error } = await supabase
        .from('parcels')
        .update({ status })
        .eq('id', id)
        .eq('organization_id', req.organizationId!)
        .select()
        .single();

      if (!error && data) {
        res.json({ parcel: data });
        return;
      }
    }

    const p = memoryStore.parcels.find((item) => item.id === id);
    if (p) {
      p.status = status as any;
      res.json({ parcel: p });
      return;
    }

    res.status(404).json({ error: 'Parcel not found' });
  } catch (err) {
    console.error('Update parcel status error:', err);
    res.status(500).json({ error: 'Failed to update parcel status' });
  }
}

/**
 * POST /api/parcels/allocate - AI-driven inventory pre-positioning assignment
 */
export async function allocateParcels(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let unassignedParcels: any[] = [];
    let hubsList: any[] = [];

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { data: parcels } = await supabase
        .from('parcels')
        .select('*')
        .eq('organization_id', req.organizationId!)
        .eq('status', 'pending_sorting')
        .is('assigned_hub_id', null);

      const { data: hubs } = await supabase
        .from('micro_hubs')
        .select('*')
        .eq('organization_id', req.organizationId!);

      if (parcels) unassignedParcels = parcels;
      if (hubs) hubsList = hubs;
    }

    if (unassignedParcels.length === 0) {
      unassignedParcels = memoryStore.parcels.filter(
        (p) => p.status === 'pending_sorting' || !p.assigned_hub_id
      );
    }
    if (hubsList.length === 0) {
      hubsList = memoryStore.hubs;
    }

    if (unassignedParcels.length === 0) {
      res.json({ message: 'No unassigned parcels to allocate', recommendations: { allocations: [], summary: { totalAllocated: 0, hubUtilization: [] } } });
      return;
    }

    // Get AI recommendations
    const recommendations = await generateAllocationRecommendations(unassignedParcels, hubsList);

    // Apply allocations in memory store
    if (recommendations.allocations && Array.isArray(recommendations.allocations)) {
      for (const alloc of recommendations.allocations) {
        const p = memoryStore.parcels.find((item) => item.id === alloc.parcelId);
        if (p) {
          p.assigned_hub_id = alloc.recommendedHubId;
          p.status = 'at_hub';
        }
      }
    }

    res.json({
      message: 'Parcels pre-positioned and allocated successfully via AI',
      recommendations,
    });
  } catch (err) {
    console.error('Allocate parcels error:', err);
    res.status(500).json({ error: 'Failed to allocate parcels' });
  }
}

/**
 * DELETE /api/parcels/:id - Delete a parcel
 */
export async function deleteParcel(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!isDemoMode()) {
      const supabase = createUserClient(req.accessToken!);
      const { error } = await supabase
        .from('parcels')
        .delete()
        .eq('id', id)
        .eq('organization_id', req.organizationId!);

      if (!error) {
        res.json({ message: 'Parcel deleted successfully' });
        return;
      }
    }

    memoryStore.parcels = memoryStore.parcels.filter((p) => p.id !== id);
    res.json({ message: 'Parcel deleted successfully' });
  } catch (err) {
    console.error('Delete parcel error:', err);
    res.status(500).json({ error: 'Failed to delete parcel' });
  }
}
