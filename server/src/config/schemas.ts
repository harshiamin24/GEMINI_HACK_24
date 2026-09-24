import { z } from 'zod';

// ── Parcel Schemas ──────────────────────────────────────────────
export const CreateParcelSchema = z.object({
  trackingNumber: z.string().min(3, 'Tracking number must be at least 3 characters'),
  destinationAddress: z.string().min(5, 'Destination address must be at least 5 characters'),
  destinationLat: z.number().min(-90).max(90),
  destinationLng: z.number().min(-180).max(180),
  weightKg: z.number().positive('Weight must be positive').max(25, 'Max weight is 25kg'),
  volumeM3: z.number().positive('Volume must be positive'),
  tier: z.enum(['Small', 'Medium', 'Bulk']),
  assignedHubId: z.string().uuid().optional(),
});

export type CreateParcelInput = z.infer<typeof CreateParcelSchema>;

// ── Hub Schemas ─────────────────────────────────────────────────
export const CreateHubSchema = z.object({
  name: z.string().min(2, 'Hub name must be at least 2 characters'),
  zone: z.string().min(2, 'Zone must be at least 2 characters'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  storageCapacityM3: z.number().positive('Storage capacity must be positive'),
  chargingStations: z.number().int().positive('Must have at least 1 charging station'),
});

export type CreateHubInput = z.infer<typeof CreateHubSchema>;

// ── Route Optimization Schema ───────────────────────────────────
export const RouteOptimizeSchema = z.object({
  hubId: z.string().uuid('Invalid hub ID'),
  weatherCondition: z.enum(['Clear', 'Rain', 'Snow', 'High Wind']),
  elevationFactor: z.number().min(0).max(2).default(1.0),
  minBatteryBuffer: z.number().min(5).max(50).default(15),
});

export type RouteOptimizeInput = z.infer<typeof RouteOptimizeSchema>;

// ── AI Advisor Schema ───────────────────────────────────────────
export const AIAdvisorSchema = z.object({
  message: z.string().min(3, 'Message must be at least 3 characters').max(2000),
  context: z.object({
    activeHubs: z.number().optional(),
    totalParcels: z.number().optional(),
    activeBikes: z.number().optional(),
  }).optional(),
});

export type AIAdvisorInput = z.infer<typeof AIAdvisorSchema>;

// ── Allocation Schema ───────────────────────────────────────────
export const AllocateSchema = z.object({
  parcelIds: z.array(z.string().uuid()).min(1, 'Must specify at least one parcel'),
});

export type AllocateInput = z.infer<typeof AllocateSchema>;

// ── Cargo Bike Schema ───────────────────────────────────────────
export const CreateCargoBikeSchema = z.object({
  microHubId: z.string().uuid('Invalid hub ID'),
  modelName: z.string().min(2),
  maxPayloadKg: z.number().positive().max(200),
  batteryRangeKm: z.number().int().positive().max(100),
});

export type CreateCargoBikeInput = z.infer<typeof CreateCargoBikeSchema>;

// ── Settings Schema ─────────────────────────────────────────────
export const UpdateSettingsSchema = z.object({
  organizationName: z.string().min(2).optional(),
  defaultWeatherCondition: z.enum(['Clear', 'Rain', 'Snow', 'High Wind']).optional(),
  defaultMinBatteryBuffer: z.number().min(5).max(50).optional(),
  defaultElevationFactor: z.number().min(0).max(2).optional(),
  carbonFactorKgPerKm: z.number().positive().optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
