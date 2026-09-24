-- UrbanLogix AI - Seed Data
-- Run this AFTER schema.sql in your Supabase SQL Editor

-- ── Create Demo Organization ────────────────────────────────────
INSERT INTO organizations (id, name) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Metro Green Logistics Co.');

-- ── Create Micro-Hubs ───────────────────────────────────────────
INSERT INTO micro_hubs (id, organization_id, name, zone, latitude, longitude, storage_capacity_m3, current_occupancy_m3, charging_stations) VALUES
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Central Station Hub', 'Core-Downtown', 40.7128, -74.0060, 50.00, 18.50, 8),
    ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Midtown Distribution Point', 'Midtown-North', 40.7549, -73.9840, 35.00, 12.00, 6),
    ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Riverside Depot', 'Riverside-District', 40.8023, -73.9654, 40.00, 8.75, 5),
    ('b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Campus Express Hub', 'University-Zone', 40.7295, -73.9965, 25.00, 5.00, 4);

-- ── Create Cargo Bikes ──────────────────────────────────────────
INSERT INTO cargo_bikes (id, micro_hub_id, model_name, max_payload_kg, battery_range_km, current_battery_pct, status) VALUES
    -- Central Station Hub bikes
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Class-1-E-Bike', 50.00, 40, 92, 'available'),
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Class-1-E-Bike', 50.00, 40, 78, 'in_transit'),
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Heavy-Cargo-Trike', 120.00, 35, 100, 'available'),
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Heavy-Cargo-Trike', 120.00, 35, 45, 'charging'),
    -- Midtown Hub bikes
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Class-1-E-Bike', 50.00, 40, 85, 'available'),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Class-1-E-Bike', 50.00, 40, 67, 'in_transit'),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Heavy-Cargo-Trike', 120.00, 35, 30, 'charging'),
    -- Riverside Depot bikes
    ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Class-1-E-Bike', 50.00, 40, 95, 'available'),
    ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Heavy-Cargo-Trike', 120.00, 35, 88, 'available'),
    ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Class-1-E-Bike', 50.00, 40, 15, 'maintenance'),
    -- Campus Hub bikes
    ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Class-1-E-Bike', 50.00, 40, 100, 'available'),
    ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Class-1-E-Bike', 50.00, 40, 72, 'available');

-- ── Create Sample Parcels ───────────────────────────────────────
INSERT INTO parcels (organization_id, tracking_number, destination_address, destination_lat, destination_lng, weight_kg, volume_m3, tier, status, assigned_hub_id) VALUES
    -- Parcels at Central Station Hub
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-001', '350 Fifth Ave, New York, NY', 40.7484, -73.9857, 1.20, 0.0050, 'Small', 'at_hub', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-002', '200 Broadway, New York, NY', 40.7105, -74.0075, 4.50, 0.0120, 'Medium', 'at_hub', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-003', '100 Wall St, New York, NY', 40.7053, -74.0073, 15.00, 0.0450, 'Bulk', 'at_hub', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-004', '1 World Trade Center, NY', 40.7127, -74.0134, 0.80, 0.0030, 'Small', 'at_hub', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    -- Parcels at Midtown Hub
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-005', '30 Rockefeller Plaza, NY', 40.7587, -73.9787, 3.20, 0.0080, 'Medium', 'at_hub', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-006', '405 Lexington Ave, NY', 40.7517, -73.9755, 7.50, 0.0200, 'Medium', 'at_hub', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-007', '767 5th Ave, NY', 40.7636, -73.9722, 1.00, 0.0040, 'Small', 'at_hub', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    -- Pending sorting parcels
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-008', '1000 5th Ave, NY', 40.7794, -73.9632, 2.30, 0.0060, 'Medium', 'pending_sorting', NULL),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-009', '525 E 68th St, NY', 40.7650, -73.9539, 12.00, 0.0350, 'Bulk', 'pending_sorting', NULL),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-010', '1 E 161st St, Bronx, NY', 40.8296, -73.9262, 0.50, 0.0020, 'Small', 'pending_sorting', NULL),
    -- Delivered parcels
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-011', '89 E 42nd St, NY', 40.7527, -73.9772, 5.00, 0.0150, 'Medium', 'delivered', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UL-2024-012', '20 W 34th St, NY', 40.7488, -73.9856, 1.50, 0.0040, 'Small', 'delivered', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- ── Create Sample Completed Routes ──────────────────────────────
INSERT INTO delivery_routes (cargo_bike_id, status, total_distance_km, estimated_duration_mins, carbon_saved_kg, route_geometry, created_at) VALUES
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'completed', 8.50, 42, 1.74, '{"waypoints":[{"lat":40.7128,"lng":-74.006,"sequence":1},{"lat":40.7484,"lng":-73.9857,"sequence":2},{"lat":40.7105,"lng":-74.0075,"sequence":3}]}', NOW() - INTERVAL '1 day'),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'completed', 5.20, 28, 1.07, '{"waypoints":[{"lat":40.7549,"lng":-73.984,"sequence":1},{"lat":40.7587,"lng":-73.9787,"sequence":2},{"lat":40.7517,"lng":-73.9755,"sequence":3}]}', NOW() - INTERVAL '1 day'),
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'completed', 12.30, 55, 2.52, '{"waypoints":[{"lat":40.7128,"lng":-74.006,"sequence":1},{"lat":40.7053,"lng":-74.0073,"sequence":2},{"lat":40.7127,"lng":-74.0134,"sequence":3},{"lat":40.7488,"lng":-73.9856,"sequence":4}]}', NOW() - INTERVAL '2 days'),
    ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'completed', 6.80, 35, 1.39, '{"waypoints":[{"lat":40.8023,"lng":-73.9654,"sequence":1},{"lat":40.7794,"lng":-73.9632,"sequence":2}]}', NOW() - INTERVAL '3 days'),
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'completed', 15.00, 70, 3.07, '{"waypoints":[{"lat":40.7128,"lng":-74.006,"sequence":1},{"lat":40.7484,"lng":-73.9857,"sequence":2},{"lat":40.7636,"lng":-73.9722,"sequence":3},{"lat":40.7527,"lng":-73.9772,"sequence":4}]}', NOW() - INTERVAL '4 days'),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'active', 7.40, 38, 1.51, '{"waypoints":[{"lat":40.7549,"lng":-73.984,"sequence":1},{"lat":40.7636,"lng":-73.9722,"sequence":2},{"lat":40.7517,"lng":-73.9755,"sequence":3}]}', NOW());
