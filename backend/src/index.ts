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
import hiveRoutes from './routes/hive.routes';
import diseaseRoutes from './routes/disease.routes';
import feedingRoutes from './routes/feeding.routes';
import queensRoutes from './routes/queens.routes';
import memberRoutes from './routes/member.routes';
import financialsRoutes from './routes/financials.routes';
import apiaryOperationsRoutes from './routes/apiary-operations.routes';
import { settingsRouter, schedulesRouter, apiarySchedulesRouter } from './routes/inspection.routes';
import weatherRoutes from './routes/weather.routes';
import aiRoutes from './routes/ai.routes';
import { startInspectionCronJobs } from './cron/inspection.reminders';
import { startWeatherCronJobs } from './cron/weather';
import { securityHeaders, customSecurity } from './middleware/security.middleware';
import { authRateLimit, apiRateLimit } from './middleware/rate-limit.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { swaggerSpec } from './utils/swagger';
import swaggerUi from 'swagger-ui-express';

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(securityHeaders);
app.use(customSecurity);

// Rate Limiting
app.use('/api/auth', authRateLimit);
app.use('/api', apiRateLimit);

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
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationSettingsRoutes);
app.use('/api', plantRoutes);
app.use('/api/admin/plants', adminPlantRoutes);

// Sub-resource routes (nested under :apiaryId)
app.use('/api/apiaries/:apiaryId/hives', hiveRoutes);
app.use('/api/apiaries/:apiaryId/diseases', diseaseRoutes);
app.use('/api/apiaries/:apiaryId/feeding', feedingRoutes);
app.use('/api/apiaries/:apiaryId/queens', queensRoutes);
app.use('/api/apiaries/:apiaryId/members', memberRoutes);
app.use('/api/apiaries/:apiaryId/financials', financialsRoutes);
app.use('/api/apiaries/:apiaryId/operations', apiaryOperationsRoutes);

// Inspection Settings & Schedules Routes (Global)
app.use('/api/inspection-settings', settingsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/apiaries', apiarySchedulesRouter);

// Cron Jobs
startInspectionCronJobs();
startWeatherCronJobs();

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Kingdom of Bees API Docs',
}));
app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🔒 Auth, Apiary & Operations Routes Active`);
    logger.info(`📊 Daily Operations Tab APIs: /api/operations/*`);
    logger.info(`🧠 Analytics & Predictions API: /api/apiaries/:apiaryId/analytics`);
});

export default app;
