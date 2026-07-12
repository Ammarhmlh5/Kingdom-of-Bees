
import { Router } from 'express';
import { FeedingController } from '../controllers/feeding.controller';
import { requireAuth, requireApiaryAccess } from '../middleware/auth.middleware';
import { validate } from '../validators';
import { feedHiveSchema, feedApiarySchema } from '../validators/feeding.schema';

const router = Router({ mergeParams: true });
const controller = new FeedingController();

router.use(requireAuth);
router.use(requireApiaryAccess);

router.get('/', controller.getHistory);
router.get('/types', controller.getTypes);

router.post('/bulk', validate(feedApiarySchema), controller.feedApiary); // POST /apiaries/:id/feeding/bulk
router.post('/', validate(feedHiveSchema), controller.feedHive);       // POST /apiaries/:id/feeding (body has hiveId)

export default router;
