import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply auth to all report routes
router.use(authenticate);

// Dashboard
router.get('/kpis', ReportsController.getDashboardKPIs);

// Stats
router.get('/production', ReportsController.getProductionStats);

// Financials
router.get('/financial', ReportsController.getFinancialSummary);

// Export
router.get('/export', ReportsController.exportReport);

export default router;
