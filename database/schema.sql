-- UrbanLogix AI - Database Schema for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Organizations Table ─────────────────────────────────────────
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Users Profile Table ─────────────────────────────────────────
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'dispatcher', 'rider')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Micro-Hubs Table ────────────────────────────────────────────
CREATE TABLE micro_hubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    zone TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    storage_capacity_m3 DECIMAL(8, 2) NOT NULL,
    current_occupancy_m3 DECIMAL(8, 2) DEFAULT 0.00,
    charging_stations INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Cargo Bikes Table ───────────────────────────────────────────
CREATE TABLE cargo_bikes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    micro_hub_id UUID REFERENCES micro_hubs(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    max_payload_kg DECIMAL(6, 2) NOT NULL,
    battery_range_km INTEGER NOT NULL,
    current_battery_pct INTEGER CHECK (current_battery_pct BETWEEN 0 AND 100) DEFAULT 100,
    status TEXT CHECK (status IN ('available', 'in_transit', 'charging', 'maintenance')) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Parcels Table ───────────────────────────────────────────────
CREATE TABLE parcels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    tracking_number TEXT UNIQUE NOT NULL,
    destination_address TEXT NOT NULL,
    destination_lat DECIMAL(10, 8) NOT NULL,
    destination_lng DECIMAL(11, 8) NOT NULL,
    weight_kg DECIMAL(5, 2) NOT NULL,
    volume_m3 DECIMAL(6, 4) NOT NULL,
    tier TEXT CHECK (tier IN ('Small', 'Medium', 'Bulk')) NOT NULL,
    status TEXT CHECK (status IN ('pending_sorting', 'at_hub', 'in_transit', 'delivered')) DEFAULT 'pending_sorting',
    assigned_hub_id UUID REFERENCES micro_hubs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Delivery Routes Table ───────────────────────────────────────
CREATE TABLE delivery_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cargo_bike_id UUID REFERENCES cargo_bikes(id) ON DELETE CASCADE,
    dispatcher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('planned', 'active', 'completed')) DEFAULT 'planned',
    total_distance_km DECIMAL(6, 2) NOT NULL,
    estimated_duration_mins INTEGER NOT NULL,
    carbon_saved_kg DECIMAL(6, 2) NOT NULL,
    route_geometry JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- Row Level Security Policies
-- ══════════════════════════════════════════════════════════════════

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_routes ENABLE ROW LEVEL SECURITY;

-- ── Profiles Policies ───────────────────────────────────────────
CREATE POLICY profiles_own ON profiles
    FOR ALL USING (id = auth.uid());

CREATE POLICY profiles_same_org ON profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- ── Organization Policies ───────────────────────────────────────
CREATE POLICY org_access ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- ── Micro-Hubs Policies ────────────────────────────────────────
CREATE POLICY hub_org_isolation ON micro_hubs
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- ── Cargo Bikes Policies ────────────────────────────────────────
CREATE POLICY bike_hub_access ON cargo_bikes
    FOR ALL USING (
        micro_hub_id IN (
            SELECT id FROM micro_hubs WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- ── Parcels Policies ────────────────────────────────────────────
CREATE POLICY parcel_org_isolation ON parcels
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

-- ── Delivery Routes Policies ────────────────────────────────────
CREATE POLICY route_dispatcher_access ON delivery_routes
    FOR ALL USING (
        cargo_bike_id IN (
            SELECT cb.id FROM cargo_bikes cb
            JOIN micro_hubs mh ON cb.micro_hub_id = mh.id
            WHERE mh.organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- ══════════════════════════════════════════════════════════════════
-- Auto-create profile on user signup trigger
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, role, organization_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'dispatcher'),
        (NEW.raw_user_meta_data->>'organization_id')::UUID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
