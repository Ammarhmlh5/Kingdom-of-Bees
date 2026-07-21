import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    database: {
        url: process.env.DATABASE_URL!,
    },
    jwt: {
        secret: process.env.JWT_SECRET!,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.REFRESH_TOKEN_SECRET!,
        refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    },
    cors: {
        origin: (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN)?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },
};

// Validate required env vars
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
