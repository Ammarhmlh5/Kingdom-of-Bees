import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;
const CURRENT_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: "ok" }));
app.get('/api/health_db', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ database: "connected" });
    } catch (e) {
        console.error("Health check error:", e);
        res.status(500).json({ database: "disconnected", error: String(e) });
    }
});

// Auth Dummy
app.use(async (req, res, next) => {
    try {
        const user = await prisma.userProfile.findUnique({ where: { id: CURRENT_USER_ID } });
        if (!user) {
            await prisma.userProfile.create({
                data: {
                    id: CURRENT_USER_ID,
                    authId: "550e8400-e29b-41d4-a716-446655440001",
                    email: "beekeeper@example.com",
                    fullName: "محمود النحال",
                    userType: "OWNER"
                }
            });
        }
        next();
    } catch (e) {
        console.error("Auth init error:", e);
        next();
    }
});

app.get('/api/apiaries', async (req, res) => {
    try {
        const apiaries = await prisma.apiary.findMany({
            where: { ownerId: CURRENT_USER_ID, isActive: true },
            include: { _count: { select: { hives: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(apiaries);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch apiaries" });
    }
});

app.get('/api/hives', async (req, res) => {
    try {
        const hives = await prisma.hive.findMany({
            where: { apiary: { ownerId: CURRENT_USER_ID } },
            include: { apiary: true, _count: { select: { inspections: true, honeyHarvests: true } } },
            orderBy: { hiveNumber: 'asc' }
        });
        res.json(hives);
    } catch (e) {
        console.error("Fetch hives error:", e);
        res.status(500).json({ error: "Failed to fetch hives" });
    }
});

app.get('/api/inspections', async (req, res) => {
    try {
        const inspections = await prisma.inspection.findMany({
            where: { hive: { apiary: { ownerId: CURRENT_USER_ID } } },
            include: { hive: { include: { apiary: true } } },
            orderBy: { inspectionDate: 'desc' }
        });
        res.json(inspections);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch inspections" });
    }
});

app.get('/api/stores', async (req, res) => {
    try {
        // Mocked as requested earlier until full inventory system is implemented
        res.json({
            equipment: [
                { id: 1, type: 'BOXES', count: 45, status: 'GOOD' },
                { id: 2, type: 'FRAMES', count: 320, status: 'NEW' }
            ],
            products: [
                { id: 1, type: 'HONEY', quantity: '120kg', lastHarvest: '2025-12-01' }
            ],
            feedStock: { sugar: '250kg', protein: '40kg' }
        });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch stores" });
    }
});

app.get('/api/harvest', async (req, res) => {
    try {
        const harvests = await (prisma as any).harvestRecord.findMany({
            where: { apiary: { ownerId: CURRENT_USER_ID } },
            include: { apiary: true },
            orderBy: { harvestDate: 'desc' }
        });
        res.json(harvests);
    } catch (e) {
        console.error("Fetch harvests error:", e);
        res.status(500).json({ error: "Failed to fetch harvests" });
    }
});

app.get('/api/feeding', async (req, res) => {
    try {
        const records = await prisma.feedingRecord.findMany({
            where: { hive: { apiary: { ownerId: CURRENT_USER_ID } } },
            include: { hive: { include: { apiary: true } } },
            orderBy: { feedingDate: 'desc' }
        });
        res.json(records);
    } catch (e) {
        console.error("Fetch feeding error:", e);
        res.status(500).json({ error: "Failed to fetch feeding records" });
    }
});

app.get('/api/health_records', async (req, res) => {
    try {
        const records = await prisma.diseaseRecord.findMany({
            where: { apiary: { ownerId: CURRENT_USER_ID } },
            include: { apiary: true, disease: true },
            orderBy: { firstDetectedDate: 'desc' }
        });
        res.json(records);
    } catch (e) {
        console.error("Fetch health records error:", e);
        res.status(500).json({ error: "Failed to fetch health records" });
    }
});

app.post('/api/apiaries', async (req, res) => {
    const data = req.body;
    const apiary = await prisma.apiary.create({
        data: {
            ...data,
            ownerId: CURRENT_USER_ID,
            isActive: true,
            settings: {},
            equipment: {},
            stats: {},
            establishedDate: data.establishedDate ? new Date(data.establishedDate) : null,
        }
    });
    res.json(apiary);
});


// Alerts
app.get('/api/alerts', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        let alerts = await prisma.alert.findMany({
            where: { status: 'ACTIVE' },
            include: { apiary: true, user: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        if (lat && lng && radius) {
            const centerLat = parseFloat(lat as string);
            const centerLng = parseFloat(lng as string);
            const radiusKm = parseFloat(radius as string);

            alerts = alerts.filter(alert => {
                if (!alert.apiary?.locationLat || !alert.apiary?.locationLng) return false;

                // Haversine formula
                const R = 6371; // km
                const dLat = (Number(alert.apiary.locationLat) - centerLat) * Math.PI / 180;
                const dLon = (Number(alert.apiary.locationLng) - centerLng) * Math.PI / 180;
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(centerLat * Math.PI / 180) * Math.cos(Number(alert.apiary.locationLat) * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c;

                return d <= radiusKm;
            });
        }

        res.json(alerts);
    } catch (e) {
        console.error("Fetch alerts error:", e);
        res.status(500).json({ error: "Failed to fetch alerts" });
    }
});

app.post('/api/alerts', async (req, res) => {
    try {
        const { title, message, alertType, priority, apiaryId, hiveId } = req.body;

        let prismaPriority = 'URGENT';
        if (priority === 'HIGH') prismaPriority = 'IMMEDIATE';
        else if (priority === 'MEDIUM') prismaPriority = 'SOON';
        else if (priority === 'LOW') prismaPriority = 'ROUTINE';
        else if (priority) prismaPriority = priority;

        const alert = await prisma.alert.create({
            data: {
                title,
                message,
                alertType: alertType || 'DISEASE',
                priority: prismaPriority as any,
                userId: CURRENT_USER_ID,
                apiaryId,
                hiveId,
                status: 'ACTIVE',
                actionRequired: true
            }
        });
        res.json(alert);
    } catch (e) {
        console.error("Create alert error:", e);
        res.status(500).json({ error: "Failed to create alert" });
    }
});

app.put('/api/alerts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const alert = await prisma.alert.update({
            where: { id },
            data: {
                status,
                resolvedAt: status === 'RESOLVED' ? new Date() : null,
                acknowledgedBy: CURRENT_USER_ID // Simplified assumption
            }
        });
        res.json(alert);
    } catch (e) {
        console.error("Update alert error:", e);
        res.status(500).json({ error: "Failed to update alert" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 API Server running at http://localhost:${PORT}`);
});
