import { v4 as uuidv4 } from 'uuid';

export interface MicroHub {
  id: string;
  organization_id: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
  storage_capacity_m3: number;
  current_occupancy_m3: number;
  charging_stations: number;
  created_at: string;
}

export interface CargoBike {
  id: string;
  micro_hub_id: string;
  model_name: string;
  max_payload_kg: number;
  battery_range_km: number;
  current_battery_pct: number;
  status: 'available' | 'in_transit' | 'charging' | 'maintenance';
  created_at: string;
}

export interface Parcel {
  id: string;
  organization_id: string;
  tracking_number: string;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  weight_kg: number;
  volume_m3: number;
  tier: 'Small' | 'Medium' | 'Bulk';
  status: 'pending_sorting' | 'at_hub' | 'in_transit' | 'delivered';
  assigned_hub_id: string | null;
  created_at: string;
}

export interface DeliveryRoute {
  id: string;
  cargo_bike_id: string;
  dispatcher_id?: string | null;
  status: 'planned' | 'active' | 'completed';
  total_distance_km: number;
  estimated_duration_mins: number;
  carbon_saved_kg: number;
  route_geometry: any;
  created_at: string;
}

export class MemoryStore {
  private static instance: MemoryStore;
  
  public orgId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  public hubs: MicroHub[] = [
    {
      id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Central Station Hub',
      zone: 'Core-Downtown',
      latitude: 40.7128,
      longitude: -74.0060,
      storage_capacity_m3: 50.00,
      current_occupancy_m3: 18.50,
      charging_stations: 8,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Midtown Distribution Point',
      zone: 'Midtown-North',
      latitude: 40.7549,
      longitude: -73.9840,
      storage_capacity_m3: 35.00,
      current_occupancy_m3: 12.00,
      charging_stations: 6,
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Riverside Depot',
      zone: 'Riverside-District',
      latitude: 40.8023,
      longitude: -73.9654,
      storage_capacity_m3: 40.00,
      current_occupancy_m3: 8.75,
      charging_stations: 5,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Campus Express Hub',
      zone: 'University-Zone',
      latitude: 40.7295,
      longitude: -73.9965,
      storage_capacity_m3: 25.00,
      current_occupancy_m3: 5.00,
      charging_stations: 4,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    }
  ];

  public bikes: CargoBike[] = [
    { id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', micro_hub_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Class-1-E-Bike', max_payload_kg: 50.00, battery_range_km: 40, current_battery_pct: 92, status: 'available', created_at: new Date().toISOString() },
    { id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', micro_hub_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Class-1-E-Bike', max_payload_kg: 50.00, battery_range_km: 40, current_battery_pct: 78, status: 'in_transit', created_at: new Date().toISOString() },
    { id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', micro_hub_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Heavy-Cargo-Trike', max_payload_kg: 120.00, battery_range_km: 35, current_battery_pct: 100, status: 'available', created_at: new Date().toISOString() },
    { id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', micro_hub_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Heavy-Cargo-Trike', max_payload_kg: 120.00, battery_range_km: 35, current_battery_pct: 45, status: 'charging', created_at: new Date().toISOString() },
    { id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', micro_hub_id: 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Class-1-E-Bike', max_payload_kg: 50.00, battery_range_km: 40, current_battery_pct: 85, status: 'available', created_at: new Date().toISOString() },
    { id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', micro_hub_id: 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Class-1-E-Bike', max_payload_kg: 50.00, battery_range_km: 40, current_battery_pct: 67, status: 'in_transit', created_at: new Date().toISOString() },
    { id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', micro_hub_id: 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Heavy-Cargo-Trike', max_payload_kg: 120.00, battery_range_km: 35, current_battery_pct: 30, status: 'charging', created_at: new Date().toISOString() },
    { id: 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', micro_hub_id: 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Class-1-E-Bike', max_payload_kg: 50.00, battery_range_km: 40, current_battery_pct: 95, status: 'available', created_at: new Date().toISOString() },
    { id: 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', micro_hub_id: 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Heavy-Cargo-Trike', max_payload_kg: 120.00, battery_range_km: 35, current_battery_pct: 88, status: 'available', created_at: new Date().toISOString() },
    { id: 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', micro_hub_id: 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Class-1-E-Bike', max_payload_kg: 50.00, battery_range_km: 40, current_battery_pct: 15, status: 'maintenance', created_at: new Date().toISOString() },
    { id: 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', micro_hub_id: 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Class-1-E-Bike', max_payload_kg: 50.00, battery_range_km: 40, current_battery_pct: 100, status: 'available', created_at: new Date().toISOString() },
    { id: 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', micro_hub_id: 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', model_name: 'Class-1-E-Bike', max_payload_kg: 50.00, battery_range_km: 40, current_battery_pct: 72, status: 'available', created_at: new Date().toISOString() },
  ];

  public parcels: Parcel[] = [
    { id: 'p1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-001', destination_address: '350 Fifth Ave, New York, NY', destination_lat: 40.7484, destination_lng: -73.9857, weight_kg: 1.20, volume_m3: 0.0050, tier: 'Small', status: 'at_hub', assigned_hub_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString() },
    { id: 'p1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-002', destination_address: '200 Broadway, New York, NY', destination_lat: 40.7105, destination_lng: -74.0075, weight_kg: 4.50, volume_m3: 0.0120, tier: 'Medium', status: 'at_hub', assigned_hub_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString() },
    { id: 'p1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-003', destination_address: '100 Wall St, New York, NY', destination_lat: 40.7053, destination_lng: -74.0073, weight_kg: 15.00, volume_m3: 0.0450, tier: 'Bulk', status: 'at_hub', assigned_hub_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString() },
    { id: 'p1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-004', destination_address: '1 World Trade Center, NY', destination_lat: 40.7127, destination_lng: -74.0134, weight_kg: 0.80, volume_m3: 0.0030, tier: 'Small', status: 'at_hub', assigned_hub_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString() },
    { id: 'p2eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-005', destination_address: '30 Rockefeller Plaza, NY', destination_lat: 40.7587, destination_lng: -73.9787, weight_kg: 3.20, volume_m3: 0.0080, tier: 'Medium', status: 'at_hub', assigned_hub_id: 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString() },
    { id: 'p2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-006', destination_address: '405 Lexington Ave, NY', destination_lat: 40.7517, destination_lng: -73.9755, weight_kg: 7.50, volume_m3: 0.0200, tier: 'Medium', status: 'at_hub', assigned_hub_id: 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString() },
    { id: 'p2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-007', destination_address: '767 5th Ave, NY', destination_lat: 40.7636, destination_lng: -73.9722, weight_kg: 1.00, volume_m3: 0.0040, tier: 'Small', status: 'at_hub', assigned_hub_id: 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString() },
    { id: 'p3eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-008', destination_address: '1000 5th Ave, NY', destination_lat: 40.7794, destination_lng: -73.9632, weight_kg: 2.30, volume_m3: 0.0060, tier: 'Medium', status: 'pending_sorting', assigned_hub_id: null, created_at: new Date().toISOString() },
    { id: 'p3eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-009', destination_address: '525 E 68th St, NY', destination_lat: 40.7650, destination_lng: -73.9539, weight_kg: 12.00, volume_m3: 0.0350, tier: 'Bulk', status: 'pending_sorting', assigned_hub_id: null, created_at: new Date().toISOString() },
    { id: 'p3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-010', destination_address: '1 E 161st St, Bronx, NY', destination_lat: 40.8296, destination_lng: -73.9262, weight_kg: 0.50, volume_m3: 0.0020, tier: 'Small', status: 'pending_sorting', assigned_hub_id: null, created_at: new Date().toISOString() },
    { id: 'p4eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-011', destination_address: '89 E 42nd St, NY', destination_lat: 40.7527, destination_lng: -73.9772, weight_kg: 5.00, volume_m3: 0.0150, tier: 'Medium', status: 'delivered', assigned_hub_id: 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString() },
    { id: 'p4eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', tracking_number: 'UL-2024-012', destination_address: '20 W 34th St, NY', destination_lat: 40.7488, destination_lng: -73.9856, weight_kg: 1.50, volume_m3: 0.0040, tier: 'Small', status: 'delivered', assigned_hub_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', created_at: new Date().toISOString() },
  ];

  public routes: DeliveryRoute[] = [
    {
      id: 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      cargo_bike_id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
      status: 'completed',
      total_distance_km: 8.50,
      estimated_duration_mins: 42,
      carbon_saved_kg: 1.74,
      route_geometry: {
        waypoints: [
          { lat: 40.7128, lng: -74.0060, sequence: 1 },
          { lat: 40.7484, lng: -73.9857, sequence: 2 },
          { lat: 40.7105, lng: -74.0075, sequence: 3 }
        ]
      },
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
      cargo_bike_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
      status: 'completed',
      total_distance_km: 5.20,
      estimated_duration_mins: 28,
      carbon_saved_kg: 1.07,
      route_geometry: {
        waypoints: [
          { lat: 40.7549, lng: -73.9840, sequence: 1 },
          { lat: 40.7587, lng: -73.9787, sequence: 2 },
          { lat: 40.7517, lng: -73.9755, sequence: 3 }
        ]
      },
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
      cargo_bike_id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      status: 'completed',
      total_distance_km: 12.30,
      estimated_duration_mins: 55,
      carbon_saved_kg: 2.52,
      route_geometry: {
        waypoints: [
          { lat: 40.7128, lng: -74.0060, sequence: 1 },
          { lat: 40.7053, lng: -74.0073, sequence: 2 },
          { lat: 40.7127, lng: -74.0134, sequence: 3 },
          { lat: 40.7488, lng: -73.9856, sequence: 4 }
        ]
      },
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'r1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
      cargo_bike_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      status: 'active',
      total_distance_km: 7.40,
      estimated_duration_mins: 38,
      carbon_saved_kg: 1.51,
      route_geometry: {
        waypoints: [
          { lat: 40.7549, lng: -73.9840, sequence: 1 },
          { lat: 40.7636, lng: -73.9722, sequence: 2 },
          { lat: 40.7517, lng: -73.9755, sequence: 3 }
        ]
      },
      created_at: new Date().toISOString()
    }
  ];

  public static getInstance(): MemoryStore {
    if (!MemoryStore.instance) {
      MemoryStore.instance = new MemoryStore();
    }
    return MemoryStore.instance;
  }
}

export const memoryStore = MemoryStore.getInstance();
