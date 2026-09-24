import { Router } from 'express';
import { getHubs, getHubById, createHub, updateHub, deleteHub } from '../controllers/hubs.js';
import { getParcels, createParcel, updateParcelStatus, allocateParcels, deleteParcel } from '../controllers/parcels.js';
import { optimizeRoutes, getRoutes, updateRouteStatus } from '../controllers/routes.js';
import { getCarbonAnalytics, getDashboardMetrics } from '../controllers/analytics.js';
import { queryAdvisor } from '../controllers/advisor.js';
import { getBikes, createBike, updateBike, deleteBike } from '../controllers/bikes.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  CreateHubSchema,
  CreateParcelSchema,
  RouteOptimizeSchema,
  AIAdvisorSchema,
  CreateCargoBikeSchema,
} from '../config/schemas.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ── Hub Routes ──────────────────────────────────────────────────
router.get('/hubs', getHubs);
router.get('/hubs/:id', getHubById);
router.post('/hubs', requireRole('admin', 'dispatcher'), validate(CreateHubSchema), createHub);
router.put('/hubs/:id', requireRole('admin', 'dispatcher'), updateHub);
router.delete('/hubs/:id', requireRole('admin'), deleteHub);

// ── Parcel Routes ───────────────────────────────────────────────
router.get('/parcels', getParcels);
router.post('/parcels', requireRole('admin', 'dispatcher'), validate(CreateParcelSchema), createParcel);
router.put('/parcels/:id/status', requireRole('admin', 'dispatcher', 'rider'), updateParcelStatus);
router.post('/parcels/allocate', requireRole('admin', 'dispatcher'), allocateParcels);
router.delete('/parcels/:id', requireRole('admin'), deleteParcel);

// ── Route Optimization ─────────────────────────────────────────
router.get('/routes', getRoutes);
router.post('/routes/optimize', requireRole('admin', 'dispatcher'), validate(RouteOptimizeSchema), optimizeRoutes);
router.put('/routes/:id/status', requireRole('admin', 'dispatcher', 'rider'), updateRouteStatus);

// ── Cargo Bikes ─────────────────────────────────────────────────
router.get('/bikes', getBikes);
router.post('/bikes', requireRole('admin', 'dispatcher'), validate(CreateCargoBikeSchema), createBike);
router.put('/bikes/:id', requireRole('admin', 'dispatcher'), updateBike);
router.delete('/bikes/:id', requireRole('admin'), deleteBike);

// ── Analytics ───────────────────────────────────────────────────
router.get('/analytics/carbon', getCarbonAnalytics);
router.get('/analytics/dashboard', getDashboardMetrics);

// ── AI Advisor ──────────────────────────────────────────────────
router.post('/ai/advisor', validate(AIAdvisorSchema), queryAdvisor);

export default router;
