/**
 * Kingdom of Bees - Backend Server
 * Main Express Application
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import apiaryRoutes from './routes/apiary.routes';
import hiveRoutes from './routes/hive.routes';
import inspectionRoutes from './routes/inspection.routes';
import feedingRoutes from './routes/feeding.routes';
import harvestRoutes from './routes/harvest.routes';
import diseaseRoutes from './routes/disease.routes';
import queenRoutes from './routes/queen.routes';
import weatherRoutes from './routes/weather.routes';
import plantRoutes from './routes/plant.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { authenticate } from './middleware/auth.middleware';
import { requestLogger } from './middleware/logger.middleware';

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create Express app
const app: Express = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}
app.use(requestLogger);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        supabase: supabaseUrl ? 'configured' : 'not configured',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

// ============================================================================
// API ROUTES
// ============================================================================

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/users', authenticate, userRoutes);
app.use('/api/apiaries', authenticate, apiaryRoutes);
app.use('/api/hives', authenticate, hiveRoutes);
app.use('/api/inspections', authenticate, inspectionRoutes);
app.use('/api/feeding', authenticate, feedingRoutes);
app.use('/api/harvests', authenticate, harvestRoutes);
app.use('/api/diseases', authenticate, diseaseRoutes);
app.use('/api/queens', authenticate, queenRoutes);
app.use('/api/weather', authenticate, weatherRoutes);
app.use('/api/plants', authenticate, plantRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('🚀 Kingdom of Bees API Server');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    console.log(`🔐 Supabase: ${supabaseUrl ? 'Configured' : 'Not configured'}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

