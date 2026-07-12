import { Router } from 'express';
import authRoutes from './auth.routes';
import apiaryRoutes from './apiary.routes';
import alertRoutes from './alert.routes';
import hiveRoutes from './hive.routes';
import inspectionRoutes from './inspection.routes';
import adminRoutes from './admin.routes';
import hiveTemplateRoutes from './hive-template.routes';
import aiRoutes from './ai.routes';
import iotRoutes from './iot.routes';
import traceabilityRoutes from './traceability.routes';
import hiveTypeRoutes from './hive-type.routes';
import beeBreedRoutes from './bee-breed.routes';
import diseaseRoutes from './disease.routes';
import feedingRoutes from './feeding.routes';
import operationsRoutes from './operations.routes';
import harvestRoutes from './harvest.routes';
import notificationRoutes from './notification.routes';
import frameRoutes from './frame.routes';
import analysisRoutes from './analysis.routes';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireBeekeeper } from '../middleware/role.middleware';

// NEW: Apiary-scoped routes
import apiaryScopedRoutes from './apiary-scoped.routes';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/iot', iotRoutes); // IoT often needs public access for webhooks (with API Key auth usually, but public route for now)

// Admin only routes
router.use('/admin', authenticate, requireAdmin, adminRoutes);

// ============================================================================
// NEW APIARY-SCOPED ROUTES (Recommended pattern)
// ============================================================================
router.use('/apiaries/:apiaryId', authenticate, requireBeekeeper, apiaryScopedRoutes);

// ============================================================================
// LEGACY ROUTES (Keep for backward compatibility, will deprecate later)
// ============================================================================
// Beekeeper routes (ADMIN, BEEKEEPER, TEAM_MEMBER)
router.use('/apiaries', authenticate, requireBeekeeper, apiaryRoutes);
router.use('/alerts', authenticate, requireBeekeeper, alertRoutes);
router.use('/hives', authenticate, requireBeekeeper, hiveRoutes);
router.use('/inspections', authenticate, requireBeekeeper, inspectionRoutes);
router.use('/hive-templates', authenticate, requireBeekeeper, hiveTemplateRoutes);
router.use('/ai', authenticate, requireBeekeeper, aiRoutes);
router.use('/hive-types', authenticate, requireBeekeeper, hiveTypeRoutes);
router.use('/bee-breeds', authenticate, requireBeekeeper, beeBreedRoutes);
router.use('/diseases', authenticate, requireBeekeeper, diseaseRoutes);
router.use('/feeding', authenticate, requireBeekeeper, feedingRoutes);
// Sprint 4, 5, 6 Routes
import reportRoutes from './reports.routes';
import queenRoutes from './queen.routes';
import nucleusRoutes from './nucleus.routes';
// operationsRoutes is already imported above

import environmentRoutes from './environment.routes';

import syncRoutes from './sync.routes';

router.use('/reports', authenticate, requireBeekeeper, reportRoutes);
router.use('/queens', authenticate, requireBeekeeper, queenRoutes);
router.use('/nuclei', authenticate, requireBeekeeper, nucleusRoutes);
router.use('/operations', authenticate, requireBeekeeper, operationsRoutes);
router.use('/environment', authenticate, requireBeekeeper, environmentRoutes); // Sprint 8
router.use('/harvests', authenticate, requireBeekeeper, harvestRoutes); // Sprint 9
router.use('/notifications', authenticate, requireBeekeeper, notificationRoutes);
router.use('/sync', authenticate, syncRoutes); // Mobile Sync
router.use('/frames', authenticate, requireBeekeeper, frameRoutes); // Frame Management System
router.use('/analysis', authenticate, requireBeekeeper, analysisRoutes); // Hive Analysis

// Traceability (mix of public and private, middleware inside routes file)
router.use('/traceability', traceabilityRoutes);

export default router;
