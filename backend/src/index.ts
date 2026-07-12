import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import apiaryRoutes from './routes/apiary.routes';
import operationsRoutes from './routes/operations.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';
import harvestRoutes from './routes/harvest.routes';
import hiveTemplateRoutes from './routes/hive-template.routes';
import alertRoutes from './routes/alert.routes';
import notificationSettingsRoutes from './routes/notification-settings.routes';
import plantRoutes from './routes/plant.routes';
import adminPlantRoutes from './routes/admin-plant.routes';
import { settingsRouter, schedulesRouter, apiarySchedulesRouter } from './routes/inspection.routes';
import { startInspectionCronJobs } from './cron/inspection.reminders';
import { startWeatherCronJobs } from './cron/weather';

const app = express();
const PORT = process.env.PORT || 3001;

// Basic Middleware
app.use((req, _res, next) => {
    logger.info(`[GlobalMiddleware] Incoming ${req.method} ${req.url} from ${req.headers.origin}`);
    next();
});

app.use(cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(cookieParser());

// Legacy/Root
app.get('/', (_req, res) => {
    res.send('Kingdom of Bees Backend v2.0 (Dual-Scope Architecture) - Core Active');
});

// V2 Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/apiaries', apiaryRoutes);
app.use('/api/apiaries', analyticsRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/harvest', harvestRoutes);
app.use('/api/hive-templates', hiveTemplateRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/notifications', notificationSettingsRoutes);
app.use('/api', plantRoutes);
app.use('/api/admin/plants', adminPlantRoutes);

// Inspection Settings & Schedules Routes (Global)
app.use('/api/inspection-settings', settingsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/apiaries', apiarySchedulesRouter);

// Cron Jobs
startInspectionCronJobs();
startWeatherCronJobs();

// Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('[Express Error Handler]', err.stack || err.message || err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🔒 Auth, Apiary & Operations Routes Active`);
    logger.info(`📊 Daily Operations Tab APIs: /api/operations/*`);
    logger.info(`🧠 Analytics & Predictions API: /api/apiaries/:apiaryId/analytics`);
});

export default app;
