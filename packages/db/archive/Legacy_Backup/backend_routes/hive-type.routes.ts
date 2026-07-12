
import { Router } from 'express';
import { getHiveTypes, getHiveTypeById } from '../controllers/hive-type.controller';

const router = Router();

// Routes
router.get('/', getHiveTypes);
router.get('/:id', getHiveTypeById);

export default router;
