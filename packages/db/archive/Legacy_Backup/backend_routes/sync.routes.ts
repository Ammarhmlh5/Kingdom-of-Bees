import { Router } from 'express';
import { SyncService } from '../services/sync.service';

const router = Router();

// POST /api/sync/push
router.post('/push', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const { events } = req.body;

        if (!events || !Array.isArray(events)) {
            return res.status(400).json({ message: 'Invalid events data' });
        }

        const results = await SyncService.processSyncEvents(userId, events);
        res.json({ results });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
